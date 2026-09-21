import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyOpportunity,
  classifyPositiveSet,
  findJudgmentConflicts,
  parseCsv,
  validateReview,
} from './review-validation.mjs';
import { gradeEvidence } from './evidence-grading.mjs';

const benchmark = {
  queries: [
    { id: 'q1', category: 'semantic', judgment_status: 'needs_manual_review', judgments: [] },
    { id: 'q2', category: 'negative_or_ambiguous', judgment_status: 'verified', judgments: [] },
  ],
};
const review = { queries: [{ query_id: 'q1', candidate_pool: [{ product_id: 'A' }, { product_id: 'B' }] }] };
const products = [{ product_id: 'A', status: 'active' }, { product_id: 'B', status: 'active' }];
const validate = (rows) => validateReview({ benchmark, review, rows, products });

test('parses quoted CSV fields and preserves blank relevance', () => {
  const rows = parseCsv('query_id,product_id,reviewer_relevance,reviewer_notes\r\nq1,A,,"note, with comma"\r\n');
  assert.equal(rows[0].reviewer_relevance, '');
  assert.equal(rows[0].reviewer_notes, 'note, with comma');
});

test('rejects invalid, decimal, negative, and above-range relevance', () => {
  for (const value of ['x', '1.5', '-1', '4']) {
    const result = validate([{ query_id: 'q1', product_id: 'A', reviewer_relevance: value }, { query_id: 'q1', product_id: 'B', reviewer_relevance: '0' }]);
    assert.ok(result.errors.some((error) => error.code === 'invalid_relevance'), value);
  }
});

test('rejects duplicate query/product judgments', () => {
  const result = validate([
    { query_id: 'q1', product_id: 'A', reviewer_relevance: '1' },
    { query_id: 'q1', product_id: 'A', reviewer_relevance: '2' },
    { query_id: 'q1', product_id: 'B', reviewer_relevance: '0' },
  ]);
  assert.ok(result.errors.some((error) => error.code === 'duplicate_review_pair'));
});

test('distinguishes partial and complete query review', () => {
  const partial = validate([{ query_id: 'q1', product_id: 'A', reviewer_relevance: '1' }, { query_id: 'q1', product_id: 'B', reviewer_relevance: '' }]);
  assert.equal(partial.completeness[0].review_complete, false);
  assert.equal(partial.summary.partially_reviewed_queries, 1);
  const complete = validate([{ query_id: 'q1', product_id: 'A', reviewer_relevance: '1' }, { query_id: 'q1', product_id: 'B', reviewer_relevance: '0' }]);
  assert.equal(complete.completeness[0].review_complete, true);
  assert.equal(complete.status, 'HUMAN_REVIEW_COMPLETE');
});

test('surfaces deterministic and human conflicts', () => {
  assert.deepEqual(findJudgmentConflicts(
    [{ query_id: 'q1', product_id: 'A', relevance: 3, evidence: ['identity'] }],
    [{ query_id: 'q1', product_id: 'A', relevance: 1 }],
  )[0].status, 'NEEDS_RESOLUTION');
});

test('allows an intentional negative query without a positive set', () => {
  assert.equal(classifyPositiveSet(benchmark.queries[1]), 'INTENTIONAL_NEGATIVE');
});

test('separates rerankable from retrieval failures', () => {
  assert.equal(classifyOpportunity({ relevance: 3, currentRank: 9, retrievalTop20: true }), 'RERANKABLE_FAILURE');
  assert.equal(classifyOpportunity({ relevance: 3, currentRank: null, retrievalTop20: false }), 'RETRIEVAL_FAILURE');
});

test('evidence grade is independent of current ranks', () => {
  const query = { category: 'protocol', query: 'SDI-12 sensor', constraints: { protocol: 'SDI-12' } };
  const document = { taxonomy: { category_key: 'sensors', device_type_key: 'soil_sensor' }, measurements: [], applications: [], capabilities: [], supported_protocols: ['SDI-12'] };
  assert.deepEqual(gradeEvidence(query, document, { public_rank: 1, keyword_rank: 1 }), gradeEvidence(query, document, { public_rank: 20, semantic_rank: 20 }));
});
