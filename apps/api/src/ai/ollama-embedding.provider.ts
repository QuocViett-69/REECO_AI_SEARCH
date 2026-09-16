import type { EmbeddingProvider } from './embedding.provider';

export const OLLAMA_EMBEDDING_DIMENSIONS = 1536;

export type EmbeddingErrorCode =
  | 'OLLAMA_NOT_REACHABLE'
  | 'OLLAMA_MODEL_NOT_FOUND'
  | 'OLLAMA_TIMEOUT'
  | 'OLLAMA_INVALID_RESPONSE'
  | 'EMBEDDING_DIMENSION_MISMATCH'
  | 'EMPTY_EMBEDDING_INPUT'
  | 'EMBEDDING_CONFIG_INVALID';

export interface OllamaEmbeddingConfiguration {
  provider: string;
  baseUrl: string;
  model: string;
  dimensions: number;
  version: string;
  timeoutMs: number;
}

export class EmbeddingProviderError extends Error {
  constructor(
    readonly code: EmbeddingErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'EmbeddingProviderError';
  }
}

type FetchImplementation = typeof fetch;

function configError(message: string): never {
  throw new EmbeddingProviderError('EMBEDDING_CONFIG_INVALID', message);
}

function validateConfiguration(config: OllamaEmbeddingConfiguration): void {
  if (config.provider !== 'ollama') {
    configError('Embedding provider must be ollama');
  }
  try {
    const url = new URL(config.baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      configError('Ollama base URL must use HTTP or HTTPS');
    }
  } catch (error) {
    if (error instanceof EmbeddingProviderError) throw error;
    configError('Ollama base URL is invalid');
  }
  if (!config.model.trim() || !config.version.trim()) {
    configError('Embedding model and version must be non-empty');
  }
  if (config.dimensions !== OLLAMA_EMBEDDING_DIMENSIONS) {
    configError('Embedding dimensions must be 1536');
  }
  if (!Number.isSafeInteger(config.timeoutMs) || config.timeoutMs <= 0) {
    configError('Ollama timeout must be a positive integer');
  }
}

function validateInputs(texts: unknown): asserts texts is string[] {
  if (
    !Array.isArray(texts) ||
    texts.length === 0 ||
    texts.some((text) => typeof text !== 'string' || text.trim().length === 0)
  ) {
    throw new EmbeddingProviderError(
      'EMPTY_EMBEDDING_INPUT',
      'Embedding input must contain non-empty strings',
    );
  }
}

function validateVectors(
  value: unknown,
  inputCount: number,
  dimensions: number,
): number[][] {
  if (!Array.isArray(value) || value.length !== inputCount) {
    throw new EmbeddingProviderError(
      'OLLAMA_INVALID_RESPONSE',
      'Ollama returned an invalid number of embeddings',
    );
  }

  return value.map((candidate) => {
    if (!Array.isArray(candidate)) {
      throw new EmbeddingProviderError(
        'OLLAMA_INVALID_RESPONSE',
        'Ollama returned an invalid embedding payload',
      );
    }
    if (candidate.length !== dimensions) {
      throw new EmbeddingProviderError(
        'EMBEDDING_DIMENSION_MISMATCH',
        'Ollama returned an embedding with unexpected dimensions',
      );
    }
    if (
      !candidate.every(
        (entry) => typeof entry === 'number' && Number.isFinite(entry),
      )
    ) {
      throw new EmbeddingProviderError(
        'OLLAMA_INVALID_RESPONSE',
        'Ollama returned a non-finite embedding value',
      );
    }
    return candidate;
  });
}

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  constructor(
    readonly config: OllamaEmbeddingConfiguration,
    private readonly fetchImplementation: FetchImplementation = globalThis.fetch,
  ) {
    validateConfiguration(config);
  }

  async embed(text: string): Promise<number[]> {
    validateInputs([text]);
    const vectors = await this.request(text, 1);
    return vectors[0]!;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    validateInputs(texts);
    return this.request(texts, texts.length);
  }

  private async request(
    input: string | string[],
    inputCount: number,
  ): Promise<number[][]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      let response: Response;
      try {
        response = await this.fetchImplementation(
          `${this.config.baseUrl.replace(/\/$/, '')}/api/embed`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              model: this.config.model,
              input,
              dimensions: this.config.dimensions,
            }),
            signal: controller.signal,
          },
        );
      } catch (error) {
        if (
          controller.signal.aborted ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          throw new EmbeddingProviderError(
            'OLLAMA_TIMEOUT',
            'Ollama embedding request timed out',
            { cause: error },
          );
        }
        throw new EmbeddingProviderError(
          'OLLAMA_NOT_REACHABLE',
          'Ollama embedding service is not reachable',
          { cause: error },
        );
      }

      const rawBody = await response.text();
      let body: unknown;
      try {
        body = JSON.parse(rawBody) as unknown;
      } catch (error) {
        throw new EmbeddingProviderError(
          'OLLAMA_INVALID_RESPONSE',
          'Ollama returned invalid JSON',
          { cause: error },
        );
      }

      const providerError =
        typeof body === 'object' && body !== null && 'error' in body
          ? String(body.error).toLowerCase()
          : '';
      if (
        response.status === 404 ||
        (providerError.includes('model') && providerError.includes('not found'))
      ) {
        throw new EmbeddingProviderError(
          'OLLAMA_MODEL_NOT_FOUND',
          `Ollama model is unavailable; run: ollama pull ${this.config.model}`,
        );
      }
      if (!response.ok) {
        throw new EmbeddingProviderError(
          'OLLAMA_INVALID_RESPONSE',
          'Ollama rejected the embedding request',
        );
      }
      if (
        typeof body !== 'object' ||
        body === null ||
        !('embeddings' in body)
      ) {
        throw new EmbeddingProviderError(
          'OLLAMA_INVALID_RESPONSE',
          'Ollama response does not contain embeddings',
        );
      }

      return validateVectors(
        body.embeddings,
        inputCount,
        this.config.dimensions,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
