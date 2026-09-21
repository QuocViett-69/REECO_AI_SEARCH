import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
const [evaluation, comparison, improvements, regressions, smoke] = await Promise.all([
  readJson('data', 'evaluation', 'reranker-evaluation-bge-v1.json'),
  readJson('data', 'reports', 'reranker-bge-comparison-v1.json'),
  readJson('data', 'reports', 'reranker-bge-improvements-v1.json'),
  readJson('data', 'reports', 'reranker-bge-regressions-v1.json'),
  readJson('data', 'reports', 'reranker-bge-smoke-v1.json'),
]);

assert.equal(smoke.result, 'PASS');
assert.equal(evaluation.status, 'COMPLETE');
assert.equal(evaluation.queries.length, 100);
assert.equal(comparison.coverage.metric_eligible_queries_model_scored, 93);
assert.equal(comparison.coverage.fallback_queries_all_runs, 0);
assert.equal(comparison.coverage.inference_errors_all_runs, 0);
assert.deepEqual(comparison.experiment.candidate_sizes, [5, 10, 20]);
assert.equal(comparison.decision.best_candidate_size, 5);
assert.equal(comparison.candidate_runs[5].safety.protected_exact_identity_regressions, 0);
assert.equal(comparison.candidate_runs[5].safety.protocol_regressions, 0);
assert.equal(comparison.candidate_runs[5].safety.numeric_hard_mismatch_violations, 0);
assert.equal(improvements.cases.length, improvements.summary.count);
assert.equal(regressions.cases.length, regressions.summary.count);
for (const query of evaluation.queries) {
  assert.equal(new Set(query.raw_reranked_order).size, query.raw_reranked_order.length);
  assert.equal(new Set(query.protected_reranked_order).size, query.protected_reranked_order.length);
  assert.ok(query.raw_reranked_order.every((productId) => query.baseline_order.includes(productId)));
  assert.ok(query.protected_reranked_order.every((productId) => query.baseline_order.includes(productId)));
  assert.notEqual(query.reranker_status, 'fallback');
}
const forbidden = new Set(['embedding', 'vector', 'judgments', 'gold_rank', 'expected_product_ids', 'keyword_score', 'semantic_score', 'rrf_score']);
const visit = (value) => {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!forbidden.has(key), `Forbidden evaluation key: ${key}`);
    visit(child);
  }
};
visit(evaluation);
assert.deepEqual(comparison.constraints, { production_search_changed: false, hosted_database_mutation: false, benchmark_v1_1_changed: false, embeddings_regenerated: false });
console.log(JSON.stringify({ result: 'PASS', queries: 100, eligible_scored: 93, candidate_pairs_scored: comparison.coverage.candidate_pairs_scored_all_runs, best_top_n: comparison.decision.best_candidate_size }, null, 2));
