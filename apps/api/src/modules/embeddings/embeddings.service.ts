import { Inject, Injectable } from '@nestjs/common';
import {
  EMBEDDING_PROVIDER,
  type EmbeddingProvider,
} from '../../ai/embedding.provider';
import { OllamaEmbeddingProvider } from '../../ai/ollama-embedding.provider';
import { configuration } from '../../config/configuration';

export interface EmbeddingConfigurationMetadata {
  provider: string;
  model: string;
  dimensions: number;
  version: string;
  timeout_ms: number;
  batch_size: number;
}

@Injectable()
export class EmbeddingsService {
  private readonly batchSize = configuration().embedding.batchSize;
  private readonly queryTimeoutMs = configuration().embedding.queryTimeoutMs;

  constructor(
    @Inject(EMBEDDING_PROVIDER)
    private readonly provider: EmbeddingProvider,
  ) {
    if (!Number.isSafeInteger(this.batchSize) || this.batchSize <= 0) {
      throw new Error('EMBEDDING_CONFIG_INVALID: batch size must be positive');
    }
  }

  isConfigured(): boolean {
    return this.provider instanceof OllamaEmbeddingProvider;
  }

  getConfigurationMetadata(): EmbeddingConfigurationMetadata {
    if (!(this.provider instanceof OllamaEmbeddingProvider)) {
      throw new Error('EMBEDDING_CONFIG_INVALID: unsupported provider');
    }
    const { config } = this.provider;
    return {
      provider: config.provider,
      model: config.model,
      dimensions: config.dimensions,
      version: config.version,
      timeout_ms: config.timeoutMs,
      batch_size: this.batchSize,
    };
  }

  // A search waits on this (hybrid search awaits both legs), so a hung Ollama must fail fast
  // into the keyword fallback instead of holding the request for the backfill timeout.
  async embedQuery(text: string): Promise<number[]> {
    const limit = this.queryTimeoutMs;
    if (!Number.isFinite(limit) || limit <= 0) return this.provider.embed(text);
    let timer: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        this.provider.embed(text),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(
            () => reject(new Error('Query embedding timed out')),
            limit,
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return this.provider.embedMany(texts);
    const embeddings: number[][] = [];
    for (let offset = 0; offset < texts.length; offset += this.batchSize) {
      embeddings.push(
        ...(await this.provider.embedMany(
          texts.slice(offset, offset + this.batchSize),
        )),
      );
    }
    return embeddings;
  }
}
