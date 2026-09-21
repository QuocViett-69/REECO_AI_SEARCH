import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dcgAt,
  dedupeRanking,
  mean,
  ndcgAt,
  percentile,
  precisionAt,
  recallAt,
  reciprocalRankAt,
} from './metrics.mjs';

const judgments = [
  { product_id: 'A', relevance: 3 },
  { product_id: 'B', relevance: 1 },
  { product_id: 'C', relevance: 0 },
];

test('deduplicates result IDs while preserving first occurrence', () => {
  assert.deepEqual(dedupeRanking(['B', 'A', 'B', 'C']), ['B', 'A', 'C']);
});

test('computes MRR, recall, and fixed-denominator precision', () => {
  assert.equal(reciprocalRankAt(['C', 'B', 'A'], judgments, 10), 0.5);
  assert.equal(recallAt(['A'], judgments, 5), 0.5);
  assert.equal(precisionAt(['A'], judgments, 5), 0.2);
});

test('returns zero when no relevant result is retrieved', () => {
  assert.equal(reciprocalRankAt(['C'], judgments, 10), 0);
  assert.equal(recallAt(['C'], judgments, 10), 0);
  assert.equal(precisionAt(['C'], judgments, 5), 0);
});

test('returns null for an empty relevant set', () => {
  const empty = [{ product_id: 'A', relevance: 0 }];
  assert.equal(reciprocalRankAt(['A'], empty, 10), null);
  assert.equal(recallAt(['A'], empty, 10), null);
  assert.equal(precisionAt(['A'], empty, 5), null);
  assert.equal(ndcgAt(['A'], empty, 10), null);
});

test('handles short lists and ignores duplicate retrieved IDs', () => {
  assert.equal(recallAt(['A', 'A'], judgments, 10), 0.5);
  assert.equal(precisionAt(['A', 'A'], judgments, 5), 0.2);
});

test('computes graded DCG and normalized DCG', () => {
  assert.equal(dcgAt(['A', 'B'], judgments, 2), 7 + 1 / Math.log2(3));
  assert.equal(ndcgAt(['A', 'B'], judgments, 2), 1);
  assert.ok(ndcgAt(['B', 'A'], judgments, 2) < 1);
});

test('mean ignores nulls and percentile uses nearest-rank', () => {
  assert.equal(mean([1, null, 0]), 0.5);
  assert.equal(mean([null]), null);
  assert.equal(percentile([10, 20, 30, 40], 50), 20);
  assert.equal(percentile([], 95), null);
});

test('rejects invalid cutoffs', () => {
  assert.throws(() => recallAt([], judgments, 0), /positive integer/);
});
