import { KeywordSearchService } from './keyword-search.service';
import { SearchScoreService } from './search-score.service';
import { SemanticSearchService } from './semantic-search.service';
export type HybridSearchMode = 'hybrid' | 'keyword_fallback' | 'semantic_fallback';
export type HybridSearchErrorCode = 'HYBRID_RETRIEVAL_FAILED' | 'HYBRID_CONFIG_INVALID';
export declare class HybridSearchError extends Error {
    readonly code: HybridSearchErrorCode;
    constructor(code: HybridSearchErrorCode, message: string, options?: ErrorOptions);
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
export declare class HybridSearchService {
    private readonly keywordSearch;
    private readonly semanticSearch;
    private readonly searchScore;
    private readonly defaultRetrievalLimit;
    constructor(keywordSearch: KeywordSearchService, semanticSearch: SemanticSearchService, searchScore: SearchScoreService);
    search(query: string, limit?: number): Promise<HybridSearchResult>;
    private normalizeLimit;
    private fuseCandidates;
}
