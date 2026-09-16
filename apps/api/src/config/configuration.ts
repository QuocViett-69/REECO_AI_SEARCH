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
}

export function configuration(): AppConfiguration {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    supabase: {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    embedding: {
      provider: process.env.EMBEDDING_PROVIDER ?? 'ollama',
      baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
      model: process.env.EMBEDDING_MODEL ?? 'qwen3-embedding:4b',
      dimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 1536),
      version:
        process.env.EMBEDDING_VERSION ?? 'ollama-qwen3-embedding-4b-1536-v1',
      timeoutMs: Number(process.env.OLLAMA_EMBEDDING_TIMEOUT_MS ?? 180000),
      batchSize: Number(process.env.EMBEDDING_BATCH_SIZE ?? 8),
    },
  };
}
