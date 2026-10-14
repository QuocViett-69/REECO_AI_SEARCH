import { Injectable, Logger } from '@nestjs/common';
import { configuration } from '../../config/configuration';
import { withSearchDeadline } from './search-deadline';
import {
  KeywordSearchService,
  type KeywordSearchRow,
} from './keyword-search.service';
import { SearchScoreService } from './search-score.service';
import {
  SemanticSearchService,
  type SemanticSearchCandidate,
} from './semantic-search.service';

export type HybridSearchMode =
  'hybrid' | 'keyword_fallback' | 'semantic_fallback';

export type HybridSearchErrorCode =
  'HYBRID_RETRIEVAL_FAILED' | 'HYBRID_CONFIG_INVALID';

export class HybridSearchError extends Error {
  constructor(
    readonly code: HybridSearchErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'HybridSearchError';
  }
}

export interface HybridSearchCandidate {
  productId: string;
  model: string;
  productNameEn: string;
  keywordRank: number | null;
  semanticRank: number | null;
  keywordScore: number | null;
  semanticScore: number | null;
  rrfScore: number;
  matchedBy: {
    keyword: boolean;
    semantic: boolean;
  };
}

export interface HybridSearchResult {
  mode: HybridSearchMode;
  candidates: HybridSearchCandidate[];
  diagnostics: {
    keywordSucceeded: boolean;
    semanticSucceeded: boolean;
    keywordCount: number;
    semanticCount: number;
    unionCount: number;
  };
}

@Injectable()
export class HybridSearchService {
  private readonly logger = new Logger(HybridSearchService.name);
  private readonly defaultRetrievalLimit =
    configuration().search.retrievalLimit;

  constructor(
    private readonly keywordSearch: KeywordSearchService,
    private readonly semanticSearch: SemanticSearchService,
    private readonly searchScore: SearchScoreService,
  ) {}

  async search(query: string, limit?: number): Promise<HybridSearchResult> {
    const retrievalLimit = this.normalizeLimit(limit);
    const [keywordResult, semanticResult] = await Promise.allSettled([
      withSearchDeadline(signal => this.keywordSearch.search(query, retrievalLimit, signal), 15000),
      withSearchDeadline(signal => this.semanticSearch.search(query, retrievalLimit, signal), 15000),
    ]);
    const keywordSucceeded = keywordResult.status === 'fulfilled';
    const semanticSucceeded = semanticResult.status === 'fulfilled';
    if (!keywordSucceeded || !semanticSucceeded) {
      const status = (result: PromiseSettledResult<unknown>) => result.status === 'fulfilled' ? 'success'
        : result.reason instanceof Error && result.reason.name === 'TimeoutError' ? 'timeout' : 'error';
      this.logger.warn(JSON.stringify({ event: 'retrieval_degraded', keyword: status(keywordResult), semantic: status(semanticResult) }));
    }

    if (!keywordSucceeded && !semanticSucceeded) {
      throw new HybridSearchError(
        'HYBRID_RETRIEVAL_FAILED',
        'Hybrid retrieval is temporarily unavailable',
        {
          cause: new AggregateError(
            [keywordResult.reason, semanticResult.reason],
            'Both hybrid retrieval sources failed',
          ),
        },
      );
    }

    const keywordRows = keywordSucceeded ? keywordResult.value : [];
    const semanticCandidates = semanticSucceeded ? semanticResult.value : [];
    const mode: HybridSearchMode = keywordSucceeded
      ? semanticSucceeded
        ? 'hybrid'
        : 'keyword_fallback'
      : 'semantic_fallback';
    const candidates = this.fuseCandidates(
      keywordRows,
      semanticCandidates,
      mode,
    );

    return {
      mode,
      candidates,
      diagnostics: {
        keywordSucceeded,
        semanticSucceeded,
        keywordCount: keywordRows.length,
        semanticCount: semanticCandidates.length,
        unionCount: candidates.length,
      },
    };
  }

  private normalizeLimit(limit: number | undefined): number {
    const candidate = limit ?? this.defaultRetrievalLimit;
    if (!Number.isSafeInteger(candidate)) {
      throw new HybridSearchError(
        'HYBRID_CONFIG_INVALID',
        'Hybrid retrieval limit must be an integer',
      );
    }
    return Math.min(100, Math.max(1, candidate));
  }

  private fuseCandidates(
    keywordRows: KeywordSearchRow[],
    semanticCandidates: SemanticSearchCandidate[],
    mode: HybridSearchMode,
  ): HybridSearchCandidate[] {
    const candidates = new Map<string, HybridSearchCandidate>();

    for (let index = 0; index < keywordRows.length; index += 1) {
      const row = keywordRows[index]!;
      if (candidates.has(row.product_id)) continue;
      const keywordRank = index + 1;
      candidates.set(row.product_id, {
        productId: row.product_id,
        model: row.model,
        productNameEn: row.product_name_en,
        keywordRank,
        semanticRank: null,
        keywordScore: row.rank,
        semanticScore: null,
        rrfScore: this.searchScore.calculateRrfScore(keywordRank, null),
        matchedBy: { keyword: true, semantic: false },
      });
    }

    for (const semantic of semanticCandidates) {
      const existing = candidates.get(semantic.productId);
      if (existing) {
        if (existing.semanticRank !== null) continue;
        existing.semanticRank = semantic.rank;
        existing.semanticScore = semantic.similarity;
        existing.matchedBy.semantic = true;
        existing.rrfScore = this.searchScore.calculateRrfScore(
          existing.keywordRank,
          semantic.rank,
        );
      } else {
        candidates.set(semantic.productId, {
          productId: semantic.productId,
          model: semantic.model,
          productNameEn: semantic.productNameEn,
          keywordRank: null,
          semanticRank: semantic.rank,
          keywordScore: null,
          semanticScore: semantic.similarity,
          rrfScore: this.searchScore.calculateRrfScore(null, semantic.rank),
          matchedBy: { keyword: false, semantic: true },
        });
      }
    }

    const result = [...candidates.values()];
    if (mode === 'keyword_fallback') {
      return result.sort(
        (left, right) => left.keywordRank! - right.keywordRank!,
      );
    }
    if (mode === 'semantic_fallback') {
      return result.sort(
        (left, right) => left.semanticRank! - right.semanticRank!,
      );
    }
    return result.sort((left, right) =>
      this.searchScore.compareHybridCandidates(left, right),
    );
  }
}
