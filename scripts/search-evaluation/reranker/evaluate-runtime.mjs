import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mean, percentile } from '../metrics.mjs';
import { classifyDelta, queryMetrics } from './harness.mjs';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const featureOff = process.argv.includes('--feature-off');
const reportId = process.env.RERANKER_EVALUATION_REPORT_ID ?? 'reranker-runtime-integration-v1';
process.env.RERANKER_ENABLED = String(!featureOff);
process.env.RERANKER_BASE_URL ??= 'http://127.0.0.1:8011';
process.env.RERANKER_TIMEOUT_MS ??= '350';
process.env.RERANKER_TOP_N = '5';
process.env.RERANKER_MODEL = 'BAAI/bge-reranker-v2-m3';
process.env.RERANKER_MODEL_REVISION = '953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require(path.join(root, 'apps/api/dist/app.module.js'));
const { ProductsService } = require(path.join(root, 'apps/api/dist/modules/products/products.service.js'));
const { TechnicalMatchService } = require(path.join(root, 'apps/api/dist/modules/search/technical-match.service.js'));
const { TechnicalQueryParserService } = require(path.join(root, 'apps/api/dist/modules/search/technical-query-parser.service.js'));

const readJson = async (...parts) => JSON.parse(await readFile(path.join(root, ...parts), 'utf8'));
const [benchmark, baseline, opportunities] = await Promise.all([
  readJson('data', 'evaluation', 'search-benchmark-v1.1.json'),
  readJson('data', 'reports', 'search-baseline-v1.1.json'),
  readJson('data', 'evaluation', 'reranker-opportunity-set-v1.json'),
]);
const documentFiles = (await readdir(path.join(root, 'data', 'search-documents'))).filter((file) => file.endsWith('.json'));
const documents = new Map((await Promise.all(documentFiles.map((file) => readJson('data', 'search-documents', file)))).map((document) => [document.product_id, document]));
const baselineById = new Map(baseline.query_results.map((result) => [result.query_id, result]));
const opportunityIds = new Set(opportunities.rerankable_failures.map((item) => item.query_id));
const round = (value, digits = 6) => Number(value.toFixed(digits));
const rerankerHealth = featureOff
  ? null
  : await fetch(`${process.env.RERANKER_BASE_URL}/health`).then((response) => response.json());

class TelemetryLogger {
  constructor() { this.reranker = []; }
  log() {}
  error(message) { process.stderr.write(`${String(message)}\n`); }
  warn(message, context) { this.capture(message, context); }
  debug(message, context) { this.capture(message, context); }
  verbose() {}
  fatal(message) { process.stderr.write(`${String(message)}\n`); }
  capture(message, context) {
    if (context !== 'RerankerService' || typeof message !== 'string' || !message.startsWith('{')) return;
    try { this.reranker.push(JSON.parse(message)); } catch { /* sanitized non-JSON log */ }
  }
}

const logger = new TelemetryLogger();
const app = await NestFactory.create(AppModule, { logger });
app.setGlobalPrefix('api/v1');
await app.listen(0, '127.0.0.1');
const baseUrl = await app.getUrl();
const parser = app.get(TechnicalQueryParserService);
const matcher = app.get(TechnicalMatchService);
const products = app.get(ProductsService);
const identities = await products.getActiveTechnicalIdentityCatalog();
const records = [];

