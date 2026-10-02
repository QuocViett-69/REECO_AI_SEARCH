import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  mean,
  ndcgAt,
  percentile,
  precisionAt,
  recallAt,
  reciprocalRankAt,
} from './metrics.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..', '..');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require(path.join(root, 'apps', 'api', 'dist', 'app.module.js'));
const { HybridSearchService } = require(path.join(root, 'apps', 'api', 'dist', 'modules', 'search', 'hybrid-search.service.js'));
const { SemanticSearchService } = require(path.join(root, 'apps', 'api', 'dist', 'modules', 'search', 'semantic-search.service.js'));
const { TechnicalQueryParserService } = require(path.join(root, 'apps', 'api', 'dist', 'modules', 'search', 'technical-query-parser.service.js'));
const { TechnicalMatchService } = require(path.join(root, 'apps', 'api', 'dist', 'modules', 'search', 'technical-match.service.js'));
const { ProductsService } = require(path.join(root, 'apps', 'api', 'dist', 'modules', 'products', 'products.service.js'));
const { EmbeddingsService } = require(path.join(root, 'apps', 'api', 'dist', 'modules', 'embeddings', 'embeddings.service.js'));

const reviewed = process.argv.includes('--reviewed');
const benchmarkPath = path.join(root, 'data', 'evaluation', reviewed ? 'search-benchmark-v1.1.json' : 'search-benchmark-v1.json');
const benchmark = JSON.parse(await readFile(benchmarkPath, 'utf8'));
const searchDocuments = new Map();
const searchDocumentFiles = (await readdir(path.join(root, 'data', 'search-documents')))
  .filter((file) => file.endsWith('.json'));
for (const product of await Promise.all(searchDocumentFiles.map(async (file) =>
  JSON.parse(await readFile(path.join(root, 'data', 'search-documents', file), 'utf8'))))) {
  searchDocuments.set(product.product_id, product);
}

