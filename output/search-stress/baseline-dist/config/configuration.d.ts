export interface AppConfiguration {
    nodeEnv: string;
    port: number;
    supabase: {
        url?: string;
        serviceRoleKey?: string;
    };
    embedding: {
        provider: string;
        baseUrl: string;
        model: string;
        dimensions: number;
        version: string;
        timeoutMs: number;
        batchSize: number;
    };
    search: {
        retrievalLimit: number;
        rrfK: number;
    };
    reranker: {
        enabled: boolean;
        baseUrl: string;
        timeoutMs: number;
        topN: number;
        model: string;
        revision: string;
    };
    explanation: {
        llmEnabled: boolean;
        model: string;
        timeoutMs: number;
    };
}
export declare function configuration(): AppConfiguration;
