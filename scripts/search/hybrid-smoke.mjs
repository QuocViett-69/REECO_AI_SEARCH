import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const fromDist = (...segments) =>
  require(path.join(projectRoot, 'apps', 'api', 'dist', ...segments));
const { OllamaEmbeddingProvider } = fromDist(
  'ai',
  'ollama-embedding.provider.js',
);
const { configuration } = fromDist('config', 'configuration.js');
const { SupabaseService } = fromDist(
  'database',
  'supabase',
  'supabase.service.js',
);
const { EmbeddingsService } = fromDist(
  'modules',
  'embeddings',
  'embeddings.service.js',
);
const { HybridSearchService } = fromDist(
  'modules',
  'search',
  'hybrid-search.service.js',
);
const { KeywordSearchService } = fromDist(
  'modules',
  'search',
  'keyword-search.service.js',
);
const { SearchScoreService } = fromDist(
  'modules',
  'search',
  'search-score.service.js',
);
const { SemanticSearchService } = fromDist(
  'modules',
  'search',
  'semantic-search.service.js',
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
  throw new Error('Hybrid smoke requires server-side Supabase configuration');
}
const keywordSearch = new KeywordSearchService(supabase);
const semanticSearch = new SemanticSearchService(embeddings, supabase);
const searchScore = new SearchScoreService();
const hybridSearch = new HybridSearchService(
  keywordSearch,
  semanticSearch,
  searchScore,
);
const queries = [
  'CS655',
  'soil moisture sensor',
  'cảm biến độ ẩm đất',
  '900 MHz radio',
  'SDI-12',
  'Modbus',
  'power supply',
  'weather station',
  'precipitation sensor',
  'temperature sensor',
];
const queryResults = [];

for (const query of queries) {
  const result = await hybridSearch.search(query);
  const keywordRanking = result.candidates
    .filter((candidate) => candidate.keywordRank !== null)
    .sort((left, right) => left.keywordRank - right.keywordRank)
    .map((candidate) => ({
      product_id: candidate.productId,
      model: candidate.model,
      rank: candidate.keywordRank,
      score: candidate.keywordScore,
    }));
  const semanticRanking = result.candidates
    .filter((candidate) => candidate.semanticRank !== null)
    .sort((left, right) => left.semanticRank - right.semanticRank)
    .map((candidate) => ({
      product_id: candidate.productId,
      model: candidate.model,
      rank: candidate.semanticRank,
      similarity: candidate.semanticScore,
    }));
  const overlap = result.candidates.filter(
    (candidate) => candidate.matchedBy.keyword && candidate.matchedBy.semantic,
  ).length;
  queryResults.push({
    query,
    mode: result.mode,
    diagnostics: result.diagnostics,
    source_overlap: {
      both: overlap,
      keyword_only: result.diagnostics.keywordCount - overlap,
      semantic_only: result.diagnostics.semanticCount - overlap,
    },
    keyword_ranking: keywordRanking,
    semantic_ranking: semanticRanking,
    hybrid_ranking: result.candidates.slice(0, 10).map((candidate, index) => ({
      rank: index + 1,
      product_id: candidate.productId,
      model: candidate.model,
      keyword_rank: candidate.keywordRank,
      keyword_score: candidate.keywordScore,
      semantic_rank: candidate.semanticRank,
      semantic_similarity: candidate.semanticScore,
      rrf_score: candidate.rrfScore,
      matched_by_keyword: candidate.matchedBy.keyword,
      matched_by_semantic: candidate.matchedBy.semantic,
    })),
  });
}

const report = {
  generated_at: new Date().toISOString(),
  purpose: 'Step 7.5A baseline evaluation; no ranking-quality claim',
  configuration: {
    retrieval_limit: appConfig.search.retrievalLimit,
    rrf_k: searchScore.getRrfK(),
    embedding_provider: embedding.provider,
    embedding_model: embedding.model,
    embedding_version: embedding.version,
    embedding_dimensions: embedding.dimensions,
  },
  query_results: queryResults,
  result: 'PASS',
};
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'hybrid-search-evaluation.json',
);
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
