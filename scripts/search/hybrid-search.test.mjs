import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const { HybridSearchError, HybridSearchService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'hybrid-search.service.js',
  ),
);
const { SearchScoreService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'search-score.service.js',
  ),
);

const keywordRow = (productId, rawScore = 0.5) => ({
  product_id: productId,
  model: productId,
  product_name_en: `Product ${productId}`,
  search_text: 'not exposed by hybrid candidates',
  rank: rawScore,
});
const semanticRow = (productId, rank, similarity = 0.7) => ({
  productId,
  model: productId,
  productNameEn: `Product ${productId}`,
  similarity,
  rank,
});

function harness({
  keyword = [],
  semantic = [],
  keywordError,
  semanticError,
} = {}) {
  const calls = { keyword: [], semantic: [] };
  const keywordSearch = {
    search: async (query, limit) => {
      calls.keyword.push({ query, limit });
      if (keywordError) throw keywordError;
      return keyword;
    },
  };
  const semanticSearch = {
    search: async (query, limit) => {
      calls.semantic.push({ query, limit });
      if (semanticError) throw semanticError;
      return semantic;
    },
  };
  const score = new SearchScoreService();
  return {
    score,
    service: new HybridSearchService(keywordSearch, semanticSearch, score),
    calls,
  };
}

test('calculates exact RRF contributions and two-source score', () => {
  const score = new SearchScoreService();
  assert.equal(score.getRrfK(), 60);
  assert.equal(score.calculateRrfContribution(1, 60), 1 / 61);
  assert.equal(score.calculateRrfContribution(2, 60), 1 / 62);
  assert.equal(score.calculateRrfContribution(1000, 60), 1 / 1060);
  assert.ok(
    Math.abs(score.calculateRrfScore(1, 5, 60) - (1 / 61 + 1 / 65)) <
      Number.EPSILON,
  );
  assert.equal(score.calculateRrfScore(1, null, 60), 1 / 61);
});

test('rejects invalid ranks and invalid RRF K', () => {
  const score = new SearchScoreService();
  for (const rank of [0, -1, 1.5]) {
    assert.throws(() => score.calculateRrfContribution(rank, 60));
  }
  for (const k of [0, -1, 1.5, 1001]) {
    assert.throws(() => score.calculateRrfContribution(1, k));
  }
});

test('unions by productId and merges independent source ranks', async () => {
  const { service } = harness({
    keyword: ['A', 'B', 'C'].map((id) => keywordRow(id)),
    semantic: [semanticRow('B', 1), semanticRow('D', 2), semanticRow('A', 3)],
  });
  const result = await service.search('query', 20);
  assert.equal(result.mode, 'hybrid');
  assert.equal(result.diagnostics.unionCount, 4);
  assert.deepEqual(
    [...result.candidates.map((candidate) => candidate.productId)].sort(),
    ['A', 'B', 'C', 'D'],
  );
  assert.equal(
    new Set(result.candidates.map((candidate) => candidate.productId)).size,
    4,
  );
  const a = result.candidates.find((candidate) => candidate.productId === 'A');
  const b = result.candidates.find((candidate) => candidate.productId === 'B');
  assert.deepEqual(
    { keywordRank: a.keywordRank, semanticRank: a.semanticRank },
    { keywordRank: 1, semanticRank: 3 },
  );
  assert.deepEqual(
    { keywordRank: b.keywordRank, semanticRank: b.semanticRank },
    { keywordRank: 2, semanticRank: 1 },
  );
});

test('a dual-source candidate outranks rank-one single-source candidates', async () => {
  const { service } = harness({
    keyword: [keywordRow('A'), keywordRow('B')],
    semantic: [semanticRow('C', 1), semanticRow('B', 2)],
  });
  const result = await service.search('query', 20);
  assert.equal(result.candidates[0].productId, 'B');
  assert.deepEqual(result.candidates[0].matchedBy, {
    keyword: true,
    semantic: true,
  });
});

test('uses deterministic tie-breaks and sorts null ranks last', () => {
  const score = new SearchScoreService();
  const base = {
    rrfScore: 0.01,
    matchedBy: { keyword: false, semantic: true },
  };
  const candidates = [
    { ...base, productId: 'C', keywordRank: null, semanticRank: 2 },
    { ...base, productId: 'B', keywordRank: 1, semanticRank: null },
    { ...base, productId: 'A', keywordRank: 1, semanticRank: null },
  ];
  candidates.sort((left, right) => score.compareHybridCandidates(left, right));
  assert.deepEqual(
    candidates.map((candidate) => candidate.productId),
    ['A', 'B', 'C'],
  );
});

test('runs each retrieval source once with the same clamped limit', async () => {
  const { service, calls } = harness();
  await service.search('query', 101);
  assert.deepEqual(calls.keyword, [{ query: 'query', limit: 100 }]);
  assert.deepEqual(calls.semantic, [{ query: 'query', limit: 100 }]);
});

test('uses SEARCH_RETRIEVAL_LIMIT by default', async () => {
  const { service, calls } = harness();
  await service.search('query');
  assert.equal(calls.keyword[0].limit, 20);
  assert.equal(calls.semantic[0].limit, 20);
});

test('returns hybrid when both sources succeed even if keyword returns zero rows', async () => {
  const { service } = harness({
    semantic: [semanticRow('B', 1)],
  });
  const result = await service.search('query');
  assert.equal(result.mode, 'hybrid');
  assert.deepEqual(result.diagnostics, {
    keywordSucceeded: true,
    semanticSucceeded: true,
    keywordCount: 0,
    semanticCount: 1,
    unionCount: 1,
  });
});

test('returns keyword_fallback and preserves keyword ordering', async () => {
  const { service } = harness({
    keyword: [keywordRow('B'), keywordRow('A')],
    semanticError: new Error('ollama down'),
  });
  const result = await service.search('query');
  assert.equal(result.mode, 'keyword_fallback');
  assert.deepEqual(
    result.candidates.map((candidate) => candidate.productId),
    ['B', 'A'],
  );
});

test('returns semantic_fallback and preserves semantic ordering', async () => {
  const { service } = harness({
    keywordError: new Error('keyword down'),
    semantic: [semanticRow('B', 1), semanticRow('A', 2)],
  });
  const result = await service.search('query');
  assert.equal(result.mode, 'semantic_fallback');
  assert.deepEqual(
    result.candidates.map((candidate) => candidate.productId),
    ['B', 'A'],
  );
});

test('sanitizes the error when both retrieval sources fail', async () => {
  const { service } = harness({
    keywordError: new Error('DATABASE_URL=secret'),
    semanticError: new Error('vector=[0.1] service-role-key=secret'),
  });
  await assert.rejects(service.search('query'), (error) => {
    assert.ok(error instanceof HybridSearchError);
    assert.equal(error.code, 'HYBRID_RETRIEVAL_FAILED');
    assert.equal(error.message, 'Hybrid retrieval is temporarily unavailable');
    assert.doesNotMatch(error.message, /DATABASE_URL|vector|service-role/);
    assert.ok(error.cause instanceof AggregateError);
    return true;
  });
});
