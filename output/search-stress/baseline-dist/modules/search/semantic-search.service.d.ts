import { SupabaseService } from '../../database/supabase/supabase.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
export type SemanticSearchErrorCode = 'SEMANTIC_QUERY_INVALID' | 'SEMANTIC_EMBEDDING_UNAVAILABLE' | 'SEMANTIC_RPC_FAILED' | 'SEMANTIC_RPC_INVALID_RESPONSE' | 'SEMANTIC_CONFIG_INVALID';
export declare class SemanticSearchError extends Error {
    readonly code: SemanticSearchErrorCode;
    constructor(code: SemanticSearchErrorCode, message: string, options?: ErrorOptions);
}
export interface SemanticSearchCandidate {
    productId: string;
    model: string;
    productNameEn: string;
    similarity: number;
    rank: number;
}
export declare class SemanticSearchService {
    private readonly embeddings;
    private readonly supabase;
    private readonly defaultRetrievalLimit;
    constructor(embeddings: EmbeddingsService, supabase: SupabaseService);
    search(query: unknown, limit?: number): Promise<SemanticSearchCandidate[]>;
    private normalizeQuery;
    private normalizeLimit;
    private getEmbeddingMetadata;
    private embedQuery;
    private validateResponse;
    private isValidRpcRow;
    private throwInvalidResponse;
}
