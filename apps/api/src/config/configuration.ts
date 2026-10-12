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
    embeddingTimeoutMs: number;
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
  vnpay: {
    tmnCode: string;
    hashSecret: string;
    payUrl: string;
    returnUrl: string;
  };
}

const rerankerModel = 'BAAI/bge-reranker-v2-m3';
const rerankerRevision = '953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e';

function positiveInteger(name: string, value: string, maximum?: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || (maximum && parsed > maximum)) {
    throw new Error(`${name} must be an integer from 1 to ${maximum ?? 'infinity'}`);
  }
  return parsed;
}

export function configuration(): AppConfiguration {
  const model = process.env.RERANKER_MODEL ?? rerankerModel;
  const revision = process.env.RERANKER_MODEL_REVISION ?? rerankerRevision;
  if (model !== rerankerModel || revision !== rerankerRevision) {
    throw new Error('The production reranker model and revision are pinned');
  }
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
    search: {
      embeddingTimeoutMs: positiveInteger('SEARCH_EMBEDDING_TIMEOUT_MS', process.env.SEARCH_EMBEDDING_TIMEOUT_MS ?? '10000'),
      retrievalLimit: Number(process.env.SEARCH_RETRIEVAL_LIMIT ?? 20),
      rrfK: Number(process.env.SEARCH_RRF_K ?? 60),
    },
    reranker: {
      enabled: process.env.RERANKER_ENABLED?.toLowerCase() === 'true',
      baseUrl: process.env.RERANKER_BASE_URL ?? 'http://127.0.0.1:8011',
      timeoutMs: positiveInteger(
        'RERANKER_TIMEOUT_MS',
        process.env.RERANKER_TIMEOUT_MS ?? '350',
      ),
      topN: positiveInteger(
        'RERANKER_TOP_N',
        process.env.RERANKER_TOP_N ?? '5',
        5,
      ),
      model,
      revision,
    },
    explanation: {
      llmEnabled: process.env.LLM_EXPLANATION_ENABLED?.toLowerCase() === 'true',
      model: process.env.LLM_MODEL ?? '',
      timeoutMs: positiveInteger(
        'LLM_EXPLANATION_TIMEOUT_MS',
        process.env.LLM_EXPLANATION_TIMEOUT_MS ?? '20000',
      ),
    },
    vnpay: {
      tmnCode: process.env.VNPAY_TMN_CODE ?? '',
      hashSecret: process.env.VNPAY_HASH_SECRET ?? '',
      payUrl:
        process.env.VNPAY_PAY_URL ??
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl:
        process.env.VNPAY_RETURN_URL ??
        'http://localhost:5173/payment/vnpay-return',
    },
  };
}
