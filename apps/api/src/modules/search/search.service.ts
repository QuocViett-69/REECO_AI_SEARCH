import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  SearchResponseSchema,
  type SearchRequest,
  type SearchResponse,
} from '@reeco/shared';
import { configuration } from '../../config/configuration';
import { ProductsService } from '../products/products.service';
import { hasTechnicalConstraint, hasUnsupportedNegativeConstraint, resolveConversationQuery } from './conversation-query';
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
    if (hasUnsupportedNegativeConstraint(request.query)) {
      throw new BadRequestException('Negative search constraints are not supported');
    }
    const resolution = resolveConversationQuery(request.query, request.context);
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

    const scopedCandidates = resolution.applied && request.context
      ? hybridResult.candidates.filter((candidate) =>
          request.context!.product_ids.includes(candidate.productId),
        )
      : hybridResult.candidates;

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
      resolution.applied,
    );
    const rankedCandidates = await this.reranker.rerank(
      searchQuery,
      parsedQuery,
      technicallyRankedCandidates,
    );

    const summaries = await this.productsService.getPublicSummariesByIds(
      rankedCandidates.map((ranked) => ranked.candidate.productId),
    );

    const results = rankedCandidates
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
        ? await this.withExplanations(searchQuery, parsedQuery, results)
        : results,
    });
  }

  private async withExplanations(
    query: string,
    parsedQuery: ParsedTechnicalQuery,
    results: SearchResponse['results'],
  ): Promise<SearchResponse['results']> {
    if (results.length === 0) return results;
    const ids = results.map((item) => item.product_id);
    try {
      const [documents, matches] = await Promise.all([
        this.productsService.getSearchDocumentsByIds(ids),
        this.hasApplicableTechnicalSignal(parsedQuery)
          ? this.technicalMatch.evaluate(parsedQuery, ids)
          : Promise.resolve([]),
      ]);
      const matchesById = new Map(matches.map((item) => [item.productId, item]));
      return results.map((result) => {
        const document = documents.get(result.product_id);
        return document
          ? {
              ...result,
              explanation: this.explanation.explain(
                query,
                document,
                matchesById.get(result.product_id),
              ),
            }
          : result;
      });
    } catch {
      this.logger.warn('Search explanations unavailable; returning ranked results');
      return results;
    }
  }

  private async applyTechnicalPolicy(
    parsedQuery: ParsedTechnicalQuery,
    candidates: HybridSearchCandidate[],
    confirmedOnly = false,
  ): Promise<TechnicalRankedCandidate[]> {
    if (!this.hasApplicableTechnicalSignal(parsedQuery)) {
      return this.technicalRanking.preserve(candidates);
    }
    const matches = await this.technicalMatch.evaluate(
      parsedQuery,
      candidates.map((candidate) => candidate.productId),
    );
    const allowed = confirmedOnly
      ? new Set(matches.filter((match) =>
          match.protocolMatches.every((item) => item.result === 'MATCH') &&
          match.temperatureMatches
            .filter((item) => item.constraint.confidence === 'high')
            .every((item) => item.result === 'MATCH'),
        ).map((match) => match.productId))
      : null;
    return this.technicalRanking.rank(
      allowed ? candidates.filter((item) => allowed.has(item.productId)) : candidates,
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
