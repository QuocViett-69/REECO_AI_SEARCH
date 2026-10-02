import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  SearchResponseSchema,
  type SearchRequest,
  type SearchResponse,
  type ProductSearchDocument,
  type ProductSpecification,
} from '@reeco/shared';
import { configuration } from '../../config/configuration';
import { ProductsService } from '../products/products.service';
import { hasTechnicalConstraint, parseNegativeConstraints, resolveConversationQuery } from './conversation-query';
import { ExplanationService } from './explanation.service';
import {
  HybridSearchError,
  HybridSearchService,
  type HybridSearchCandidate,
  type HybridSearchMode,
} from './hybrid-search.service';
import { TechnicalMatchService } from './technical-match.service';
import { RerankerService } from './reranker.service';
import type { ParsedTechnicalQuery } from './technical-query-parser.service';
import { TechnicalQueryParserService } from './technical-query-parser.service';
import { parseSearchIntent, matchSearchIntent } from './search-intent';
import {
  TechnicalRankingService,
  type TechnicalRankedCandidate,
} from './technical-ranking.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly configuredRetrievalLimit =
    configuration().search.retrievalLimit;

  constructor(
    private readonly hybridSearch: HybridSearchService,
    private readonly productsService: ProductsService,
    private readonly technicalQueryParser: TechnicalQueryParserService,
    private readonly technicalMatch: TechnicalMatchService,
    private readonly technicalRanking: TechnicalRankingService,
    private readonly reranker: RerankerService,
    private readonly explanation: ExplanationService,
  ) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    try {
      return await this.searchOnce(request);
    } catch (error) {
      if (!(error instanceof ServiceUnavailableException)) throw error;
      // Search is read-only. One bounded retry covers transient database/retrieval failures.
      this.logger.warn('Search dependency unavailable; retrying once');
      return this.searchOnce(request);
    }
  }

  private async searchOnce(request: SearchRequest): Promise<SearchResponse> {
    const negative = parseNegativeConstraints(request.query);
    if (negative.unsupported) {
      throw new BadRequestException('Negative search constraints are not supported');
    }
    if (!negative.query && !request.context) {
      throw new BadRequestException('A positive search term is required with exclusions');
    }
    const resolution = negative.query
      ? resolveConversationQuery(negative.query, request.context)
      : { query: request.context?.previous_query ?? '', applied: !!request.context };
    const searchQuery = resolution.query;
    const retrievalQuery = resolution.applied && hasTechnicalConstraint(request.query)
      ? request.context!.base_query
      : searchQuery;
    const retrievalLimit = Math.min(
      100,
      Math.max(1, this.configuredRetrievalLimit, request.limit),
    );
    let hybridResult: Awaited<ReturnType<HybridSearchService['search']>>;
    try {
      hybridResult = await this.hybridSearch.search(
        retrievalQuery,
        retrievalLimit,
      );
    } catch (error) {
      if (
        error instanceof HybridSearchError &&
        error.code === 'HYBRID_RETRIEVAL_FAILED'
      ) {
        throw new ServiceUnavailableException(
          'Search is temporarily unavailable',
        );
      }
      throw error;
    }

    let scopedCandidates = resolution.applied && request.context
      ? hybridResult.candidates.filter((candidate) =>
          request.context!.product_ids.includes(candidate.productId),
        )
      : hybridResult.candidates;

    const intent = parseSearchIntent(searchQuery);
    let documents: Map<string, ProductSearchDocument> | undefined;
    let environmentalSpecifications = new Map<string, ProductSpecification[]>();
    const hasExclusions = negative.exclusions.protocols.length > 0 || negative.exclusions.cellular || negative.exclusions.temperature;
    if ((intent.constrained || hasExclusions) && scopedCandidates.length > 0) {
      const ids = scopedCandidates.map((item) => item.productId);
      [documents, environmentalSpecifications] = await Promise.all([
        this.productsService.getSearchDocumentsByIds(ids),
        intent.specifications.length > 0
          ? this.productsService.getTechnicalEvidenceByIds(ids).then(rows => new Map([...rows].map(([id, row]) => [id, row.specifications])))
          : intent.outdoor ? this.productsService.getEnvironmentalSpecificationsByIds(ids) : Promise.resolve(environmentalSpecifications),
      ]);
      scopedCandidates = scopedCandidates.filter((candidate) => {
        const document = documents!.get(candidate.productId);
        if (!document || matchSearchIntent(intent, document, environmentalSpecifications.get(candidate.productId)) === null) return false;
        const communicationOption = document.variants?.find((variant) => variant.model === document.model)
          ?.distinguishing_specifications.find((specification) => specification.name_en === 'Communication Option')?.value_raw;
        const cellular = /\b(?:cellular|lte|[345]g)\b/iu.test(document.taxonomy.device_type + ' ' + (document.supported_protocols ?? []).join(' '));
        const temperature = /temperature/iu.test(document.taxonomy.device_type + ' ' + (document.measurements ?? []).map((item) => item.key).join(' ') + ' ' + (document.capabilities ?? []).map((item) => item.key).join(' '));
        const excludedProtocol = negative.exclusions.protocols.some((protocol) => {
          if (protocol === 'Wi-Fi' && communicationOption && !/^wi[\s-]?fi$/iu.test(communicationOption)) return false;
          return (document.supported_protocols ?? []).some((supported) => protocol === 'Modbus'
            ? supported === 'Modbus' || supported.startsWith('Modbus ')
            : supported === protocol);
        });
        return !(excludedProtocol || negative.exclusions.cellular && cellular || negative.exclusions.temperature && temperature);
      });
    }

    if (scopedCandidates.length === 0) {
      return SearchResponseSchema.parse({
        query: request.query,
        ...(request.context && { resolved_query: searchQuery, context_applied: resolution.applied }),
        mode: this.mapMode(hybridResult.mode),
        results: [],
      });
    }

    const identityCatalog =
      await this.productsService.getActiveTechnicalIdentityCatalog();
    const parsedQuery = this.technicalQueryParser.parse(
      searchQuery,
      identityCatalog,
    );
    const technicallyRankedCandidates = await this.applyTechnicalPolicy(
      parsedQuery,
      scopedCandidates,
    );
    const rankedCandidates = await this.reranker.rerank(
      searchQuery,
      parsedQuery,
      technicallyRankedCandidates,
    );

    const summaries = await this.productsService.getPublicSummariesByIds(
      rankedCandidates.map((ranked) => ranked.candidate.productId),
    );

    const identityCandidates = parsedQuery.identity
      ? rankedCandidates.filter(item => item.candidate.productId === parsedQuery.identity!.productId)
      : rankedCandidates;
    const results = identityCandidates
      .flatMap((ranked) => {
        const candidate = ranked.candidate;
        const product = summaries.get(candidate.productId);
        if (!product) return [];
        return [
          {
            product_id: product.product_id,
            model: product.model,
            name_en: product.name_en,
            name_vi: product.name_vi,
            category: product.category,
            device_type: product.device_type,
            image_url: product.image_url,
            matched_features: ranked.matchedFeatures,
            scores: this.mapScores(candidate, hybridResult.mode),
          },
        ];
      })
      .slice(0, request.limit);

    return SearchResponseSchema.parse({
      query: request.query,
      ...(request.context && { resolved_query: searchQuery, context_applied: resolution.applied }),
      mode: this.mapMode(hybridResult.mode),
      results: request.explain
        ? await this.withExplanations(searchQuery, parsedQuery, results, documents, environmentalSpecifications)
        : results,
    });
  }

  private async withExplanations(
    query: string,
    parsedQuery: ParsedTechnicalQuery,
    results: SearchResponse['results'],
    knownDocuments?: Map<string, ProductSearchDocument>,
    environmentalSpecifications = new Map<string, ProductSpecification[]>(),
  ): Promise<SearchResponse['results']> {
    if (results.length === 0) return results;
    const ids = results.map((item) => item.product_id);
    try {
      const [documents, matches] = await Promise.all([
        knownDocuments ?? this.productsService.getSearchDocumentsByIds(ids),
        this.hasApplicableTechnicalSignal(parsedQuery)
          ? this.technicalMatch.evaluate(parsedQuery, ids)
          : Promise.resolve([]),
      ]);
      const matchesById = new Map(matches.map((item) => [item.productId, item]));
      const explainable = results.flatMap((result) => {
        const document = documents.get(result.product_id);
        return document ? [{ productId: result.product_id, document, match: matchesById.get(result.product_id), specifications: environmentalSpecifications.get(result.product_id) }] : [];
      });
      const generated = await this.explanation.explainMany(query, explainable);
      const explanationsById = new Map(explainable.map((item, index) => [item.productId, generated[index]]));
      return results.map((result) => {
        const explanation = explanationsById.get(result.product_id);
        return explanation ? { ...result, explanation } : result;
      });
    } catch {
      this.logger.warn('Search explanations unavailable; returning ranked results');
      return results;
    }
  }

  private async applyTechnicalPolicy(
    parsedQuery: ParsedTechnicalQuery,
    candidates: HybridSearchCandidate[],
  ): Promise<TechnicalRankedCandidate[]> {
    if (!this.hasApplicableTechnicalSignal(parsedQuery)) {
      return this.technicalRanking.preserve(candidates);
    }
    const matches = await this.technicalMatch.evaluate(
      parsedQuery,
      candidates.map((candidate) => candidate.productId),
    );
    const allowed = new Set(matches.filter((match) =>
          match.protocolMatches.every((item) => item.result === 'MATCH') &&
          match.temperatureMatches
            .filter((item) => item.constraint.confidence === 'high')
            .every((item) => item.result === 'MATCH'),
        ).map((match) => match.productId));
    return this.technicalRanking.rank(
      candidates.filter((item) => allowed.has(item.productId)),
      matches,
    );
  }

  private hasApplicableTechnicalSignal(
    parsedQuery: ParsedTechnicalQuery,
  ): boolean {
    return (
      parsedQuery.confidence.identity === 'high' ||
      parsedQuery.confidence.protocol === 'high' ||
      parsedQuery.temperatureConstraints.some(
        (constraint) =>
          constraint.confidence === 'high' && constraint.intent !== 'ambiguous',
      )
    );
  }

  private mapMode(mode: HybridSearchMode): SearchResponse['mode'] {
    if (mode === 'keyword_fallback') return 'keyword';
    if (mode === 'semantic_fallback') return 'semantic';
    return 'hybrid';
  }

  private mapScores(
    candidate: HybridSearchCandidate,
    mode: HybridSearchMode,
  ): SearchResponse['results'][number]['scores'] {
    if (mode === 'keyword_fallback') {
      return {
        keyword: candidate.keywordScore ?? 0,
        semantic: null,
        hybrid: null,
        rerank: null,
      };
    }
    if (mode === 'semantic_fallback') {
      return {
        keyword: 0,
        semantic: candidate.semanticScore,
        hybrid: null,
        rerank: null,
      };
    }
    return {
      keyword: candidate.keywordScore ?? 0,
      semantic: candidate.semanticScore,
      hybrid: candidate.rrfScore,
      rerank: null,
    };
  }
}
