import { type EmbeddingProvider } from '../../ai/embedding.provider';
export interface EmbeddingConfigurationMetadata {
    provider: string;
    model: string;
    dimensions: number;
    version: string;
    timeout_ms: number;
    batch_size: number;
}
export declare class EmbeddingsService {
    private readonly provider;
    private readonly batchSize;
    constructor(provider: EmbeddingProvider);
    isConfigured(): boolean;
    getConfigurationMetadata(): EmbeddingConfigurationMetadata;
    embedQuery(text: string): Promise<number[]>;
    embedDocuments(texts: string[]): Promise<number[][]>;
}
