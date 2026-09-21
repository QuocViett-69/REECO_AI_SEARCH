import { execFile } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { mean, percentile } from '../metrics.mjs';
import {
  METRIC_NAMES,
  classifyDelta,
  metricDeltas,
  queryMetrics,
  rerankPrefix,
} from './harness.mjs';

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..', '..', '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
const round = (value, digits = 6) => value === null ? null : Number(value.toFixed(digits));
const TOP_N_VALUES = [5, 10, 20];
const MODEL_REQUIREMENT = {
  provider_type: 'local multilingual cross-encoder reranker',
  recommended_model_id: 'BAAI/bge-reranker-v2-m3',
  required_languages: ['en', 'vi'],
  required_behavior: ['query-document relevance scoring', 'offline inference', 'deterministic ordering', 'Top-20 support'],
  installation_status: 'not_installed',
  download_performed: false,
  approval_required_before_download: true,
};

const [benchmark, opportunitySet, baseline] = await Promise.all([
  readJson('data', 'evaluation', 'search-benchmark-v1.1.json'),
  readJson('data', 'evaluation', 'reranker-opportunity-set-v1.json'),
  readJson('data', 'reports', 'search-baseline-v1.json'),
]);
const documentFiles = (await readdir(path.join(root, 'data', 'search-documents'))).filter((file) => file.endsWith('.json'));
const documents = new Map((await Promise.all(documentFiles.map((file) => readJson('data', 'search-documents', file)))).map((document) => [document.product_id, document]));
const queryById = new Map(benchmark.queries.map((query) => [query.id, query]));

async function localModels() {
  try {
    const { stdout } = await execFileAsync('ollama', ['list']);
    return stdout.trim().split(/\r?\n/u).slice(1).map((line) => line.trim().split(/\s+/u)[0]).filter(Boolean);
  } catch {
    return [];
  }
}

function supportsProtocol(document, protocol) {
  return document?.supported_protocols.some((item) => protocol === 'Modbus' ? item === 'Modbus' || item.startsWith('Modbus ') : item === protocol) ?? false;
}

function compactCandidate(productId, parsed) {
  const document = documents.get(productId);
  if (!document) throw new Error(`Missing search document for ${productId}`);
  const protocols = parsed.protocols ?? [];
  const matchedFeatures = [];
  if (parsed.identity?.productId === productId) matchedFeatures.push(`identity:${parsed.identity.matchedField}:${parsed.identity.model}`);
  for (const protocol of protocols) if (supportsProtocol(document, protocol)) matchedFeatures.push(`protocol:${protocol}`);
  const includeTemperature = (parsed.temperatureConstraints ?? []).length > 0;
  return {
    product_id: document.product_id,
    model: document.model,
    product_name: document.name_en,
    taxonomy: document.taxonomy,
    measurements: document.measurements,
    capabilities: document.capabilities,
    applications: document.applications,
    protocols: document.supported_protocols,
    relevant_normalized_specifications: includeTemperature
      ? document.important_specifications.filter((item) => item.quantity_kind === 'temperature' && item.normalized_value.type === 'range')
      : [],
    matched_features: matchedFeatures,
  };
}

const provider = {
  provider: 'none', model: null, version: null,
  async rerank() {
    throw Object.assign(new Error('No supported local reranker is installed'), { code: 'PROVIDER_UNAVAILABLE' });
  },
};

function aggregate(records, field) {
  return Object.fromEntries(METRIC_NAMES.map((name) => [name, round(mean(records.map((record) => record[field]?.[name] ?? null)))]));
}

function setSummary(records) {
  return { query_count: records.length, baseline: aggregate(records, 'baseline_metrics'), reranked: aggregate(records, 'reranked_metrics') };
}

function rank3Stats(records, field) {
  const ranks = [];
  for (const record of records) {
    const relevance3 = new Set(queryById.get(record.query_id).judgments.filter((item) => item.relevance === 3).map((item) => item.product_id));
    record[field].forEach((productId, index) => { if (relevance3.has(productId)) ranks.push(index + 1); });
  }
  return { available_product_count: ranks.length, mean_rank: round(mean(ranks)), in_top_3: ranks.filter((rank) => rank <= 3).length };
}

function exactIdentityAccuracy(records, field) {
  const exact = records.filter((record) => record.category === 'exact_identity');
  const hits = exact.filter((record) => record[field][0] === record.exact_identity_id).length;
  return { query_count: exact.length, top_1_accuracy: exact.length === 0 ? null : round(hits / exact.length), regressions: exact.length - hits };
}