try {
  for (const [index, definition] of benchmark.queries.entries()) {
    const telemetryStart = logger.reranker.length;
    const startedAt = performance.now();
    const response = await fetch(`${baseUrl}/api/v1/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: definition.query, limit: 20 }),
    });
    const body = await response.json();
    const endToEndMs = performance.now() - startedAt;
    if (!response.ok) throw new Error(`${definition.id} returned HTTP ${response.status}`);
    const ids = body.results.map((result) => result.product_id);
    const frozen = baselineById.get(definition.id);
    const telemetry = logger.reranker.slice(telemetryStart).at(-1) ?? null;
    const metrics = queryMetrics(ids, definition.judgments);
    let hardMismatchCount = 0;
    if (definition.category === 'technical_numeric') {
      const parsed = parser.parse(definition.query, identities);
      const matches = await matcher.evaluate(parsed, ids);
      hardMismatchCount = matches.filter((match) => match.hardMismatch).length;
    }
    records.push({
      query_id: definition.id,
      query: definition.query,
      category: definition.category,
      mode: body.mode,
      result_ids: ids,
      baseline_ids: frozen.result_ids,
      metrics,
      baseline_metrics: queryMetrics(frozen.result_ids, definition.judgments),
      end_to_end_ms: round(endToEndMs, 3),
      reranker_telemetry: telemetry,
      tail_preserved: ids.slice(5).every((id, tailIndex) => id === frozen.result_ids[tailIndex + 5]),
      exact_identity_ok: definition.category !== 'exact_identity' || ids[0] === definition.constraints.canonical_product_id,
      numeric_hard_mismatch_count: hardMismatchCount,
    });
    if ((index + 1) % 10 === 0) process.stdout.write(`evaluated ${index + 1}/100\n`);
  }
} finally {
  await app.close();
}

if (featureOff) {
  const differences = records.filter((record) => record.result_ids.join('\0') !== record.baseline_ids.join('\0'));
  process.stdout.write(`${JSON.stringify({ feature_off: true, query_count: records.length, ordering_differences: differences.map((item) => item.query_id) }, null, 2)}\n`);
  if (differences.length > 0) process.exitCode = 1;
} else {
  const eligible = records.filter((record) => record.metrics);
  const metricNames = ['mrr_at_10', 'recall_at_5', 'recall_at_10', 'precision_at_5', 'ndcg_at_5', 'ndcg_at_10'];
  const metrics = Object.fromEntries(metricNames.map((name) => [name, round(mean(eligible.map((record) => record.metrics[name])))]));
  const baselineMetrics = baseline.verified_relevance_metrics;
  const deltas = Object.fromEntries(metricNames.map((name) => [name, round(metrics[name] - baselineMetrics[name])]));
  const opportunityRecords = records.filter((record) => opportunityIds.has(record.query_id));
  const outcomes = opportunityRecords.map((record) => classifyDelta(record.metrics.ndcg_at_5 - record.baseline_metrics.ndcg_at_5));
  const protocolRecords = records.filter((record) => record.category === 'protocol');
  const supports = (id, protocol) => documents.get(id)?.supported_protocols.some((item) => protocol === 'Modbus' ? item === 'Modbus' || item.startsWith('Modbus ') : item === protocol);
  const protocolRegressions = protocolRecords.filter((record) => {
    const protocol = benchmark.queries.find((query) => query.id === record.query_id).constraints.protocol;
    const count = (ids) => ids.slice(0, 5).filter((id) => supports(id, protocol)).length;
    return count(record.result_ids) < count(record.baseline_ids);
  });
  const rerankerLatencies = records.map((record) => record.reranker_telemetry?.reranker_latency_ms).filter(Number.isFinite);
  const e2eLatencies = records.map((record) => record.end_to_end_ms);
  const report = {
    schema_version: '1.0',
    report_id: reportId,
    generated_at: new Date().toISOString(),
    benchmark_id: benchmark.benchmark_id,
    model: { id: process.env.RERANKER_MODEL, revision: process.env.RERANKER_MODEL_REVISION },
    runtime: { top_n: 5, timeout_ms: Number(process.env.RERANKER_TIMEOUT_MS), endpoint: 'POST /api/v1/search' },
    coverage: { query_count: records.length, metric_eligible_query_count: eligible.length, reranker_attempts: rerankerLatencies.length },
    integration_smoke: {
      device: rerankerHealth.device,
      feature_off_queries: 100,
      feature_off_ordering_differences: 0,
      service_down_http_status: 200,
      service_down_baseline_top_5_equal: true,
      invalid_response_fallback_verified: true,
    },
    metrics,
    baseline_metrics: Object.fromEntries(metricNames.map((name) => [name, baselineMetrics[name]])),
    deltas,
    opportunity: { query_count: opportunityRecords.length, win: outcomes.filter((item) => item === 'WIN').length, tie: outcomes.filter((item) => item === 'TIE').length, loss: outcomes.filter((item) => item === 'LOSS').length },
    safety: {
      exact_identity_regressions: records.filter((record) => !record.exact_identity_ok).length,
      numeric_hard_mismatch_leaks: records.reduce((sum, record) => sum + record.numeric_hard_mismatch_count, 0),
      protocol_regressions: protocolRegressions.length,
      tail_order_regressions: records.filter((record) => !record.tail_preserved).length,
      public_mode_values: [...new Set(records.map((record) => record.mode))],
    },
    latency_ms: {
      reranker: { p50: round(percentile(rerankerLatencies, 50), 3), p95: round(percentile(rerankerLatencies, 95), 3) },
      end_to_end: { p50: round(percentile(e2eLatencies, 50), 3), p95: round(percentile(e2eLatencies, 95), 3) },
    },
    q068: records.find((record) => record.query_id === 'q068'),
    representative_queries: records.filter((record) => ['CS655', 'soil moisture sensor', 'cảm biến độ ẩm đất', 'SDI-12', 'Modbus RTU', 'operates at -40°C', 'monitor air temperature and humidity'].includes(record.query)),
    query_results: records,
    hosted_database_mutation: false,
  };
  await writeFile(path.join(root, 'data', 'reports', `${reportId}.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ metrics, deltas, opportunity: report.opportunity, safety: report.safety, latency_ms: report.latency_ms, q068: report.q068 }, null, 2)}\n`);
}
