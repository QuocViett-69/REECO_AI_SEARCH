import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
const [evaluation, comparison, improvements, regressions] = await Promise.all([
  readJson('data', 'evaluation', 'reranker-evaluation-v1.json'),
  readJson('data', 'reports', 'reranker-baseline-comparison-v1.json'),
  readJson('data', 'reports', 'reranker-improvements-v1.json'),
  readJson('data', 'reports', 'reranker-regressions-v1.json'),
]);

assert.equal(evaluation.queries.length, 100);
assert.equal(comparison.provider.status, 'unavailable');
assert.deepEqual(comparison.candidate_sizes, [5, 10, 20]);
assert.equal(comparison.safety.exact_identity.reranked.regressions, 0);
assert.equal(comparison.safety.numeric_hard_mismatch_violations.reranked, 0);
assert.equal(improvements.cases.length, 0);
assert.equal(regressions.cases.length, 0);
assert.deepEqual(comparison.constraints, {
  production_search_changed: false,
  hosted_database_mutation: false,
  benchmark_v1_1_changed: false,
  embeddings_regenerated: false,
});

for (const query of evaluation.queries) {
  assert.equal(new Set(query.reranked_order).size, query.reranked_order.length);
  assert.ok(query.reranked_order.every((productId) => query.baseline_order.includes(productId)));
  assert.deepEqual(query.reranked_order, query.baseline_order);
}

const forbidden = new Set(['embedding', 'vector', 'judgments', 'gold_rank', 'expected_product_ids']);
const visit = (value) => {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!forbidden.has(key), `Forbidden evaluation key: ${key}`);
    visit(child);
  }
};
visit(evaluation);

console.log(JSON.stringify({ result: 'PASS', queries: evaluation.queries.length, status: evaluation.status, candidate_sizes: comparison.candidate_sizes }, null, 2));
