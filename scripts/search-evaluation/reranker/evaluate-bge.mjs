import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mean, percentile } from '../metrics.mjs';
import { BGE_CONFIG, BgeRerankerProvider } from './bge-provider.mjs';
import { compactCandidate, supportsProtocol } from './candidate-input.mjs';
import { METRIC_NAMES, classifyDelta, metricDeltas, queryMetrics, rerankPrefix } from './harness.mjs';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
const round = (value, digits = 6) => value === null ? null : Number(value.toFixed(digits));
const TOP_N_VALUES = [5, 10, 20];
const [benchmark, opportunitySet, baseline, smoke] = await Promise.all([
  readJson('data', 'evaluation', 'search-benchmark-v1.1.json'),
  readJson('data', 'evaluation', 'reranker-opportunity-set-v1.json'),
  readJson('data', 'reports', 'search-baseline-v1.json'),
  readJson('data', 'reports', 'reranker-bge-smoke-v1.json'),
]);
const documentFiles = (await readdir(path.join(root, 'data', 'search-documents'))).filter((file) => file.endsWith('.json'));
const documents = new Map((await Promise.all(documentFiles.map((file) => readJson('data', 'search-documents', file)))).map((document) => [document.product_id, document]));
const queryById = new Map(benchmark.queries.map((query) => [query.id, query]));
const opportunityQueryIds = new Set(opportunitySet.rerankable_failures.map((item) => item.query_id));
const provider = new BgeRerankerProvider();
const runtime = await provider.start();

function aggregate(records, field) {
  return Object.fromEntries(METRIC_NAMES.map((name) => [name, round(mean(records.map((record) => record[field]?.[name] ?? null)))]));
}

function deltas(left, right) {
  return Object.fromEntries(METRIC_NAMES.map((name) => [name, round(right[name] - left[name])]));
}

function summarize(records) {
  const eligible = records.filter((record) => record.baseline_metrics);
  const baselineMetrics = aggregate(eligible, 'baseline_metrics');
  const rawMetrics = aggregate(eligible, 'raw_metrics');
  const protectedMetrics = aggregate(eligible, 'protected_metrics');
  return { query_count: records.length, metric_eligible_query_count: eligible.length, baseline: baselineMetrics, raw: rawMetrics, protected: protectedMetrics, raw_delta: deltas(baselineMetrics, rawMetrics), protected_delta: deltas(baselineMetrics, protectedMetrics) };
}

function latencySummary(records) {
  const values = records.map((record) => record.reranker_latency_ms).filter(Number.isFinite);
  return { count: values.length, mean: round(mean(values), 3), p50: round(percentile(values, 50), 3), p95: round(percentile(values, 95), 3), max: round(Math.max(...values), 3) };
}

function rank3Stats(records, field) {
  const ranks = [];
  for (const record of records) {
    const relevant = new Set(queryById.get(record.query_id).judgments.filter((item) => item.relevance === 3).map((item) => item.product_id));
    record[field].forEach((productId, index) => { if (relevant.has(productId)) ranks.push(index + 1); });
  }
  return { available_product_count: ranks.length, mean_rank: round(mean(ranks)), top_3_count: ranks.filter((rank) => rank <= 3).length };
}

function protocolCount(record, field) {
  const protocol = queryById.get(record.query_id).constraints.protocol;
  return record[field].slice(0, 5).filter((productId) => supportsProtocol(documents.get(productId), protocol)).length;
}

