import assert from 'node:assert/strict';
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
const { ProductsRepository } = fromDist(
  'modules',
  'products',
  'products.repository.js',
);
const { ProductsService } = fromDist(
  'modules',
  'products',
  'products.service.js',
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
const {
  MEASUREMENT_TEMPERATURE_KEYS,
  OPERATING_TEMPERATURE_KEYS,
  SUPPORTED_TECHNICAL_PROTOCOLS,
  TECHNICAL_QUERY_PARSER_VERSION,
} = fromDist('modules', 'search', 'technical-query.constants.js');
const { TechnicalMatchService } = fromDist(
  'modules',
  'search',
  'technical-match.service.js',
);
const { TechnicalQueryParserService } = fromDist(
  'modules',
  'search',
  'technical-query-parser.service.js',
);

const queries = [
  'CS655',
  'CSI_CS655',
  'AVW200-ST',
  'CR350-NA',
  'SDI-12',
  'Modbus',
  'Modbus RTU',
  'RS-485',
  'sensor with SDI-12',
  'cảm biến hỗ trợ SDI-12',
  'operates at -40°C',
  'hoạt động ở -40°C',
  'operates at 60 C',
  'operating temperature -50 to 60°C',
  'measure up to 70°C',
  'đo tới 70°C',
  'temperature sensor',
];
const identityExpectations = new Map([
  ['CS655', 'CSI_CS655'],
  ['CSI_CS655', 'CSI_CS655'],
  ['AVW200-ST', 'CSI_AVW200_ST'],
  ['CR350-NA', 'CSI_CR350_NA'],
]);
const protocolQueries = new Set([
  'SDI-12',
  'Modbus',
  'Modbus RTU',
  'RS-485',
  'sensor with SDI-12',
  'cảm biến hỗ trợ SDI-12',
]);

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
  throw new Error(
    'Technical smoke requires server-side Supabase configuration',
  );
}
const productsRepository = new ProductsRepository(supabase);
const productsService = new ProductsService(productsRepository);
const keywordSearch = new KeywordSearchService(supabase);
const semanticSearch = new SemanticSearchService(embeddings, supabase);
const searchScore = new SearchScoreService();
const hybridSearch = new HybridSearchService(
  keywordSearch,
  semanticSearch,
  searchScore,
);
const parser = new TechnicalQueryParserService();
const matcher = new TechnicalMatchService(productsService);
const queryResults = [];

for (const query of queries) {
  const hybrid = await hybridSearch.search(query);
  const candidateIds = hybrid.candidates.map(
    (candidate) => candidate.productId,
  );
  const catalog = hybrid.candidates.map((candidate) => ({
    productId: candidate.productId,
    model: candidate.model,
  }));
  const parsed = parser.parse(query, catalog);
  const matches = await matcher.evaluate(parsed, candidateIds);
  const matchesById = new Map(matches.map((match) => [match.productId, match]));

  const expectedIdentity = identityExpectations.get(query);
  if (expectedIdentity) {
    assert.equal(parsed.identity?.productId, expectedIdentity, query);
    assert.equal(
      matchesById.get(expectedIdentity)?.identityMatch,
      'exact',
      query,
    );
  }
  if (protocolQueries.has(query)) {
    assert.ok(parsed.protocols.length > 0, query);
    assert.ok(
      matches.some((match) =>
        match.protocolMatches.some((protocol) => protocol.result === 'MATCH'),
      ),
      `expected structured protocol evidence for ${query}`,
    );
  }
  if (parsed.confidence.temperature === 'high') {
    assert.ok(
      matches.some((match) =>
        match.temperatureMatches.some(
          (temperature) => temperature.result !== 'UNKNOWN',
        ),
      ),
      `expected evaluable temperature evidence for ${query}`,
    );
  }

  queryResults.push({
    query,
    hybrid_mode: hybrid.mode,
    parsed_query: parsed,
    hybrid_top_candidates: hybrid.candidates
      .slice(0, 10)
      .map((candidate, index) => ({
        rank: index + 1,
        product_id: candidate.productId,
        model: candidate.model,
        keyword_rank: candidate.keywordRank,
        semantic_rank: candidate.semanticRank,
        rrf_score: candidate.rrfScore,
      })),
    technical_annotations: hybrid.candidates
      .slice(0, 10)
      .map((candidate) => matchesById.get(candidate.productId)),
  });
}

const knownProductIds = ['CSI_CS655', 'CSI_109'];
const knownProductCatalog = [
  { productId: 'CSI_CS655', model: 'CS655' },
  { productId: 'CSI_109', model: '109' },
];
const knownProductChecks = [];
for (const query of ['operates at -40°C', 'measure up to 70°C']) {
  const parsed = parser.parse(query, knownProductCatalog);
  const matches = await matcher.evaluate(parsed, knownProductIds);
  assert.ok(
    matches.every((match) =>
      match.temperatureMatches.some(
        (temperature) => temperature.result === 'MATCH',
      ),
    ),
    `expected CS655 and 109 to have matching structured evidence for ${query}`,
  );
  knownProductChecks.push({ query, parsed_query: parsed, matches });
}

const report = {
  generated_at: new Date().toISOString(),
  purpose: 'Step 7.6A internal technical evaluation; no public ranking effect',
  parser_version: TECHNICAL_QUERY_PARSER_VERSION,
  supported_protocols: SUPPORTED_TECHNICAL_PROTOCOLS,
  operating_temperature_keys: OPERATING_TEMPERATURE_KEYS,
  measurement_temperature_keys: MEASUREMENT_TEMPERATURE_KEYS,
  normalized_temperature_value_types: ['range'],
  queries: queryResults,
  known_product_checks: knownProductChecks,
  result: 'PASS',
};
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'technical-match-evaluation.json',
);
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