function protocolEvidenceRate(records, field) {
  let checked = 0;
  let supported = 0;
  for (const record of records.filter((item) => item.category === 'protocol')) {
    const protocols = [queryById.get(record.query_id).constraints.protocol].filter(Boolean);
    for (const productId of record[field].slice(0, 5)) {
      for (const protocol of protocols) {
        checked += 1;
        if (supportsProtocol(documents.get(productId), protocol)) supported += 1;
      }
    }
  }
  return { checked, supported, rate: checked === 0 ? null : round(supported / checked) };
}

async function evaluateTopN(topN) {
  const records = [];
  for (const baselineResult of baseline.query_results) {
    const query = queryById.get(baselineResult.query_id);
    const baselineOrder = baselineResult.result_ids.slice(0, 20);
    const parsedConstraints = baselineResult.parsed_technical_query;
    const input = {
      query: query.query,
      parsed_constraints: parsedConstraints,
      candidates: baselineOrder.map((productId) => compactCandidate(productId, parsedConstraints)),
    };
    const reranked = await rerankPrefix({
      provider, input, baselineOrder, topN,
      exactIdentityId: query.category === 'exact_identity' ? query.constraints.canonical_product_id : null,
    });
    const baselineMetrics = queryMetrics(baselineOrder, query.judgments);
    const rerankedMetrics = queryMetrics(reranked.order, query.judgments);
    records.push({
      query_id: query.id, query: query.query, category: query.category, language: query.language,
      baseline_order: baselineOrder, reranked_order: reranked.order,
      baseline_metrics: baselineMetrics, reranked_metrics: rerankedMetrics,
      metric_deltas: metricDeltas(baselineMetrics, rerankedMetrics), candidate_count: baselineOrder.length,
      reranker_latency_ms: reranked.latency_ms, reranker_status: reranked.status,
      failure_code: reranked.failure_code, provider: provider.provider, model: provider.model, version: provider.version,
      exact_identity_id: query.category === 'exact_identity' ? query.constraints.canonical_product_id : null,
      parsed_constraints: parsedConstraints,
    });
  }
  return records;
}

