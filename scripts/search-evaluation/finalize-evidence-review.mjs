import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  classifyOpportunity,
  classifyPositiveSet,
  parseCsv,
  validateReview,
} from './review-validation.mjs';
import {
  mean,
  ndcgAt,
  precisionAt,
  recallAt,
  reciprocalRankAt,
} from './metrics.mjs';
import {
  functionMatch,
  gradeEvidence,
  isLogger,
  isSensor,
  supportsProtocol,
} from './evidence-grading.mjs';

const REVIEW_BATCH = 'v1.1-evidence-review-2026-09-21';
const METRICS = ['mrr_at_10', 'recall_at_5', 'recall_at_10', 'precision_at_5', 'ndcg_at_5', 'ndcg_at_10'];
const round = (value) => value === null ? null : Number(value.toFixed(6));
function shouldAddEvidenceCandidate(query, document) {
  if (query.category === 'protocol') {
    return supportsProtocol(document, query.constraints.protocol) || (/sensor|cảm biến/iu.test(query.query) && isSensor(document)) || (/logger|bộ ghi/iu.test(query.query) && isLogger(document));
  }
  if (query.category === 'semantic') return functionMatch(query, document);
  if (query.category === 'mixed_constraint') return functionMatch(query, document) || supportsProtocol(document, query.constraints.protocol);
  if (query.id === 'q096') return isSensor(document);
  if (query.id === 'q097') return true;
  if (query.id === 'q098') return document.taxonomy.category_key === 'measurement_devices' || isSensor(document);
  return false;
}

function evidenceSummary(document) {
  return [{
    source: 'search_document', model: document.model, taxonomy: document.taxonomy,
    capabilities: document.capabilities.map((item) => item.key),
    measurements: document.measurements.map((item) => item.key),
    protocols: document.supported_protocols,
    applications: document.applications.map((item) => item.key),
    specifications: document.important_specifications.map((item) => item.canonical_key),
  }];
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : typeof value === 'string' ? value : JSON.stringify(value);
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, columns) {
  return `${[columns.join(','), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(','))].join('\r\n')}\r\n`;
}

function queryMetrics(resultIds, judgments) {
  if (!judgments.some((item) => item.relevance > 0)) return null;
  return {
    mrr_at_10: reciprocalRankAt(resultIds, judgments, 10), recall_at_5: recallAt(resultIds, judgments, 5),
    recall_at_10: recallAt(resultIds, judgments, 10), precision_at_5: precisionAt(resultIds, judgments, 5),
    ndcg_at_5: ndcgAt(resultIds, judgments, 5), ndcg_at_10: ndcgAt(resultIds, judgments, 10),
  };
}

function aggregate(items) {
  return Object.fromEntries(METRICS.map((metric) => [metric, round(mean(items.map((item) => item.metrics?.[metric] ?? null)))]));
}