function round(value, digits = 6) {
  return value === null ? null : Number(value.toFixed(digits));
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : typeof value === 'string' ? value : JSON.stringify(value);
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function compactEvidence(productId, benchmarkJudgment, technical) {
  const document = searchDocuments.get(productId);
  const evidence = [];
  if (benchmarkJudgment) evidence.push(...benchmarkJudgment.evidence);
  if (technical?.identityMatch === 'exact') evidence.push(...technical.identityEvidence);
  for (const item of technical?.protocolMatches ?? []) {
    if (item.result !== 'UNKNOWN') evidence.push({ protocol: item.queryProtocol, result: item.result, evidence: item.evidence });
  }
  for (const item of technical?.temperatureMatches ?? []) {
    if (item.result !== 'UNKNOWN') evidence.push({ temperature: item.constraint, result: item.result, evidence: item.evidence });
  }
  if (evidence.length === 0 && document) {
    evidence.push({ source: 'search_document', taxonomy: document.taxonomy, measurements: document.measurements.map((item) => item.key), supported_protocols: document.supported_protocols });
  }
  return evidence.slice(0, 5);
}

function hasProtocol(document, protocol) {
  if (!document) return false;
  return document.supported_protocols.some((item) => protocol === 'Modbus' ? item === 'Modbus' || item.startsWith('Modbus ') : item === protocol);
}

const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix('api/v1');
await app.listen(0, '127.0.0.1');
const baseUrl = await app.getUrl();
const hybridSearch = app.get(HybridSearchService);
const semanticSearch = app.get(SemanticSearchService);
const parser = app.get(TechnicalQueryParserService);
const technicalMatch = app.get(TechnicalMatchService);
const productsService = app.get(ProductsService);
const embeddingsService = app.get(EmbeddingsService);
const identityCatalog = await productsService.getActiveTechnicalIdentityCatalog();
const allProductIds = [...searchDocuments.keys()].sort();

// The first public call for each query is untouched. Its semantic result is memoized only
// so candidate-pool diagnostics can inspect the same retrieval without a second embedding call.
const originalSemanticSearch = semanticSearch.search.bind(semanticSearch);
const semanticCache = new Map();
semanticSearch.search = async (query, limit) => {
  const key = `${String(query).trim()}\u0000${limit ?? ''}`;
  if (!semanticCache.has(key)) semanticCache.set(key, originalSemanticSearch(query, limit));
  return semanticCache.get(key);
};

const queryResults = [];
const reviewQueries = [];
const reviewRows = [];

try {
  for (let queryIndex = 0; queryIndex < benchmark.queries.length; queryIndex += 1) {
    const benchmarkQuery = benchmark.queries[queryIndex];
    const startedAt = performance.now();
    const response = await fetch(`${baseUrl}/api/v1/search`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: benchmarkQuery.query, limit: 20 }),
    });
    const publicResult = await response.json();
    const latencyMs = performance.now() - startedAt;
    if (!response.ok) throw new Error(`Public search failed (${response.status}) for ${benchmarkQuery.id}: ${JSON.stringify(publicResult)}`);

    const hybrid = await hybridSearch.search(benchmarkQuery.query, 20);
    const parsed = parser.parse(benchmarkQuery.query, identityCatalog);
    const hasTechnicalSignal = parsed.identity || parsed.protocols.length > 0 || parsed.temperatureConstraints.some((item) => item.confidence === 'high');
    const technical = hasTechnicalSignal ? await technicalMatch.evaluate(parsed, allProductIds) : [];
    const technicalById = new Map(technical.map((item) => [item.productId, item]));
    const benchmarkJudgments = new Map(benchmarkQuery.judgments.map((item) => [item.product_id, item]));

    const candidateIds = new Set(publicResult.results.map((item) => item.product_id));
    for (const candidate of hybrid.candidates) candidateIds.add(candidate.productId);
    if (parsed.identity) candidateIds.add(parsed.identity.productId);
    for (const item of technical) {
      if (item.identityMatch === 'exact' || item.protocolMatches.some((match) => match.result === 'MATCH') || item.temperatureMatches.some((match) => match.result === 'MATCH')) candidateIds.add(item.productId);
    }

    const publicIds = publicResult.results.map((item) => item.product_id);
    const metrics = benchmarkQuery.judgment_status === 'verified' && benchmarkQuery.judgments.some((item) => item.relevance > 0)
      ? {
          mrr_at_10: reciprocalRankAt(publicIds, benchmarkQuery.judgments, 10),
          recall_at_5: recallAt(publicIds, benchmarkQuery.judgments, 5),
          recall_at_10: recallAt(publicIds, benchmarkQuery.judgments, 10),
          precision_at_5: precisionAt(publicIds, benchmarkQuery.judgments, 5),
          ndcg_at_5: ndcgAt(publicIds, benchmarkQuery.judgments, 5),
          ndcg_at_10: ndcgAt(publicIds, benchmarkQuery.judgments, 10),
        }
      : null;

    const candidatePool = [...candidateIds].map((productId) => {
      const hybridCandidate = hybrid.candidates.find((item) => item.productId === productId);
      const publicRank = publicIds.indexOf(productId) + 1;
      return {
        product_id: productId,
        public_rank: publicRank || null,
        keyword_rank: hybridCandidate?.keywordRank ?? null,
        semantic_rank: hybridCandidate?.semanticRank ?? null,
        deterministic_exact: parsed.identity?.productId === productId,
        technical_state: technicalById.has(productId) ? {
          protocol: technicalById.get(productId).protocolMatches.map((item) => ({ protocol: item.queryProtocol, result: item.result })),
          temperature: technicalById.get(productId).temperatureMatches.map((item) => ({ result: item.result, constraint: item.constraint })),
          hard_mismatch: technicalById.get(productId).hardMismatch,
        } : null,
        suggested_relevance: benchmarkJudgments.get(productId)?.relevance ?? null,
        evidence: compactEvidence(productId, benchmarkJudgments.get(productId), technicalById.get(productId)),
      };
    }).sort((left, right) => (left.public_rank ?? 999) - (right.public_rank ?? 999) || (left.keyword_rank ?? 999) - (right.keyword_rank ?? 999) || (left.semantic_rank ?? 999) - (right.semantic_rank ?? 999) || left.product_id.localeCompare(right.product_id));

    queryResults.push({
      query_id: benchmarkQuery.id, query: benchmarkQuery.query, language: benchmarkQuery.language,
      category: benchmarkQuery.category, judgment_status: benchmarkQuery.judgment_status,
      http_status: response.status, mode: publicResult.mode, latency_ms: round(latencyMs, 3),
      result_count: publicResult.results.length, result_ids: publicIds,
      source_diagnostics: hybrid.diagnostics, parsed_technical_query: parsed,
      metrics, candidate_pool_count: candidatePool.length,
    });

    if (benchmarkQuery.judgment_status === 'needs_manual_review') {
      reviewQueries.push({
        query_id: benchmarkQuery.id, query: benchmarkQuery.query, language: benchmarkQuery.language,
        category: benchmarkQuery.category, intent: benchmarkQuery.intent,
        review_reason: benchmarkQuery.review_reason, constraints: benchmarkQuery.constraints,
        candidate_pool: candidatePool,
      });
      for (const candidate of candidatePool) reviewRows.push({
        query_id: benchmarkQuery.id, query: benchmarkQuery.query, language: benchmarkQuery.language,
        category: benchmarkQuery.category, review_reason: benchmarkQuery.review_reason,
        product_id: candidate.product_id, model: searchDocuments.get(candidate.product_id)?.model ?? '',
        public_rank: candidate.public_rank, keyword_rank: candidate.keyword_rank, semantic_rank: candidate.semantic_rank,
        suggested_relevance: candidate.suggested_relevance, reviewer_relevance: '', reviewer_notes: '',
        evidence: candidate.evidence,
      });
    }
    if ((queryIndex + 1) % 10 === 0) console.log(`evaluated ${queryIndex + 1}/${benchmark.queries.length}`);
  }
} finally {
  await app.close();
}

