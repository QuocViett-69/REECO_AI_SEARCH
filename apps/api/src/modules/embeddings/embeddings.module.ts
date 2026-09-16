import { Module } from '@nestjs/common';
import { EMBEDDING_PROVIDER } from '../../ai/embedding.provider';
import { OllamaEmbeddingProvider } from '../../ai/ollama-embedding.provider';
import { configuration } from '../../config/configuration';
import { EmbeddingsService } from './embeddings.service';

@Module({
  providers: [
    {
      provide: EMBEDDING_PROVIDER,
      useFactory: () => {
        const embedding = configuration().embedding;
        return new OllamaEmbeddingProvider({
          provider: embedding.provider,
          baseUrl: embedding.baseUrl,
          model: embedding.model,
          dimensions: embedding.dimensions,
          version: embedding.version,
          timeoutMs: embedding.timeoutMs,
        });
      },
    },
    EmbeddingsService,
  ],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