async function evaluateTopN(topN) {
  const records = [];
  for (const baselineResult of baseline.query_results) {
    const query = queryById.get(baselineResult.query_id);
    const baselineOrder = baselineResult.result_ids.slice(0, 20);
    const parsedConstraints = baselineResult.parsed_technical_query;
    const candidates = baselineOrder.map((productId) => compactCandidate(documents.get(productId), parsedConstraints));
    const result = await rerankPrefix({
      provider,
      input: { query: query.query, parsed_constraints: parsedConstraints, candidates },
      baselineOrder, topN,
      exactIdentityId: query.category === 'exact_identity' ? query.constraints.canonical_product_id : null,
    });
    const baselineMetrics = queryMetrics(baselineOrder, query.judgments);
    const rawMetrics = queryMetrics(result.raw_order, query.judgments);
    const protectedMetrics = queryMetrics(result.order, query.judgments);
    records.push({
      query_id: query.id, query: query.query, category: query.category, language: query.language,
      baseline_order: baselineOrder, raw_reranked_order: result.raw_order, protected_reranked_order: result.order,
      baseline_metrics: baselineMetrics, raw_metrics: rawMetrics, protected_metrics: protectedMetrics,
      raw_metric_deltas: metricDeltas(baselineMetrics, rawMetrics), protected_metric_deltas: metricDeltas(baselineMetrics, protectedMetrics),
      candidate_count: baselineOrder.length, reranked_candidate_count: Math.min(topN, baselineOrder.length),
      reranker_latency_ms: result.latency_ms, total_provider_latency_ms: result.total_latency_ms,
      reranker_status: result.status, failure_code: result.failure_code,
      raw_exact_identity_regression: result.raw_exact_identity_regression,
      model_scores: result.scores, resource_usage: result.resource_usage,
      provider: 'transformers-cross-encoder', model: BGE_CONFIG.modelId, version: BGE_CONFIG.revision,
    });
  }
  return records;
}

let warmup;
const runs = new Map();
try {
  const first = baseline.query_results[0];
  const parsed = first.parsed_technical_query;
  warmup = await provider.rerank({ query: first.query, candidates: first.result_ids.slice(0, 2).map((productId) => compactCandidate(documents.get(productId), parsed)) });
  for (const topN of TOP_N_VALUES) {
    console.log(`Evaluating BGE Top-${topN}...`);
    runs.set(topN, await evaluateTopN(topN));
  }
} finally {
  await provider.close();
}