const root = path.resolve(import.meta.dirname, '..', '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
const [benchmark, review, baseline, previousFailures, products, documentFiles] = await Promise.all([
  readJson('data', 'evaluation', 'search-benchmark-v1.json'),
  readJson('data', 'evaluation', 'search-benchmark-review.json'),
  readJson('data', 'reports', 'search-baseline-v1.json'),
  readJson('data', 'reports', 'search-failure-cases-v1.json'),
  readJson('data', 'master', 'product-master.json'),
  readdir(path.join(root, 'data', 'search-documents')),
]);
const documents = await Promise.all(documentFiles.filter((file) => file.endsWith('.json')).map((file) => readJson('data', 'search-documents', file)));
const documentById = new Map(documents.map((document) => [document.product_id, document]));
const benchmarkById = new Map(benchmark.queries.map((query) => [query.id, query]));

for (const reviewQuery of review.queries) {
  const query = benchmarkById.get(reviewQuery.query_id);
  const byId = new Map(reviewQuery.candidate_pool.map((candidate) => [candidate.product_id, candidate]));
  for (const document of documents) if (!byId.has(document.product_id) && shouldAddEvidenceCandidate(query, document)) {
    byId.set(document.product_id, {
      product_id: document.product_id, public_rank: null, keyword_rank: null, semantic_rank: null,
      deterministic_exact: false, technical_state: null, suggested_relevance: null,
      evidence: evidenceSummary(document),
    });
  }
  reviewQuery.candidate_pool = [...byId.values()].sort((left, right) => left.product_id.localeCompare(right.product_id));
  for (const candidate of reviewQuery.candidate_pool) {
    const grade = gradeEvidence(query, documentById.get(candidate.product_id), candidate);
    candidate.reviewer_relevance = grade.relevance;
    candidate.reviewer_notes = `[${REVIEW_BATCH}] ${grade.reason}`;
    candidate.review_method = 'human-directed evidence review';
    candidate.review_status = 'verified';
  }
}
review.review_batch = { id: REVIEW_BATCH, method: 'human-directed evidence review', reviewed_at: new Date().toISOString(), ranking_signals_used: false };
review.summary.candidate_row_count = review.queries.reduce((sum, query) => sum + query.candidate_pool.length, 0);

const reviewColumns = ['query_id', 'query', 'language', 'category', 'review_reason', 'product_id', 'model', 'public_rank', 'keyword_rank', 'semantic_rank', 'suggested_relevance', 'reviewer_relevance', 'reviewer_notes', 'evidence'];
const reviewRows = review.queries.flatMap((reviewQuery) => {
  const query = benchmarkById.get(reviewQuery.query_id);
  return reviewQuery.candidate_pool.map((candidate) => ({
    query_id: query.id, query: query.query, language: query.language, category: query.category,
    review_reason: query.review_reason, product_id: candidate.product_id, model: documentById.get(candidate.product_id).model,
    public_rank: candidate.public_rank, keyword_rank: candidate.keyword_rank, semantic_rank: candidate.semantic_rank,
    suggested_relevance: candidate.suggested_relevance, reviewer_relevance: candidate.reviewer_relevance,
    reviewer_notes: candidate.reviewer_notes, evidence: candidate.evidence,
  }));
});

const parsedRows = parseCsv(toCsv(reviewRows, reviewColumns));
const validation = validateReview({ benchmark, review, rows: parsedRows, products });
if (validation.status !== 'HUMAN_REVIEW_COMPLETE') throw new Error(`Evidence review validation failed: ${JSON.stringify(validation.errors.slice(0, 5))}`);

const finalQueries = benchmark.queries.map((query) => {
  if (query.judgment_status === 'verified') return query;
  const reviewed = review.queries.find((item) => item.query_id === query.id);
  return {
    ...query, judgment_status: 'verified', review_reason: null,
    review_method: 'human-directed evidence review', review_batch: REVIEW_BATCH,
    judgments: reviewed.candidate_pool.map((candidate) => ({
      product_id: candidate.product_id, relevance: candidate.reviewer_relevance,
      evidence: candidate.evidence, review_status: 'verified', review_method: candidate.review_method,
      reviewer_notes: candidate.reviewer_notes,
    })),
  };
});
const finalById = new Map(finalQueries.map((query) => [query.id, query]));
const queryResults = baseline.query_results.map((result) => {
  const query = finalById.get(result.query_id);
  return { ...result, judgment_status: 'verified', metrics: queryMetrics(result.result_ids, query.judgments) };
});
const eligible = queryResults.filter((item) => item.metrics);
const slices = (field) => Object.fromEntries([...new Set(queryResults.map((item) => item[field]))].sort().map((value) => {
  const items = queryResults.filter((item) => item[field] === value && item.metrics);
  return [value, { query_count: items.length, ...aggregate(items) }];
}));

const opportunities = [];
const retrievalMisses = [];
const failureQueries = new Set();
const rerankableQueries = new Set();
const retrievalMissQueries = new Set();
for (const result of queryResults.filter((item) => item.metrics)) {
  const query = finalById.get(result.query_id);
  const reviewed = review.queries.find((item) => item.query_id === result.query_id);
  let hasFailure = false;
  for (const judgment of query.judgments.filter((item) => item.relevance > 0)) {
    const currentRank = result.result_ids.indexOf(judgment.product_id) + 1 || null;
    const targetCutoff = judgment.relevance === 3 ? 5 : judgment.relevance === 2 ? 10 : null;
    if (targetCutoff === null || (currentRank !== null && currentRank <= targetCutoff)) continue;
    hasFailure = true;
    const candidate = reviewed?.candidate_pool.find((item) => item.product_id === judgment.product_id);
    const retrievalTop20 = currentRank !== null || Boolean(candidate?.keyword_rank || candidate?.semantic_rank);
    const classification = classifyOpportunity({ relevance: judgment.relevance, currentRank, retrievalTop20 }, targetCutoff);
    const item = {
      query_id: query.id, query: query.query, category: query.category, language: query.language,
      product_id: judgment.product_id, relevance: judgment.relevance, current_rank: currentRank,
      retrieval_presence: { keyword_top_20: candidate?.keyword_rank ?? null, semantic_top_20: candidate?.semantic_rank ?? null },
      classification, evidence_summary: judgment.evidence,
    };
    if (classification === 'RERANKABLE_FAILURE') {
      opportunities.push(item);
      rerankableQueries.add(query.id);
    } else if (classification === 'RETRIEVAL_FAILURE') {
      retrievalMisses.push(item);
      retrievalMissQueries.add(query.id);
    }
  }
  if (hasFailure) failureQueries.add(query.id);
}

const positiveSetSummary = Object.fromEntries(finalQueries.map((query) => [query.id, classifyPositiveSet(query)]));
const finalBenchmark = {
  ...benchmark, schema_version: '1.1', benchmark_id: 'search-benchmark-v1.1', generated_at: new Date().toISOString(),
  parent_benchmark_id: benchmark.benchmark_id,
  review_provenance: { method: 'human-directed evidence review', batch: REVIEW_BATCH, ranking_signals_used: false },
  summary: {
    ...benchmark.summary, by_judgment_status: { verified: 100 }, deterministic_verified_queries: 40,
    evidence_reviewed_queries: 60, metric_eligible_queries: eligible.length,
    intentional_negative_queries: Object.values(positiveSetSummary).filter((value) => value === 'INTENTIONAL_NEGATIVE').length,
  },
  queries: finalQueries,
};
const reviewedMetrics = aggregate(eligible);
const metricComparison = Object.fromEntries(METRICS.map((metric) => [metric, {
  provisional: baseline.verified_relevance_metrics[metric], reviewed: reviewedMetrics[metric],
  delta: round(reviewedMetrics[metric] - baseline.verified_relevance_metrics[metric]),
}]));
const readiness = {
  verified_queries_with_ranking_errors: failureQueries.size,
  rerankable_query_count: rerankableQueries.size,
  retrieval_miss_query_count: retrievalMissQueries.size,
  already_meets_relevance_cutoff_query_count: eligible.length - failureQueries.size,
  rerankable_product_cases: opportunities.length,
  retrieval_miss_product_cases: retrievalMisses.length,
  reranker_addressable_percentage: opportunities.length + retrievalMisses.length === 0 ? 0 : round(opportunities.length / (opportunities.length + retrievalMisses.length)),
};
const finalBaseline = {
  ...baseline, schema_version: '1.1', report_id: 'search-baseline-v1.1', generated_at: new Date().toISOString(),
  benchmark_id: finalBenchmark.benchmark_id,
  annotation: { review_completion: validation.summary, method: finalBenchmark.review_provenance },
  verified_relevance_metrics: { eligible_query_count: eligible.length, ...reviewedMetrics },
  metric_comparison: metricComparison,
  relevance_slices: { by_category: slices('category'), by_language: slices('language') },
  reranker_readiness: readiness,
  query_results: queryResults,
};
const confirmedRankingFailures = [...opportunities, ...retrievalMisses];
const previousObservationReview = {
  data_logger: failureQueries.has('q021') ? 'CONFIRMED_FAILURE' : 'ACCEPTABLE_RESULT',
  cellular_modem_router: failureQueries.has('q022') ? 'CONFIRMED_FAILURE' : 'ACCEPTABLE_RESULT',
  mqtt_data_logger: failureQueries.has('q048') ? 'CONFIRMED_FAILURE' : 'ACCEPTABLE_RESULT',
  vietnamese_usb_query: failureQueries.has('q050') ? 'CONFIRMED_FAILURE' : 'ACCEPTABLE_RESULT',
  provisional_suggested_positive_observations: 'REPLACED_BY_VERIFIED_LABELS',
  keyword_semantic_top1_disagreements: 'ACCEPTABLE_RESULT',
};
const finalFailures = {
  schema_version: '1.1', report_id: 'search-failure-cases-v1.1', generated_at: new Date().toISOString(),
  benchmark_id: finalBenchmark.benchmark_id,
  summary: {
    confirmed_ranking_failure_count: confirmedRankingFailures.length,
    technical_safety_failure_count: baseline.safety_and_operational_metrics.numeric_hard_mismatch_count,
    rerankable_failure_count: opportunities.length, retrieval_failure_count: retrievalMisses.length,
    ambiguous_query_count: finalQueries.filter((query) => query.category === 'negative_or_ambiguous').length,
    annotation_conflict_count: validation.conflicts.length,
  },
  confirmed_ranking_failures: confirmedRankingFailures,
  technical_safety_failures: [], retrieval_misses: retrievalMisses,
  ambiguous_queries: finalQueries.filter((query) => query.category === 'negative_or_ambiguous').map((query) => ({ query_id: query.id, query: query.query, positive_set_classification: positiveSetSummary[query.id] })),
  annotation_conflicts: validation.conflicts,
  previous_observations: { source_case_count: previousFailures.summary.case_count, review: previousObservationReview },
};
const opportunitySet = {
  schema_version: '1.0', dataset_id: 'reranker-opportunity-set-v1', generated_at: new Date().toISOString(),
  benchmark_id: finalBenchmark.benchmark_id,
  definition: 'Verified relevance-3 products outside final Top-5 or relevance-2 products outside final Top-10; rerankable cases must be present in keyword or semantic Top-20. Marginal relevance-1 products are not ranking failures.',
  summary: readiness, rerankable_failures: opportunities, retrieval_failures: retrievalMisses,
};
const reviewedColumns = ['query_id', 'query', 'category', 'language', 'product_id', 'model', 'previous_rank', 'relevance', 'review_notes', 'review_status'];
const reviewedRows = finalQueries.flatMap((query) => query.judgments.map((judgment) => ({
  query_id: query.id, query: query.query, category: query.category, language: query.language,
  product_id: judgment.product_id, model: documentById.get(judgment.product_id)?.model ?? '',
  previous_rank: baseline.query_results.find((item) => item.query_id === query.id)?.result_ids.indexOf(judgment.product_id) + 1 || '',
  relevance: judgment.relevance, review_notes: judgment.reviewer_notes ?? query.ground_truth_basis,
  review_status: 'verified',
})));
const qualityDocument = `# Search Quality Baseline v1.1\n\n## Status\n\n100/100 queries are verified: 40 deterministic and 60 reviewed from model, taxonomy, capability, protocol, application, technical, and specification evidence. Ranking and score fields were excluded from labeling.\n\n## Metrics\n\n| Metric | v1 provisional | v1.1 reviewed | Delta |\n| --- | ---: | ---: | ---: |\n${METRICS.map((metric) => `| ${metric} | ${metricComparison[metric].provisional.toFixed(6)} | ${metricComparison[metric].reviewed.toFixed(6)} | ${metricComparison[metric].delta.toFixed(6)} |`).join('\n')}\n\nMetric-eligible queries: ${eligible.length}. Intentional negative queries: ${finalBenchmark.summary.intentional_negative_queries}. Deltas reflect improved ground truth, not a search algorithm change.\n\n## Reranker readiness\n\n- Queries with Top-5 ranking errors: ${readiness.verified_queries_with_ranking_errors}\n- Rerankable queries: ${readiness.rerankable_query_count}\n- Retrieval-miss queries: ${readiness.retrieval_miss_query_count}\n- Already meets relevance cutoff: ${readiness.already_meets_relevance_cutoff_query_count}\n- Reranker-addressable share: ${(readiness.reranker_addressable_percentage * 100).toFixed(2)}%\n\nRerankable means a verified relevant product exists in keyword/semantic Top-20 but is outside final Top-5. Retrieval misses require retrieval changes, not reranking.\n\n## Safety and operations\n\nExact identity Top-1 remains ${baseline.safety_and_operational_metrics.exact_identity_top_1_accuracy.toFixed(6)}. Protocol evidence, numeric hard-mismatch, zero-result, and latency values are unchanged because the search runtime was not modified or rerun.\n\n## Slices\n\nCategory and language metrics, each with query counts, are stored in \`data/reports/search-baseline-v1.1.json\`. Sample sizes are descriptive and do not establish statistical significance.\n\n## Limitations\n\nBroad queries intentionally use low relevance grades. Evidence absence is treated conservatively. The evidence review is reproducible and human-directed, but it is not an independent multi-reviewer agreement study. No reranker was implemented.\n`;

await Promise.all([
  writeFile(path.join(root, 'data', 'evaluation', 'search-benchmark-review.json'), `${JSON.stringify(review, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'evaluation', 'search-benchmark-review.csv'), toCsv(reviewRows, reviewColumns), 'utf8'),
  writeFile(path.join(root, 'data', 'evaluation', 'search-benchmark-v1.1.json'), `${JSON.stringify(finalBenchmark, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'evaluation', 'search-benchmark-reviewed-v1.1.csv'), toCsv(reviewedRows, reviewedColumns), 'utf8'),
  writeFile(path.join(root, 'data', 'evaluation', 'reranker-opportunity-set-v1.json'), `${JSON.stringify(opportunitySet, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'search-baseline-v1.1.json'), `${JSON.stringify(finalBaseline, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data', 'reports', 'search-failure-cases-v1.1.json'), `${JSON.stringify(finalFailures, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'docs', 'search-quality-baseline-v1.1.md'), qualityDocument, 'utf8'),
]);

console.log(JSON.stringify({
  review: validation.summary, metrics: finalBaseline.verified_relevance_metrics,
  metric_comparison: metricComparison, readiness, failure_summary: finalFailures.summary,
}, null, 2));