const eligible = queryResults.filter((item) => item.metrics);
const metricNames = ['mrr_at_10', 'recall_at_5', 'recall_at_10', 'precision_at_5', 'ndcg_at_5', 'ndcg_at_10'];
const aggregateMetrics = Object.fromEntries(metricNames.map((name) => [name, round(mean(eligible.map((item) => item.metrics[name])))]));
const exact = queryResults.filter((item) => item.category === 'exact_identity');
const exactTop1 = exact.filter((item) => item.result_ids[0] === benchmark.queries.find((query) => query.id === item.query_id).constraints.canonical_product_id).length / exact.length;

const protocolQueries = queryResults.filter((item) => item.category === 'protocol');
let protocolTop5Checked = 0;
let protocolTop5Satisfied = 0;
for (const result of protocolQueries) {
  const definition = benchmark.queries.find((item) => item.id === result.query_id);
  for (const productId of result.result_ids.slice(0, 5)) {
    protocolTop5Checked += 1;
    if (hasProtocol(searchDocuments.get(productId), definition.constraints.protocol)) protocolTop5Satisfied += 1;
  }
}

const numericQueries = queryResults.filter((item) => item.category === 'technical_numeric');
let numericChecked = 0;
let numericViolations = 0;
let numericUnknownRetained = 0;
for (const result of numericQueries) {
  const states = result.result_ids.map((productId) => {
    const candidate = reviewQueries.find((item) => item.query_id === result.query_id)?.candidate_pool.find((item) => item.product_id === productId);
    return candidate?.technical_state;
  });
  for (const state of states) {
    if (!state) continue;
    numericChecked += 1;
    if (state.hard_mismatch) numericViolations += 1;
    if (state.temperature.some((item) => item.result === 'UNKNOWN')) numericUnknownRetained += 1;
  }
}

