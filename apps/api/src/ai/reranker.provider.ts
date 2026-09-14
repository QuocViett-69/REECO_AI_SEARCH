export interface RerankerProvider {
  rerank(query: string, candidates: unknown[]): Promise<unknown[]>;
}
