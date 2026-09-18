import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const { OllamaEmbeddingProvider } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'ai',
    'ollama-embedding.provider.js',
  ),
);
const { configuration } = require(
  path.join(projectRoot, 'apps', 'api', 'dist', 'config', 'configuration.js'),
);
const { SupabaseService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'database',
    'supabase',
    'supabase.service.js',
  ),
);
const { EmbeddingsService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'embeddings',
    'embeddings.service.js',
  ),
);
const { SemanticSearchService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'semantic-search.service.js',
  ),
);

const appConfig = configuration();
const embedding = appConfig.embedding;
const provider = new OllamaEmbeddingProvider({
  provider: embedding.provider,
  baseUrl: embedding.baseUrl,
  model: embedding.model,
  dimensions: embedding.dimensions,
  version: embedding.version,
  timeoutMs: embedding.timeoutMs,
});
const embeddings = new EmbeddingsService(provider);
const supabase = new SupabaseService();
if (!supabase.isConfigured) {
  throw new Error('Semantic smoke requires server-side Supabase configuration');
}
const embeddingCache = new Map();
const repeatableEmbeddings = {
  getConfigurationMetadata: () => embeddings.getConfigurationMetadata(),
  async embedQuery(query) {
    if (!embeddingCache.has(query)) {
      embeddingCache.set(query, await embeddings.embedQuery(query));
    }
    return embeddingCache.get(query);
  },
};
const semanticSearch = new SemanticSearchService(
  repeatableEmbeddings,
  supabase,
);
const queries = ['soil moisture sensor', 'cảm biến độ ẩm đất', '900 MHz radio'];

const queryResults = [];
for (const query of queries) {
  const first = await semanticSearch.search(query, 10);
  const second = await semanticSearch.search(query, 10);
  const firstIds = first.map((candidate) => candidate.productId);
  const secondIds = second.map((candidate) => candidate.productId);
  const orderingValid = first.every(
    (candidate, index) =>
      candidate.rank === index + 1 &&
      (index === 0 || first[index - 1].similarity >= candidate.similarity),
  );
  if (!orderingValid)
    throw new Error(`Invalid semantic ordering for: ${query}`);
  if (JSON.stringify(firstIds) !== JSON.stringify(secondIds)) {
    throw new Error(
      `Non-deterministic semantic product ordering for: ${query}`,
    );
  }
  queryResults.push({
    query,
    result_count: first.length,
    deterministic_ordering: true,
    results: first.map((candidate) => ({
      rank: candidate.rank,
      product_id: candidate.productId,
      model: candidate.model,
      similarity: candidate.similarity,
    })),
  });
}

const allProductIds = [
  ...new Set(
    queryResults.flatMap((result) =>
      result.results.map((candidate) => candidate.product_id),
    ),
  ),
];
const { data: products, error: productsError } = await supabase
  .getClient()
  .from('products')
  .select('product_id,status')
  .in('product_id', allProductIds);
if (productsError)
  throw new Error('Semantic smoke could not verify product status');
const statuses = new Map(
  (products ?? []).map((product) => [product.product_id, product.status]),
);
if (allProductIds.some((productId) => statuses.get(productId) !== 'active')) {
  throw new Error('Semantic smoke returned a non-active product');
}

const soilIds = queryResults[0].results
  .slice(0, 5)
  .map((candidate) => candidate.product_id);
const vietnameseIds = queryResults[1].results
  .slice(0, 5)
  .map((candidate) => candidate.product_id);
if (!soilIds.includes('CSI_SOILVUE10_5')) {
  throw new Error('SoilVue10-5 is not near the top for the English soil query');
}
if (
  !vietnameseIds.includes('CSI_LWS') ||
  !vietnameseIds.includes('CSI_SOILVUE10_5')
) {
  throw new Error('Vietnamese soil query baseline signal changed unexpectedly');
}
if (queryResults[2].results[0]?.product_id !== 'CSI_RF407') {
  throw new Error('RF407 is not first for the 900 MHz radio query');
}

const report = {
  generated_at: new Date().toISOString(),
  adapter: 'SemanticSearchService',
  provider: embedding.provider,
  model: embedding.model,
  dimensions: embedding.dimensions,
  embedding_version: embedding.version,
  rpc: 'search_products_semantic',
  rpc_context: 'service_role',
  repeatability_check: 'same generated query vector replayed through adapter',
  all_results_active: true,
  query_results: queryResults,
  result: 'PASS',
};
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'semantic-search-runtime-report.json',
);
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