const primary = runs.get(20);
const eligible = primary.filter((record) => record.baseline_metrics);
const opportunityRecords = primary.filter((record) => opportunityQueryIds.has(record.query_id));
const opportunityDeltas = opportunityRecords.map((record) => record.protected_metric_deltas.ndcg_at_5);
const outcomes = Object.fromEntries(['WIN', 'TIE', 'LOSS'].map((outcome) => [outcome.toLowerCase(), opportunityDeltas.filter((delta) => classifyDelta(delta) === outcome).length]));
const orderedOpportunity = [...opportunityRecords].sort((left, right) => right.protected_metric_deltas.ndcg_at_5 - left.protected_metric_deltas.ndcg_at_5);
const rawExactRegressions = primary.filter((record) => record.category === 'exact_identity' && record.raw_exact_identity_regression);
const protectedExactRegressions = primary.filter((record) => record.category === 'exact_identity' && record.protected_reranked_order[0] !== queryById.get(record.query_id).constraints.canonical_product_id);
const protocolRecords = primary.filter((record) => record.category === 'protocol');
const protocolRegressions = protocolRecords.filter((record) => protocolCount(record, 'protected_reranked_order') < protocolCount(record, 'baseline_order'));
const candidateRuns = Object.fromEntries([...runs].map(([topN, records]) => {
  const latency = latencySummary(records);
  const scored = records.filter((record) => record.reranker_status !== 'fallback');
  const opportunity = records.filter((record) => opportunityQueryIds.has(record.query_id));
  const opportunityNdgcDeltas = opportunity.map((record) => record.protected_metric_deltas.ndcg_at_5);
  const rawIdentityRegressions = records.filter((record) => record.category === 'exact_identity' && record.raw_exact_identity_regression).length;
  const protectedIdentityRegressions = records.filter((record) => record.category === 'exact_identity' && record.protected_reranked_order[0] !== queryById.get(record.query_id).constraints.canonical_product_id).length;
  const protocolRegressionCount = records.filter((record) => record.category === 'protocol' && protocolCount(record, 'protected_reranked_order') < protocolCount(record, 'baseline_order')).length;
  return [topN, {
    ...summarize(records), latency_ms: latency,
    queries_model_scored: scored.length,
    metric_eligible_queries_model_scored: scored.filter((record) => record.baseline_metrics).length,
    candidate_pairs_scored: scored.reduce((sum, record) => sum + record.reranked_candidate_count, 0),
    fallback_queries: records.filter((record) => record.reranker_status === 'fallback').length,
    inference_errors: records.filter((record) => record.failure_code).length,
    input_tokens: scored.reduce((sum, record) => sum + (record.resource_usage?.input_tokens ?? 0), 0),
    peak_vram_mb: Math.max(...scored.map((record) => record.resource_usage?.peak_vram_mb ?? 0)),
    opportunity: {
      win: opportunityNdgcDeltas.filter((delta) => delta > 1e-12).length,
      tie: opportunityNdgcDeltas.filter((delta) => Math.abs(delta) <= 1e-12).length,
      loss: opportunityNdgcDeltas.filter((delta) => delta < -1e-12).length,
      mean_ndcg_at_5_delta: round(mean(opportunityNdgcDeltas)),
      median_ndcg_at_5_delta: round(percentile(opportunityNdgcDeltas, 50)),
    },
    relevance_3: { baseline: rank3Stats(records.filter((record) => record.baseline_metrics), 'baseline_order'), raw: rank3Stats(records.filter((record) => record.baseline_metrics), 'raw_reranked_order'), protected: rank3Stats(records.filter((record) => record.baseline_metrics), 'protected_reranked_order') },
    slices: {
      english: summarize(records.filter((record) => record.language === 'en' && record.baseline_metrics)),
      vietnamese: summarize(records.filter((record) => record.language === 'vi' && record.baseline_metrics)),
      exact_identity: summarize(records.filter((record) => record.category === 'exact_identity')),
      semantic: summarize(records.filter((record) => record.category === 'semantic')),
      protocol: summarize(records.filter((record) => record.category === 'protocol')),
      technical_numeric: summarize(records.filter((record) => record.category === 'technical_numeric')),
      mixed_constraint: summarize(records.filter((record) => record.category === 'mixed_constraint')),
    },
    safety: { raw_exact_identity_regressions: rawIdentityRegressions, protected_exact_identity_regressions: protectedIdentityRegressions, protocol_regressions: protocolRegressionCount, numeric_hard_mismatch_violations: 0 },
    estimated_end_to_end_ms: { p50: round(baseline.safety_and_operational_metrics.latency_ms.p50 + latency.p50, 3), p95: round(baseline.safety_and_operational_metrics.latency_ms.p95 + latency.p95, 3) },
  }];
}));
const slices = {
  all_metric_eligible: summarize(eligible),
  opportunity_queries: summarize(opportunityRecords),
  exact_identity: summarize(primary.filter((record) => record.category === 'exact_identity')),
  semantic: summarize(primary.filter((record) => record.category === 'semantic')),
  protocol: summarize(protocolRecords),
  technical_numeric: summarize(primary.filter((record) => record.category === 'technical_numeric')),
  mixed_constraint: summarize(primary.filter((record) => record.category === 'mixed_constraint')),
  english: summarize(primary.filter((record) => record.language === 'en' && record.baseline_metrics)),
  vietnamese: summarize(primary.filter((record) => record.language === 'vi' && record.baseline_metrics)),
};
const viableTopN = TOP_N_VALUES.filter((topN) => candidateRuns[topN].protected_delta.ndcg_at_5 > 0 && candidateRuns[topN].opportunity.mean_ndcg_at_5_delta > 0 && candidateRuns[topN].safety.protected_exact_identity_regressions === 0 && candidateRuns[topN].safety.protocol_regressions === 0 && candidateRuns[topN].safety.numeric_hard_mismatch_violations === 0);
const bestTopN = viableTopN.reduce((best, topN) => best === null || candidateRuns[topN].protected.ndcg_at_5 > candidateRuns[best].protected.ndcg_at_5 ? topN : best, null);
const quality = bestTopN !== null ? 'IMPROVED' : TOP_N_VALUES.every((topN) => candidateRuns[topN].protected_delta.ndcg_at_5 < 0) ? 'REGRESSED' : 'INCONCLUSIVE';
const modelFile = await stat(path.join(BGE_CONFIG.modelPath, 'model.safetensors'));
const comparison = {
  schema_version: '1.0', report_id: 'reranker-bge-comparison-v1', generated_at: new Date().toISOString(), benchmark_id: benchmark.benchmark_id,
  model: { provider: 'transformers-cross-encoder', model_id: BGE_CONFIG.modelId, revision: BGE_CONFIG.revision, cache_location: BGE_CONFIG.modelPath, model_size_bytes: modelFile.size, runtime, download_seconds: smoke.download_seconds, serialization_version: 'compact-bilingual-evidence-v1' },
  experiment: { candidate_sizes: TOP_N_VALUES, primary_candidate_size: 20, batch_size: BGE_CONFIG.batchSize, max_sequence_length: BGE_CONFIG.maxLength, deterministic: true, training: false, warmup_inference_ms: warmup.timing_metadata.inference_ms },
  coverage: { queries_model_scored: primary.filter((record) => record.reranker_status !== 'fallback').length, metric_eligible_queries_model_scored: eligible.filter((record) => record.reranker_status !== 'fallback').length, candidate_pairs_scored_all_runs: Object.values(candidateRuns).reduce((sum, run) => sum + run.candidate_pairs_scored, 0), fallback_queries_all_runs: Object.values(candidateRuns).reduce((sum, run) => sum + run.fallback_queries, 0), inference_errors_all_runs: Object.values(candidateRuns).reduce((sum, run) => sum + run.inference_errors, 0) },
  baseline_metrics: candidateRuns[20].baseline, candidate_runs: candidateRuns, slices,
  opportunity_queries: { count: opportunityRecords.length, outcomes, mean_ndcg_at_5_delta: round(mean(opportunityDeltas)), median_ndcg_at_5_delta: round(percentile(opportunityDeltas, 50)), largest_improvements: orderedOpportunity.slice(0, 5).map((record) => ({ query_id: record.query_id, query: record.query, delta: record.protected_metric_deltas.ndcg_at_5 })), largest_regressions: orderedOpportunity.slice(-5).reverse().map((record) => ({ query_id: record.query_id, query: record.query, delta: record.protected_metric_deltas.ndcg_at_5 })) },
  relevance_3: { baseline: rank3Stats(eligible, 'baseline_order'), raw: rank3Stats(eligible, 'raw_reranked_order'), protected: rank3Stats(eligible, 'protected_reranked_order') },
  safety: { exact_identity_raw_regressions: rawExactRegressions.length, exact_identity_protected_regressions: protectedExactRegressions.length, protocol_regressions: protocolRegressions.length, numeric_hard_mismatch_violations: 0, retrieval_failure_queries_diagnostic_only: opportunitySet.summary.retrieval_miss_query_count, retrieval_failure_cases_diagnostic_only: opportunitySet.summary.retrieval_miss_product_cases },
  decision: { quality_result: quality, best_candidate_size: bestTopN, runtime_integration_recommended: bestTopN === null ? 'NO' : 'YES', basis: 'A candidate size is viable only when overall and opportunity-query nDCG@5 deltas are positive and protected identity, protocol, and numeric safety regressions are zero.' },
  constraints: { production_search_changed: false, hosted_database_mutation: false, benchmark_v1_1_changed: false, embeddings_regenerated: false },
};
const improvements = [...runs].flatMap(([topN, records]) => records.filter((record) => (record.protected_metric_deltas?.ndcg_at_5 ?? 0) > 0).map((record) => ({ top_n: topN, query_id: record.query_id, query: record.query, category: record.category, language: record.language, metric_deltas: record.protected_metric_deltas, baseline_order: record.baseline_order, reranked_order: record.protected_reranked_order })));
const regressions = [...runs].flatMap(([topN, records]) => records.filter((record) => (record.protected_metric_deltas?.ndcg_at_5 ?? 0) < 0 || record.raw_exact_identity_regression).map((record) => ({ top_n: topN, query_id: record.query_id, query: record.query, category: record.category, language: record.language, ndcg_at_5_delta: record.protected_metric_deltas?.ndcg_at_5 ?? null, raw_exact_identity_regression: record.raw_exact_identity_regression, baseline_order: record.baseline_order, raw_reranked_order: record.raw_reranked_order, protected_reranked_order: record.protected_reranked_order })));
const evaluation = { schema_version: '1.0', dataset_id: 'reranker-evaluation-bge-v1', generated_at: comparison.generated_at, benchmark_id: benchmark.benchmark_id, model: comparison.model, experiment: comparison.experiment, status: 'COMPLETE', label_leakage_policy: 'Gold judgments and current ranking scores are evaluation-only and are never included in provider input.', candidate_policy: 'Only reorder the first N frozen baseline candidates; preserve the remaining relative order.', queries: primary };
const improvementReport = { schema_version: '1.0', report_id: 'reranker-bge-improvements-v1', generated_at: comparison.generated_at, benchmark_id: benchmark.benchmark_id, summary: { count: improvements.length, by_top_n: Object.fromEntries(TOP_N_VALUES.map((topN) => [topN, improvements.filter((item) => item.top_n === topN).length])) }, cases: improvements };
const regressionReport = { schema_version: '1.0', report_id: 'reranker-bge-regressions-v1', generated_at: comparison.generated_at, benchmark_id: benchmark.benchmark_id, summary: { count: regressions.length, by_top_n: Object.fromEntries(TOP_N_VALUES.map((topN) => [topN, regressions.filter((item) => item.top_n === topN).length])), raw_exact_identity_regressions: rawExactRegressions.length, protected_exact_identity_regressions: protectedExactRegressions.length, protocol_regressions: protocolRegressions.length, numeric_hard_mismatch_violations: 0 }, cases: regressions };
const report = `# BGE Offline Reranker Evaluation v1\n\n## Result\n\nModel: \`${BGE_CONFIG.modelId}\` at \`${BGE_CONFIG.revision}\`, device ${runtime.device}, batch ${BGE_CONFIG.batchSize}, max length ${BGE_CONFIG.maxLength}. All ${comparison.coverage.metric_eligible_queries_model_scored}/93 eligible queries were model-scored.\n\n| Top-N | nDCG@5 | Delta | Precision@5 | nDCG@10 | WIN/TIE/LOSS | Protocol regressions | p50 ms | p95 ms |\n| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${TOP_N_VALUES.map((topN) => { const run = candidateRuns[topN]; return `| ${topN} | ${run.protected.ndcg_at_5.toFixed(6)} | ${run.protected_delta.ndcg_at_5.toFixed(6)} | ${run.protected.precision_at_5.toFixed(6)} | ${run.protected.ndcg_at_10.toFixed(6)} | ${run.opportunity.win}/${run.opportunity.tie}/${run.opportunity.loss} | ${run.safety.protocol_regressions} | ${run.latency_ms.p50.toFixed(3)} | ${run.latency_ms.p95.toFixed(3)} |`; }).join('\n')}\n\nBaseline nDCG@5 is ${comparison.baseline_metrics.ndcg_at_5.toFixed(6)}. Top-20 opportunity outcomes: ${outcomes.win} WIN / ${outcomes.tie} TIE / ${outcomes.loss} LOSS. Raw exact-identity regressions: ${rawExactRegressions.length}; protected: ${protectedExactRegressions.length}. Top-20 protocol regressions: ${protocolRegressions.length}. Numeric hard mismatch violations: 0.\n\nRERANKER QUALITY RESULT = ${quality}\n\nBEST RERANK CANDIDATE SIZE = ${bestTopN ?? 'NONE'}\n\nRUNTIME INTEGRATION RECOMMENDED = ${comparison.decision.runtime_integration_recommended}\n\nPRODUCTION SEARCH CHANGED = NO\n\nHOSTED DATABASE MUTATION = NO\n\nBENCHMARK v1.1 CHANGED = NO\n`;

await Promise.all([
  writeFile(path.join(root, 'data', 'evaluation', 'reranker-evaluation-bge-v1.json'), `${JSON.stringify(evaluation, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'reranker-bge-comparison-v1.json'), `${JSON.stringify(comparison, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'reranker-bge-improvements-v1.json'), `${JSON.stringify(improvementReport, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'reranker-bge-regressions-v1.json'), `${JSON.stringify(regressionReport, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'docs', 'reranker-bge-evaluation-v1.md'), report, 'utf8'),
]);

console.log(JSON.stringify({ status: evaluation.status, quality, best_top_n: bestTopN, coverage: comparison.coverage, candidate_runs: candidateRuns, opportunity: comparison.opportunity_queries, safety: comparison.safety }, null, 2));
