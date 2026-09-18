import { Injectable } from '@nestjs/common';
import { OLLAMA_EMBEDDING_DIMENSIONS } from '../../ai/ollama-embedding.provider';
import { configuration } from '../../config/configuration';
import { SupabaseService } from '../../database/supabase/supabase.service';
import {
  EmbeddingsService,
  type EmbeddingConfigurationMetadata,
} from '../embeddings/embeddings.service';

export type SemanticSearchErrorCode =
  | 'SEMANTIC_QUERY_INVALID'
  | 'SEMANTIC_EMBEDDING_UNAVAILABLE'
  | 'SEMANTIC_RPC_FAILED'
  | 'SEMANTIC_RPC_INVALID_RESPONSE'
  | 'SEMANTIC_CONFIG_INVALID';

export class SemanticSearchError extends Error {
  constructor(
    readonly code: SemanticSearchErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'SemanticSearchError';
  }
}

export interface SemanticSearchCandidate {
  productId: string;
  model: string;
  productNameEn: string;
  similarity: number;
  rank: number;
}

interface SemanticSearchRpcRow {
  product_id: string;
  model: string;
  product_name_en: string;
  similarity: number;
}

@Injectable()
export class SemanticSearchService {
  private readonly defaultRetrievalLimit =
    configuration().search.retrievalLimit;

  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly supabase: SupabaseService,
  ) {}

  async search(
    query: unknown,
    limit?: number,
  ): Promise<SemanticSearchCandidate[]> {
    const normalizedQuery = this.normalizeQuery(query);
    const retrievalLimit = this.normalizeLimit(limit);
    const metadata = this.getEmbeddingMetadata();
    const queryEmbedding = await this.embedQuery(normalizedQuery, metadata);

    let response: Awaited<
      ReturnType<ReturnType<SupabaseService['getClient']>['rpc']>
    >;
    try {
      response = await this.supabase
        .getClient()
        .rpc('search_products_semantic', {
          query_embedding: queryEmbedding,
          required_embedding_model: metadata.model,
          required_embedding_version: metadata.version,
          result_limit: retrievalLimit,
        });
    } catch (cause) {
      throw new SemanticSearchError(
        'SEMANTIC_RPC_FAILED',
        'Semantic search is temporarily unavailable',
        { cause },
      );
    }
    if (response.error) {
      throw new SemanticSearchError(
        'SEMANTIC_RPC_FAILED',
        'Semantic search is temporarily unavailable',
        { cause: response.error },
      );
    }

    return this.validateResponse(response.data);
  }

  private normalizeQuery(query: unknown): string {
    if (typeof query !== 'string' || query.trim().length === 0) {
      throw new SemanticSearchError(
        'SEMANTIC_QUERY_INVALID',
        'Semantic search query must be a non-empty string',
      );
    }
    return query.trim();
  }

  private normalizeLimit(limit: number | undefined): number {
    const candidate = limit ?? this.defaultRetrievalLimit;
    if (!Number.isSafeInteger(candidate)) {
      throw new SemanticSearchError(
        'SEMANTIC_CONFIG_INVALID',
        'Semantic retrieval limit must be an integer',
      );
    }
    return Math.min(100, Math.max(1, candidate));
  }

  private getEmbeddingMetadata(): EmbeddingConfigurationMetadata {
    let metadata: EmbeddingConfigurationMetadata;
    try {
      metadata = this.embeddings.getConfigurationMetadata();
    } catch (cause) {
      throw new SemanticSearchError(
        'SEMANTIC_CONFIG_INVALID',
        'Semantic embedding configuration is invalid',
        { cause },
      );
    }
    if (
      metadata.dimensions !== OLLAMA_EMBEDDING_DIMENSIONS ||
      metadata.model.trim().length === 0 ||
      metadata.version.trim().length === 0
    ) {
      throw new SemanticSearchError(
        'SEMANTIC_CONFIG_INVALID',
        'Semantic embedding configuration is invalid',
      );
    }
    return metadata;
  }

  private async embedQuery(
    query: string,
    metadata: EmbeddingConfigurationMetadata,
  ): Promise<number[]> {
    let embedding: number[];
    try {
      embedding = await this.embeddings.embedQuery(query);
    } catch (cause) {
      throw new SemanticSearchError(
        'SEMANTIC_EMBEDDING_UNAVAILABLE',
        'Semantic embedding is temporarily unavailable',
        { cause },
      );
    }
    if (!Array.isArray(embedding) || embedding.length !== metadata.dimensions) {
      throw new SemanticSearchError(
        'SEMANTIC_EMBEDDING_UNAVAILABLE',
        'Semantic embedding is temporarily unavailable',
      );
    }
    return embedding;
  }

  private validateResponse(value: unknown): SemanticSearchCandidate[] {
    if (value === null) return [];
    if (!Array.isArray(value)) this.throwInvalidResponse();

    const productIds = new Set<string>();
    return value.map((candidate, index) => {
      if (!this.isValidRpcRow(candidate)) this.throwInvalidResponse();
      const row = candidate as SemanticSearchRpcRow;
      if (productIds.has(row.product_id)) this.throwInvalidResponse();
      productIds.add(row.product_id);
      return {
        productId: row.product_id,
        model: row.model,
        productNameEn: row.product_name_en,
        similarity: row.similarity,
        rank: index + 1,
      };
    });
  }

  private isValidRpcRow(value: unknown): value is SemanticSearchRpcRow {
    if (typeof value !== 'object' || value === null) return false;
    const row = value as Record<string, unknown>;
    return (
      typeof row.product_id === 'string' &&
      row.product_id.trim().length > 0 &&
      typeof row.model === 'string' &&
      row.model.trim().length > 0 &&
      typeof row.product_name_en === 'string' &&
      row.product_name_en.trim().length > 0 &&
      typeof row.similarity === 'number' &&
      Number.isFinite(row.similarity) &&
      row.similarity >= 0 &&
      row.similarity <= 1
    );
  }

  private throwInvalidResponse(): never {
    throw new SemanticSearchError(
      'SEMANTIC_RPC_INVALID_RESPONSE',
      'Semantic search returned an invalid response',
    );
  }
}