const runs = new Map();
for (const topN of TOP_N_VALUES) runs.set(topN, await evaluateTopN(topN));
const records = runs.get(20);
const eligible = records.filter((record) => record.baseline_metrics);
const opportunityQueryIds = new Set(opportunitySet.rerankable_failures.map((item) => item.query_id));
const opportunityRecords = records.filter((record) => opportunityQueryIds.has(record.query_id));
const wins = opportunityRecords.map((record) => ({ ...record, outcome: classifyDelta(record.metric_deltas.ndcg_at_5) }));
const outcomeCounts = Object.fromEntries(['WIN', 'TIE', 'LOSS'].map((outcome) => [outcome.toLowerCase(), wins.filter((item) => item.outcome === outcome).length]));
const caseMovements = opportunitySet.rerankable_failures.map((item) => {
  const record = records.find((candidate) => candidate.query_id === item.query_id);
  const baselineRank = record.baseline_order.indexOf(item.product_id) + 1 || null;
  const rerankedRank = record.reranked_order.indexOf(item.product_id) + 1 || null;
  return { query_id: item.query_id, product_id: item.product_id, relevance: item.relevance, baseline_rank: baselineRank, reranked_rank: rerankedRank, movement: baselineRank && rerankedRank ? baselineRank - rerankedRank : null };
});
const improvementCases = wins.filter((item) => item.outcome === 'WIN').map((item) => ({ query_id: item.query_id, query: item.query, metric_deltas: item.metric_deltas, baseline_order: item.baseline_order, reranked_order: item.reranked_order }));
const regressionCases = wins.filter((item) => item.outcome === 'LOSS').map((item) => ({ query_id: item.query_id, query: item.query, reason: 'nDCG@5 decreased', metric_deltas: item.metric_deltas, baseline_order: item.baseline_order, reranked_order: item.reranked_order }));
const localOllamaModels = await localModels();
const baselineLatency = baseline.safety_and_operational_metrics.latency_ms;
const latencyValues = records.map((record) => record.reranker_latency_ms).filter((value) => value !== null);
const latency = {
  measured_inference_count: latencyValues.length,
  reranker_only_ms: { p50: latencyValues.length ? round(percentile(latencyValues, 50), 3) : null, p95: latencyValues.length ? round(percentile(latencyValues, 95), 3) : null, max: latencyValues.length ? round(Math.max(...latencyValues), 3) : null, mean: latencyValues.length ? round(mean(latencyValues), 3) : null },
  baseline_search_ms: baselineLatency,
  estimated_total_search_ms: { p50: null, p95: null, reason: 'No reranker inference was available.' },
  cold_start: 'not measured; reranker model is not installed',
};
const candidateRuns = Object.fromEntries([...runs].map(([topN, runRecords]) => [topN, {
  query_count: runRecords.length,
  inference_count: runRecords.filter((record) => record.reranker_status === 'success').length,
  fallback_count: runRecords.filter((record) => record.reranker_status === 'fallback').length,
  metrics: setSummary(runRecords.filter((record) => record.baseline_metrics)),
}]));
const experimentSets = {
  all_metric_eligible: setSummary(eligible),
  reranker_opportunity_queries: setSummary(opportunityRecords),
  exact_identity: setSummary(records.filter((record) => record.category === 'exact_identity')),
  protocol: setSummary(records.filter((record) => record.category === 'protocol')),
  technical_numeric: setSummary(records.filter((record) => record.category === 'technical_numeric')),
  semantic: setSummary(records.filter((record) => record.category === 'semantic')),
  vietnamese: setSummary(records.filter((record) => record.language === 'vi' && record.baseline_metrics)),
  english: setSummary(records.filter((record) => record.language === 'en' && record.baseline_metrics)),
  mixed_constraint: setSummary(records.filter((record) => record.category === 'mixed_constraint')),
};
const comparison = {
  schema_version: '1.0', report_id: 'reranker-baseline-comparison-v1', generated_at: new Date().toISOString(),
  benchmark_id: benchmark.benchmark_id,
  provider: { status: 'unavailable', provider: provider.provider, model: provider.model, version: provider.version, local_ollama_models: localOllamaModels, model_requirement: MODEL_REQUIREMENT },
  result: { quality: 'INCONCLUSIVE', runtime_integration_recommended: 'INCONCLUSIVE', reason: 'No suitable local reranker was installed; fallback output is not reranker evidence.' },
  candidate_sizes: TOP_N_VALUES, primary_candidate_size: 20,
  evaluation_query_count: records.length, metric_eligible_query_count: eligible.length,
  rerankable_query_count: opportunityQueryIds.size, rerankable_case_count: opportunitySet.rerankable_failures.length,
  retrieval_failure_query_count: opportunitySet.summary.retrieval_miss_query_count,
  metrics: { baseline: aggregate(eligible, 'baseline_metrics'), reranked: aggregate(eligible, 'reranked_metrics'), delta: Object.fromEntries(METRIC_NAMES.map((name) => [name, round(aggregate(eligible, 'reranked_metrics')[name] - aggregate(eligible, 'baseline_metrics')[name])])) },
  opportunity_metrics: { ...setSummary(opportunityRecords), outcomes: outcomeCounts },
  relevance_3: { baseline: rank3Stats(eligible, 'baseline_order'), reranked: rank3Stats(eligible, 'reranked_order') },
  rerankable_case_movements: { improved: caseMovements.filter((item) => item.movement > 0).length, unchanged: caseMovements.filter((item) => item.movement === 0).length, worsened: caseMovements.filter((item) => item.movement < 0).length },
  safety: {
    exact_identity: { baseline: exactIdentityAccuracy(records, 'baseline_order'), reranked: exactIdentityAccuracy(records, 'reranked_order') },
    protocol_top_5_evidence: { baseline: protocolEvidenceRate(records, 'baseline_order'), reranked: protocolEvidenceRate(records, 'reranked_order') },
    numeric_hard_mismatch_violations: { baseline: 0, reranked: 0 },
    zero_result_rate: { baseline: 0, reranked: 0 },
  },
  experiment_sets: experimentSets, candidate_runs: candidateRuns, latency,
  resource_cost: { candidate_count: 20, input_tokens: null, output_tokens: null, memory_usage: null, model_size: null, reason: 'No model inference or download occurred.' },
  repeated_run_stability: { status: 'not_run', reason: 'No reranker model is installed.' },
  constraints: { production_search_changed: false, hosted_database_mutation: false, benchmark_v1_1_changed: false, embeddings_regenerated: false },
};
const evaluation = {
  schema_version: '1.0', dataset_id: 'reranker-evaluation-v1', generated_at: comparison.generated_at,
  benchmark_id: benchmark.benchmark_id, provider: comparison.provider, prompt_version: null,
  candidate_policy: 'Rerank only the first N candidates from frozen public baseline result_ids; never introduce or resurrect candidates.',
  label_leakage_policy: 'Provider input contains query, parsed constraints, and compact product evidence only. Gold judgments are evaluation-only.',
  primary_top_n: 20, status: 'INCOMPLETE_PROVIDER_UNAVAILABLE', queries: records,
};
const improvements = { schema_version: '1.0', report_id: 'reranker-improvements-v1', generated_at: comparison.generated_at, benchmark_id: benchmark.benchmark_id, summary: { count: improvementCases.length, note: 'No model inference was available.' }, cases: improvementCases };
const regressions = { schema_version: '1.0', report_id: 'reranker-regressions-v1', generated_at: comparison.generated_at, benchmark_id: benchmark.benchmark_id, summary: { count: regressionCases.length, exact_identity_regressions: 0, protocol_regressions: 0, technical_safety_regressions: 0, note: 'No model inference was available.' }, cases: regressionCases };
const report = `# Offline Reranker Evaluation v1\n\n## Decision\n\nRERANKER OFFLINE EXPERIMENT = INCOMPLETE\n\nRERANKER QUALITY RESULT = INCONCLUSIVE\n\nRERANKER RUNTIME INTEGRATION RECOMMENDED = INCONCLUSIVE\n\nNo suitable local reranker was installed. Ollama exposes only \`${localOllamaModels.join(', ') || 'no models'}\`; the existing Qwen model is embedding-only. The harness therefore exercised validated fallback behavior without claiming a reranker quality result.\n\n## Required model\n\nUse a local multilingual cross-encoder that supports English and Vietnamese, deterministic query-document scoring, and Top-20 inference. The recommended first experiment is \`${MODEL_REQUIREMENT.recommended_model_id}\`. No model was downloaded.\n\n## Frozen evaluation\n\n- Benchmark: ${benchmark.benchmark_id}; ${records.length} queries, ${eligible.length} metric-eligible\n- Candidate sizes configured: ${TOP_N_VALUES.join(', ')}; primary Top-20\n- Rerankable: ${opportunityQueryIds.size} queries / ${opportunitySet.rerankable_failures.length} product-query cases\n- Retrieval issues kept separate: ${opportunitySet.summary.retrieval_miss_query_count} queries / ${opportunitySet.summary.retrieval_miss_product_cases} cases\n- Opportunity outcomes: ${outcomeCounts.win} win / ${outcomeCounts.tie} tie / ${outcomeCounts.loss} loss (all ties are fallback, not evidence of neutrality)\n\n## Metrics\n\n| Metric | Baseline | Fallback output | Delta |\n| --- | ---: | ---: | ---: |\n${METRIC_NAMES.map((name) => `| ${name} | ${comparison.metrics.baseline[name].toFixed(6)} | ${comparison.metrics.reranked[name].toFixed(6)} | ${comparison.metrics.delta[name].toFixed(6)} |`).join('\n')}\n\nExact identity regressions: 0. Protocol regressions: 0. Numeric hard-mismatch violations: 0. These values reflect unchanged baseline fallback, not model inference.\n\n## Latency and cost\n\nBaseline search latency is p50 ${baselineLatency.p50.toFixed(3)} ms / p95 ${baselineLatency.p95.toFixed(3)} ms. Reranker latency, total latency, tokens, memory, model size, cold start, and repeated-run stability remain unmeasured because no reranker was installed.\n\n## Safety boundary\n\nPRODUCTION SEARCH CHANGED = NO\n\nHOSTED DATABASE MUTATION = NO\n\nBENCHMARK v1.1 CHANGED = NO\n`;

await Promise.all([
  writeFile(path.join(root, 'data', 'evaluation', 'reranker-evaluation-v1.json'), `${JSON.stringify(evaluation, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'reranker-baseline-comparison-v1.json'), `${JSON.stringify(comparison, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'reranker-improvements-v1.json'), `${JSON.stringify(improvements, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'reranker-regressions-v1.json'), `${JSON.stringify(regressions, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'docs', 'reranker-evaluation-v1.md'), report, 'utf8'),
]);

console.log(JSON.stringify({ status: evaluation.status, local_models: localOllamaModels, required_model: MODEL_REQUIREMENT.recommended_model_id, metrics: comparison.metrics, opportunity_outcomes: outcomeCounts, artifacts_written: 5 }, null, 2));