const latencies = queryResults.map((item) => item.latency_ms);
const baseline = {
  schema_version: '1.0', report_id: reviewed ? 'search-baseline-v1.2' : 'search-baseline-v1', generated_at: new Date().toISOString(),
  benchmark_id: benchmark.benchmark_id,
  catalog_snapshot: benchmark.catalog_snapshot,
  execution: {
    endpoint: 'POST /api/v1/search', query_count: queryResults.length, request_limit: 20,
    candidate_pool: 'union(public top 20, keyword top 20, semantic top 20, deterministic exact, structured technical matches)',
    public_path_note: 'Each public request executes first and is measured normally; its semantic result is memoized only for subsequent candidate-pool diagnostics.',
    search_config: { retrieval_limit: Number(process.env.SEARCH_RETRIEVAL_LIMIT ?? 20), rrf_k: Number(process.env.SEARCH_RRF_K ?? 60) },
    embedding: embeddingsService.getConfigurationMetadata(),
  },
  metric_policy: benchmark.policy,
  verified_relevance_metrics: { eligible_query_count: eligible.length, ...aggregateMetrics },
  safety_and_operational_metrics: {
    exact_identity_top_1_accuracy: round(exactTop1),
    exact_identity_queries: exact.length,
    protocol_top_5_explicit_support_rate: round(protocolTop5Checked ? protocolTop5Satisfied / protocolTop5Checked : 0),
    protocol_results_checked: protocolTop5Checked,
    numeric_hard_mismatch_rate: round(numericChecked ? numericViolations / numericChecked : 0),
    numeric_hard_mismatch_count: numericViolations,
    numeric_results_checked: numericChecked,
    numeric_unknown_retained_count: numericUnknownRetained,
    zero_result_rate: round(queryResults.filter((item) => item.result_count === 0).length / queryResults.length),
    zero_result_count: queryResults.filter((item) => item.result_count === 0).length,
    latency_ms: { p50: percentile(latencies, 50), p95: percentile(latencies, 95), max: Math.max(...latencies), mean: round(mean(latencies), 3) },
  },
  slices: {
    by_category: Object.fromEntries([...new Set(queryResults.map((item) => item.category))].sort().map((category) => {
      const slice = queryResults.filter((item) => item.category === category);
      return [category, { query_count: slice.length, zero_result_rate: round(slice.filter((item) => item.result_count === 0).length / slice.length), mean_latency_ms: round(mean(slice.map((item) => item.latency_ms)), 3) }];
    })),
    by_language: Object.fromEntries([...new Set(queryResults.map((item) => item.language))].sort().map((language) => {
      const slice = queryResults.filter((item) => item.language === language);
      return [language, { query_count: slice.length, zero_result_rate: round(slice.filter((item) => item.result_count === 0).length / slice.length), mean_latency_ms: round(mean(slice.map((item) => item.latency_ms)), 3) }];
    })),
  },
  query_results: queryResults,
};

