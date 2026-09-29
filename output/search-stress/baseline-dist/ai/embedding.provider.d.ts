export interface EmbeddingProvider {
    embed(text: string): Promise<number[]>;
    embedMany(texts: string[]): Promise<number[][]>;
}
export declare const EMBEDDING_PROVIDER: unique symbol;
