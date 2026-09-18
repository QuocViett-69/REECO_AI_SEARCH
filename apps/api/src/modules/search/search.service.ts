import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  SearchResponseSchema,
  type SearchRequest,
  type SearchResponse,
} from '@reeco/shared';
import { configuration } from '../../config/configuration';
import { ProductsService } from '../products/products.service';
import {
  HybridSearchError,
  HybridSearchService,
  type HybridSearchCandidate,
  type HybridSearchMode,
} from './hybrid-search.service';
import { TechnicalMatchService } from './technical-match.service';
import type { ParsedTechnicalQuery } from './technical-query-parser.service';
import { TechnicalQueryParserService } from './technical-query-parser.service';
import {
  TechnicalRankingService,
  type TechnicalRankedCandidate,
} from './technical-ranking.service';

@Injectable()
export class SearchService {
  private readonly configuredRetrievalLimit =
    configuration().search.retrievalLimit;

  constructor(
    private readonly hybridSearch: HybridSearchService,
    private readonly productsService: ProductsService,
    private readonly technicalQueryParser: TechnicalQueryParserService,
    private readonly technicalMatch: TechnicalMatchService,
    private readonly technicalRanking: TechnicalRankingService,
  ) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const retrievalLimit = Math.min(
      100,
      Math.max(1, this.configuredRetrievalLimit, request.limit),
    );
    let hybridResult: Awaited<ReturnType<HybridSearchService['search']>>;
    try {
      hybridResult = await this.hybridSearch.search(
        request.query,
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

    if (hybridResult.candidates.length === 0) {
      return SearchResponseSchema.parse({
        query: request.query,
        mode: this.mapMode(hybridResult.mode),
        results: [],
      });
    }

    const identityCatalog =
      await this.productsService.getActiveTechnicalIdentityCatalog();
    const parsedQuery = this.technicalQueryParser.parse(
      request.query,
      identityCatalog,
    );
    const rankedCandidates = await this.applyTechnicalPolicy(
      parsedQuery,
      hybridResult.candidates,
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
      mode: this.mapMode(hybridResult.mode),
      results,
    });
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
    return this.technicalRanking.rank(candidates, matches);
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