const failures = [];
for (const result of queryResults) {
  const definition = benchmark.queries.find((item) => item.id === result.query_id);
  if (result.result_count === 0) failures.push({ severity: 'inspect', type: 'zero_result', query_id: result.query_id, query: result.query });
  if (result.category === 'exact_identity' && result.result_ids[0] !== definition.constraints.canonical_product_id) failures.push({ severity: 'high', type: 'exact_top1_failure', query_id: result.query_id, query: result.query, expected: definition.constraints.canonical_product_id, actual: result.result_ids[0] ?? null });
  if (result.metrics?.recall_at_5 < 1) failures.push({ severity: 'low', type: 'verified_relevant_miss_at_5', query_id: result.query_id, query: result.query, recall_at_5: result.metrics.recall_at_5 });
  if (result.metrics?.recall_at_10 < 1) failures.push({ severity: 'medium', type: 'verified_relevant_miss_at_10', query_id: result.query_id, query: result.query, recall_at_10: result.metrics.recall_at_10 });
  if (result.category === 'protocol') {
    const unsupportedOrUnknown = result.result_ids.slice(0, 5).filter((productId) => !hasProtocol(searchDocuments.get(productId), definition.constraints.protocol));
    if (unsupportedOrUnknown.length) failures.push({ severity: 'inspect', type: 'protocol_top5_without_explicit_support', query_id: result.query_id, query: result.query, protocol: definition.constraints.protocol, product_ids: unsupportedOrUnknown });
  }
  if (result.category === 'technical_numeric') {
    const review = reviewQueries.find((item) => item.query_id === result.query_id);
    const mismatches = review.candidate_pool.filter((candidate) => candidate.public_rank && candidate.technical_state?.hard_mismatch).map((candidate) => candidate.product_id);
    if (mismatches.length) failures.push({ severity: 'critical', type: 'numeric_hard_mismatch_leak', query_id: result.query_id, query: result.query, product_ids: mismatches });
  }
  if (definition.judgment_status === 'needs_manual_review') {
    const suggested = definition.judgments.filter((item) => item.relevance > 0).map((item) => item.product_id);
    const missing = suggested.filter((productId) => !result.result_ids.slice(0, 10).includes(productId));
    if (suggested.length > 0 && missing.length > 0) failures.push({ severity: 'inspect', type: 'suggested_positive_missing_at_10', query_id: result.query_id, query: result.query, note: 'Suggested labels are not verified ground truth.', missing_count: missing.length, sample_product_ids: missing.slice(0, 10) });
    const review = reviewQueries.find((item) => item.query_id === result.query_id);
    const keywordTop = review?.candidate_pool.find((item) => item.keyword_rank === 1)?.product_id ?? null;
    const semanticTop = review?.candidate_pool.find((item) => item.semantic_rank === 1)?.product_id ?? null;
    if (keywordTop && semanticTop && keywordTop !== semanticTop) failures.push({ severity: 'inspect', type: 'keyword_semantic_top1_divergence', query_id: result.query_id, query: result.query, keyword_top1: keywordTop, semantic_top1: semanticTop });
  }
}
const failureReport = {
  schema_version: '1.0', report_id: reviewed ? 'search-failure-cases-v1.2' : 'search-failure-cases-v1', generated_at: new Date().toISOString(),
  benchmark_id: benchmark.benchmark_id, summary: {
    case_count: failures.length,
    by_type: Object.fromEntries([...new Set(failures.map((item) => item.type))].sort().map((type) => [type, failures.filter((item) => item.type === type).length])),
    interpretation: 'Observed baseline cases only. No ranking changes were made.',
  }, cases: failures,
};

const review = {
  schema_version: '1.0', review_set_id: 'search-benchmark-review-v1', generated_at: new Date().toISOString(),
  benchmark_id: benchmark.benchmark_id,
  instructions: { relevance_scale: benchmark.relevance_scale, reviewer_fields: ['reviewer_relevance', 'reviewer_notes'], rule: 'Judge from product evidence and user intent; do not copy current rank into relevance.' },
  summary: { query_count: reviewQueries.length, candidate_row_count: reviewRows.length },
  queries: reviewQueries,
};

const csvColumns = ['query_id', 'query', 'language', 'category', 'review_reason', 'product_id', 'model', 'public_rank', 'keyword_rank', 'semantic_rank', 'suggested_relevance', 'reviewer_relevance', 'reviewer_notes', 'evidence'];
const csv = [csvColumns.join(','), ...reviewRows.map((row) => csvColumns.map((column) => csvCell(row[column])).join(','))].join('\r\n') + '\r\n';

await mkdir(path.join(root, 'data', 'reports'), { recursive: true });
if (!reviewed) {
  await writeFile(path.join(root, 'data', 'evaluation', 'search-benchmark-review.json'), `${JSON.stringify(review, null, 2)}\n`, 'utf8');
  await writeFile(path.join(root, 'data', 'evaluation', 'search-benchmark-review.csv'), csv, 'utf8');
}
await writeFile(path.join(root, 'data', 'reports', reviewed ? 'search-baseline-v1.2.json' : 'search-baseline-v1.json'), `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
await writeFile(path.join(root, 'data', 'reports', reviewed ? 'search-failure-cases-v1.2.json' : 'search-failure-cases-v1.json'), `${JSON.stringify(failureReport, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ verified_relevance_metrics: baseline.verified_relevance_metrics, safety_and_operational_metrics: baseline.safety_and_operational_metrics, failure_summary: failureReport.summary, review_summary: review.summary }, null, 2));
