import type { EmbeddingProvider } from './embedding.provider';
export declare const OLLAMA_EMBEDDING_DIMENSIONS = 1536;
export type EmbeddingErrorCode = 'OLLAMA_NOT_REACHABLE' | 'OLLAMA_MODEL_NOT_FOUND' | 'OLLAMA_TIMEOUT' | 'OLLAMA_INVALID_RESPONSE' | 'EMBEDDING_DIMENSION_MISMATCH' | 'EMPTY_EMBEDDING_INPUT' | 'EMBEDDING_CONFIG_INVALID';
export interface OllamaEmbeddingConfiguration {
    provider: string;
    baseUrl: string;
    model: string;
    dimensions: number;
    version: string;
    timeoutMs: number;
}
export declare class EmbeddingProviderError extends Error {
    readonly code: EmbeddingErrorCode;
    constructor(code: EmbeddingErrorCode, message: string, options?: ErrorOptions);
}
type FetchImplementation = typeof fetch;
export declare class OllamaEmbeddingProvider implements EmbeddingProvider {
    readonly config: OllamaEmbeddingConfiguration;
    private readonly fetchImplementation;
    constructor(config: OllamaEmbeddingConfiguration, fetchImplementation?: FetchImplementation);
    embed(text: string): Promise<number[]>;
    embedMany(texts: string[]): Promise<number[][]>;
    private request;
}
export {};
