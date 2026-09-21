import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
const benchmark = await readJson('data', 'evaluation', 'search-benchmark-v1.json');
const review = await readJson('data', 'evaluation', 'search-benchmark-review.json');
const baseline = await readJson('data', 'reports', 'search-baseline-v1.json');
const failures = await readJson('data', 'reports', 'search-failure-cases-v1.json');
const finalBenchmark = await readJson('data', 'evaluation', 'search-benchmark-v1.1.json');
const finalBaseline = await readJson('data', 'reports', 'search-baseline-v1.1.json');
const finalFailures = await readJson('data', 'reports', 'search-failure-cases-v1.1.json');
const opportunities = await readJson('data', 'evaluation', 'reranker-opportunity-set-v1.json');
const products = await readJson('data', 'master', 'product-master.json');
const csv = await readFile(path.join(root, 'data', 'evaluation', 'search-benchmark-review.csv'), 'utf8');

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      values.push(value);
      value = '';
    } else value += character;
  }
  assert.equal(quoted, false, 'CSV contains an unclosed quoted field');
  values.push(value);
  return values;
}

assert.equal(benchmark.queries.length, 100);
assert.equal(new Set(benchmark.queries.map((item) => item.id)).size, 100);
assert.deepEqual(benchmark.summary.by_category, {
  exact_identity: 20,
  mixed_constraint: 10,
  negative_or_ambiguous: 10,
  product_type: 15,
  protocol: 15,
  semantic: 15,
  technical_numeric: 15,
});
assert.ok(benchmark.queries.every((item) => ['en', 'vi', 'mixed'].includes(item.language)));
assert.ok(benchmark.queries.every((item) => ['verified', 'needs_manual_review'].includes(item.judgment_status)));
assert.ok(benchmark.queries.flatMap((item) => item.judgments).every((item) => Number.isInteger(item.relevance) && item.relevance >= 0 && item.relevance <= 3));
assert.equal(review.queries.length, benchmark.summary.by_judgment_status.needs_manual_review);
const csvLines = csv.trimEnd().split(/\r?\n/u);
const csvHeader = parseCsvLine(csvLines[0]);
assert.deepEqual(csvHeader, ['query_id', 'query', 'language', 'category', 'review_reason', 'product_id', 'model', 'public_rank', 'keyword_rank', 'semantic_rank', 'suggested_relevance', 'reviewer_relevance', 'reviewer_notes', 'evidence']);
assert.equal(csvLines.length - 1, review.summary.candidate_row_count);
assert.ok(csvLines.slice(1).every((line) => parseCsvLine(line).length === csvHeader.length));
assert.equal(baseline.query_results.length, benchmark.queries.length);
assert.equal(new Set(baseline.query_results.map((item) => item.query_id)).size, 100);
assert.equal(baseline.safety_and_operational_metrics.numeric_hard_mismatch_count, 0);
assert.equal(baseline.safety_and_operational_metrics.exact_identity_queries, 20);
assert.ok(failures.cases.every((item) => item.query_id && item.type && item.severity));

const productIds = new Set(products.map((item) => item.product_id));
const removedIds = new Set(['CSI_5103', 'CSI_CPEC310', 'CSI_CR1000XE_ST_CC']);
const finalJudgments = finalBenchmark.queries.flatMap((query) => query.judgments.map((judgment) => ({ query_id: query.id, ...judgment })));
assert.equal(finalBenchmark.queries.length, 100);
assert.equal(new Set(finalBenchmark.queries.map((item) => item.id)).size, 100);
assert.ok(finalBenchmark.queries.every((item) => item.judgment_status === 'verified'));
assert.ok(finalJudgments.every((item) => Number.isInteger(item.relevance) && item.relevance >= 0 && item.relevance <= 3));
assert.equal(new Set(finalJudgments.map((item) => `${item.query_id}\u0000${item.product_id}`)).size, finalJudgments.length);
assert.ok(finalJudgments.every((item) => productIds.has(item.product_id) && !removedIds.has(item.product_id)));
assert.equal(products.length, 89);
assert.equal(products.filter((item) => item.status === 'active').length, 89);
assert.ok(productIds.has('CSI_CR1000XE_XT_CC'));
assert.equal(finalBaseline.query_results.length, 100);
assert.equal(finalFailures.summary.annotation_conflict_count, 0);
assert.doesNotMatch(JSON.stringify(opportunities), /"(?:embedding|vector)"\s*:/u);
console.log(JSON.stringify({ result: 'PASS', queries: 100, review_queries: review.queries.length, verified_judgments: finalJudgments.length, failure_cases: finalFailures.summary.confirmed_ranking_failure_count }, null, 2));
