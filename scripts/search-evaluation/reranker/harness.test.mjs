import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertNoLabelLeakage,
  classifyDelta,
  eligibleCandidates,
  metricDeltas,
  rerankPrefix,
  validateRerankerOutput,
} from './harness.mjs';
import { serializeCandidate } from './bge-provider.mjs';

test('rejects labels and vectors from provider input', () => {
  assert.doesNotThrow(() => assertNoLabelLeakage({ query: 'sensor', candidates: [{ product_id: 'a' }] }));
  assert.throws(() => assertNoLabelLeakage({ candidates: [{ relevance: 3 }] }), { code: 'LABEL_LEAKAGE' });
  assert.throws(() => assertNoLabelLeakage({ candidates: [{ embedding: [0.1] }] }), { code: 'LABEL_LEAKAGE' });
});

test('serializes compact candidate evidence without ranking or label fields', () => {
  const text = serializeCandidate({
    product_id: 'p', model: 'M', product_name: 'Sensor', product_name_vi: 'Cảm biến', taxonomy: { category: 'Sensors' },
    measurements: [{ key: 'soil_moisture', label_en: 'Soil Moisture', label_vi: 'Độ ẩm đất' }], capabilities: [], applications: [],
    protocols: ['SDI-12'], relevant_normalized_specifications: [], matched_features: ['protocol:SDI-12'],
  });
  assert.match(text, /Soil Moisture/u);
  assert.match(text, /Độ ẩm đất/u);
  assert.doesNotMatch(text, /relevance|rank|score|embedding|vector/iu);
});

test('accepts only a complete candidate permutation', () => {
  assert.deepEqual(validateRerankerOutput(['a', 'b'], { ordered_candidate_ids: ['b', 'a'] }), ['b', 'a']);
  assert.throws(() => validateRerankerOutput(['a', 'b'], { ordered_candidate_ids: ['a', 'a'] }), { code: 'DUPLICATE_ID' });
  assert.throws(() => validateRerankerOutput(['a', 'b'], { ordered_candidate_ids: ['a', 'c'] }), { code: 'UNKNOWN_ID' });
  assert.throws(() => validateRerankerOutput(['a', 'b'], { ordered_candidate_ids: ['a'] }), { code: 'MISSING_ID' });
});

test('falls back on malformed output', async () => {
  const result = await rerankPrefix({
    provider: { rerank: async () => ({ nope: true }) }, input: { candidates: [{ product_id: 'a' }, { product_id: 'b' }] },
    baselineOrder: ['a', 'b'], topN: 2,
  });
  assert.deepEqual(result.order, ['a', 'b']);
  assert.equal(result.failure_code, 'MALFORMED_OUTPUT');
});

test('protects exact identity at rank one', async () => {
  const result = await rerankPrefix({
    provider: { rerank: async () => ({ ordered_candidate_ids: ['b', 'a'] }) }, input: { candidates: [{ product_id: 'a' }, { product_id: 'b' }] },
    baselineOrder: ['a', 'b'], topN: 2, exactIdentityId: 'a',
  });
  assert.deepEqual(result.order, ['a', 'b']);
  assert.deepEqual(result.raw_order, ['b', 'a']);
  assert.equal(result.raw_exact_identity_regression, true);
  assert.equal(result.status, 'success_protected');
});

test('excludes inactive and hard-mismatch candidates before inference', () => {
  assert.deepEqual(eligibleCandidates([
    { product_id: 'safe', active: true, hard_mismatch: false },
    { product_id: 'mismatch', active: true, hard_mismatch: true },
    { product_id: 'inactive', active: false, hard_mismatch: false },
  ]).map((item) => item.product_id), ['safe']);
});

test('never sends a hard mismatch to the provider', async () => {
  let received;
  const result = await rerankPrefix({
    provider: { rerank: async (input) => { received = input.candidates; return { ordered_candidate_ids: ['safe'] }; } },
    input: { candidates: [{ product_id: 'safe' }, { product_id: 'blocked', hard_mismatch: true }] },
    baselineOrder: ['safe', 'blocked'], topN: 2,
  });
  assert.deepEqual(received.map((item) => item.product_id), ['safe']);
  assert.deepEqual(result.order, ['safe']);
});

test('calculates metric deltas and win tie loss', () => {
  const deltas = metricDeltas(
    { mrr_at_10: 0.5, recall_at_5: 0.5, recall_at_10: 1, precision_at_5: 0.2, ndcg_at_5: 0.4, ndcg_at_10: 0.6 },
    { mrr_at_10: 1, recall_at_5: 0.5, recall_at_10: 1, precision_at_5: 0.4, ndcg_at_5: 0.8, ndcg_at_10: 0.7 },
  );
  assert.equal(deltas.ndcg_at_5, 0.4);
  assert.equal(classifyDelta(deltas.ndcg_at_5), 'WIN');
  assert.equal(classifyDelta(0), 'TIE');
  assert.equal(classifyDelta(-0.1), 'LOSS');
});
