import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { SearchResponseSchema } = require(
  path.join(projectRoot, 'packages', 'shared', 'dist', 'index.js'),
);
const { ProductsService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'products',
    'products.service.js',
  ),
);
const { HybridSearchError } = require(
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
const { SearchController } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'search.controller.js',
  ),
);
const { SearchService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'search.service.js',
  ),
);
const { TechnicalQueryParserService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'technical-query-parser.service.js',
  ),
);
const { TechnicalRankingService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'technical-ranking.service.js',
  ),
);

const candidate = (
  productId,
  { keywordScore = null, semanticScore = null, rrfScore = 0.01 } = {},
) => ({
  productId,
  model: productId,
  productNameEn: `Product ${productId}`,
  keywordRank: keywordScore === null ? null : 1,
  semanticRank: semanticScore === null ? null : 1,
  keywordScore,
  semanticScore,
  rrfScore,
  matchedBy: {
    keyword: keywordScore !== null,
    semantic: semanticScore !== null,
  },
});

const summary = (productId, status = 'active') => ({
  product_id: productId,
  model: productId,
  name_en: `Product ${productId}`,
  name_vi: null,
  category: 'Sensors',
  subcategory: null,
  device_type: 'Sensor',
  image_url: null,
  status,
});

const hybridResult = (mode, candidates) => ({
  mode,
  candidates,
  diagnostics: {
    keywordSucceeded: mode !== 'semantic_fallback',
    semanticSucceeded: mode !== 'keyword_fallback',
    keywordCount: candidates.filter((item) => item.matchedBy.keyword).length,
    semanticCount: candidates.filter((item) => item.matchedBy.semantic).length,
    unionCount: candidates.length,
  },
});

const noSignalQuery = (query) => ({
  parserVersion: 'technical-query-v1',
  originalQuery: query,
  identity: null,
  protocols: [],
  temperatureConstraints: [],
  confidence: { identity: 'none', protocol: 'none', temperature: 'none' },
});

function createSearchService(
  hybridSearch,
  productsService,
  {
    parser = { parse: (query) => noSignalQuery(query) },
    matcher = {
      evaluate: async () => {
        throw new Error('technical matcher should not run');
      },
    },
    ranking = new TechnicalRankingService(),
    reranker = { rerank: async (_query, _parsed, baseline) => baseline },
  } = {},
) {
  return new SearchService(
    hybridSearch,
    productsService,
    parser,
    matcher,
    ranking,
    reranker,
  );
}

function harness(resultFactory) {
  const calls = [];
  const hybridSearch = {
    search: async (query, limit) => {
      calls.push({ query, limit });
      return resultFactory(query, limit);
    },
  };
  const productsService = {
    getActiveTechnicalIdentityCatalog: async () => [],
    getPublicSummariesByIds: async (ids) =>
      new Map(ids.map((id) => [id, summary(id)])),
  };
  return {
    calls,
    service: createSearchService(hybridSearch, productsService),
  };
}

test('shared SearchResponse contract accepts public modes only', () => {
  const response = {
    query: 'equipment',
    mode: 'hybrid',
    results: [],
  };
  for (const mode of ['keyword', 'semantic', 'hybrid']) {
    assert.equal(
      SearchResponseSchema.safeParse({ ...response, mode }).success,
      true,
    );
  }
  for (const mode of ['keyword_fallback', 'semantic_fallback', 'rerank']) {
    assert.equal(
      SearchResponseSchema.safeParse({ ...response, mode }).success,
      false,
    );
  }
});

test('maps hybrid candidates and all score slots without fabricating features', async () => {
  const candidates = [
    candidate('A', {
      keywordScore: 0.9,
      semanticScore: 0.8,
      rrfScore: 0.03,
    }),
    candidate('B', { keywordScore: 0.7, rrfScore: 0.02 }),
    candidate('C', { semanticScore: 0.6, rrfScore: 0.01 }),
  ];
  const { service } = harness(() => hybridResult('hybrid', candidates));
  const response = await service.search({ query: 'equipment', limit: 10 });

  assert.equal(response.mode, 'hybrid');
  assert.deepEqual(
    response.results.map((result) => result.scores),
    [
      { keyword: 0.9, semantic: 0.8, hybrid: 0.03, rerank: null },
      { keyword: 0.7, semantic: null, hybrid: 0.02, rerank: null },
      { keyword: 0, semantic: 0.6, hybrid: 0.01, rerank: null },
    ],
  );
  assert.ok(
    response.results.every((result) => result.matched_features.length === 0),
  );
  assert.deepEqual(SearchResponseSchema.parse(response), response);
});

test('water temperature search excludes soil and black globe sensors', async () => {
  const models = ['TEMPVUE50', 'TCAV', 'BLACKGLOBE'];
  const documents = await Promise.all(models.map(async (model) => JSON.parse(await readFile(
    path.join(projectRoot, 'data', 'search-documents', `CSI_${model}.json`), 'utf8',
  ))));
  const byId = new Map(documents.map((document) => [document.product_id, document]));
  const products = {
    getSearchDocumentsByIds: async (ids) => new Map(ids.map((id) => [id, byId.get(id)])),
    getActiveTechnicalIdentityCatalog: async () => [],
    getPublicSummariesByIds: async (ids) => new Map(ids.map((id) => [id, summary(id)])),
  };
  const service = createSearchService(
    { search: async () => hybridResult('hybrid', documents.map((document) => candidate(document.product_id))) },
    products,
  );
  const response = await service.search({ query: 'tôi muốn mua một cảm biến đo nhiệt độ nước', limit: 10 });
  assert.deepEqual(response.results.map((result) => result.product_id), [documents[0].product_id]);
});

test('maps keyword fallback to public keyword mode and preserves ordering', async () => {
  const candidates = [
    candidate('B', { keywordScore: 0.8 }),
    candidate('A', { keywordScore: 0.5 }),
  ];
  const { service } = harness(() =>
    hybridResult('keyword_fallback', candidates),
  );
  const response = await service.search({ query: 'equipment', limit: 10 });

  assert.equal(response.mode, 'keyword');
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['B', 'A'],
  );
  assert.deepEqual(response.results[0].scores, {
    keyword: 0.8,
    semantic: null,
    hybrid: null,
    rerank: null,
  });
});

test('maps semantic fallback to public semantic mode and preserves ordering', async () => {
  const candidates = [
    candidate('B', { semanticScore: 0.8 }),
    candidate('A', { semanticScore: 0.5 }),
  ];
  const { service } = harness(() =>
    hybridResult('semantic_fallback', candidates),
  );
  const response = await service.search({ query: 'equipment', limit: 10 });

  assert.equal(response.mode, 'semantic');
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['B', 'A'],
  );
  assert.deepEqual(response.results[0].scores, {
    keyword: 0,
    semantic: 0.8,
    hybrid: null,
    rerank: null,
  });
});

test('separates final request limit from configured retrieval depth', async () => {
  const allCandidates = Array.from({ length: 100 }, (_, index) =>
    candidate(`P${String(index + 1).padStart(3, '0')}`, {
      keywordScore: 1 / (index + 1),
      semanticScore: 1 / (index + 1),
    }),
  );
  const { service, calls } = harness((_query, limit) =>
    hybridResult('hybrid', allCandidates.slice(0, limit)),
  );

  for (const requestLimit of [5, 20, 50, 100]) {
    const response = await service.search({
      query: `limit ${requestLimit}`,
      limit: requestLimit,
    });
    assert.ok(response.results.length <= requestLimit);
  }
  assert.deepEqual(
    calls.map((call) => call.limit),
    [20, 20, 50, 100],
  );
});

test('preserves hybrid order after unordered hydration and drops missing summaries', async () => {
  const ranked = ['C', 'A', 'B'].map((id) =>
    candidate(id, { keywordScore: 0.5, semanticScore: 0.5 }),
  );
  const hybridSearch = {
    search: async () => hybridResult('hybrid', ranked),
  };
  const productsService = {
    getPublicSummariesByIds: async () =>
      new Map([
        ['A', summary('A')],
        ['C', summary('C')],
      ]),
  };
  productsService.getActiveTechnicalIdentityCatalog = async () => [];
  const response = await createSearchService(
    hybridSearch,
    productsService,
  ).search({ query: 'equipment', limit: 10 });

  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['C', 'A'],
  );
});

test('uses active-only ProductsService hydration as the final review-product defense', async () => {
  const calls = [];
  const repository = {
    listByIds: async (ids, activeOnly) => {
      calls.push({ ids, activeOnly });
      return ids
        .map((id) => summary(id, id === 'REVIEW' ? 'review' : 'active'))
        .filter((product) => !activeOnly || product.status === 'active')
        .map((product) => ({
          product_id: product.product_id,
          model: product.model,
          product_name_en: product.name_en,
          category: product.category,
          subcategory: product.subcategory,
          device_type: product.device_type,
          status: product.status,
        }));
    },
    listDocuments: async () => [],
    listMedia: async () => [],
    listActiveIdentityCatalog: async () => [],
  };
  const productsService = new ProductsService(repository);
  const hybridSearch = {
    search: async () =>
      hybridResult(
        'hybrid',
        ['A', 'REVIEW', 'C'].map((id) =>
          candidate(id, { keywordScore: 0.5, semanticScore: 0.5 }),
        ),
      ),
  };
  const response = await createSearchService(
    hybridSearch,
    productsService,
  ).search({ query: 'equipment', limit: 10 });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].activeOnly, true);
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['A', 'C'],
  );
});

test('integrates exact identity priority with one parse and unchanged RRF score', async () => {
  const calls = { catalog: 0, parse: 0, match: 0, hydrate: 0 };
  const candidates = [
    candidate('OTHER', {
      keywordScore: 0.9,
      semanticScore: 0.9,
      rrfScore: 0.04,
    }),
    candidate('CSI_CS655', {
      keywordScore: 0.4,
      semanticScore: 0.4,
      rrfScore: 0.01,
    }),
  ];
  const productsService = {
    getActiveTechnicalIdentityCatalog: async () => {
      calls.catalog += 1;
      return [
        { productId: 'CSI_CS655', model: 'CS655' },
        { productId: 'OTHER', model: 'OTHER' },
      ];
    },
    getPublicSummariesByIds: async (ids) => {
      calls.hydrate += 1;
      return new Map(ids.map((id) => [id, summary(id)]));
    },
  };
  const realParser = new TechnicalQueryParserService();
  const parser = {
    parse: (query, catalog) => {
      calls.parse += 1;
      return realParser.parse(query, catalog);
    },
  };
  const matcher = {
    evaluate: async (parsed, ids) => {
      calls.match += 1;
      assert.equal(parsed.identity.productId, 'CSI_CS655');
      assert.deepEqual(ids, ['OTHER', 'CSI_CS655']);
      return [
        {
          productId: 'OTHER',
          identityMatch: 'none',
          identityEvidence: [],
          protocolMatches: [],
          temperatureMatches: [],
          hardMismatch: false,
        },
        {
          productId: 'CSI_CS655',
          identityMatch: 'exact',
          identityEvidence: [
            { source: 'products', field: 'model', value: 'CS655' },
          ],
          protocolMatches: [],
          temperatureMatches: [],
          hardMismatch: false,
        },
      ];
    },
  };
  const service = createSearchService(
    { search: async () => hybridResult('hybrid', candidates) },
    productsService,
    { parser, matcher },
  );

  const response = await service.search({ query: 'CS655', limit: 10 });
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['CSI_CS655'],
  );
  assert.equal(response.results[0].scores.hybrid, 0.01);
  assert.deepEqual(response.results[0].matched_features, [
    'identity:model:CS655',
  ]);
  assert.deepEqual(calls, { catalog: 1, parse: 1, match: 1, hydrate: 1 });
});

test('does not exact-pin a partial model query', async () => {
  let matcherCalls = 0;
  const productsService = {
    getActiveTechnicalIdentityCatalog: async () => [
      { productId: 'CSI_CS655', model: 'CS655' },
    ],
    getPublicSummariesByIds: async (ids) =>
      new Map(ids.map((id) => [id, summary(id)])),
  };
  const service = createSearchService(
    {
      search: async () =>
        hybridResult('hybrid', [
          candidate('OTHER', { rrfScore: 0.04 }),
          candidate('CSI_CS655', { rrfScore: 0.03 }),
        ]),
    },
    productsService,
    {
      parser: new TechnicalQueryParserService(),
      matcher: {
        evaluate: async () => {
          matcherCalls += 1;
          return [];
        },
      },
    },
  );

  const response = await service.search({ query: 'CS65', limit: 10 });
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['OTHER', 'CSI_CS655'],
  );
  assert.equal(matcherCalls, 0);
});

test('applies protocol priority in keyword and semantic fallback modes', async () => {
  for (const [internalMode, publicMode] of [
    ['keyword_fallback', 'keyword'],
    ['semantic_fallback', 'semantic'],
  ]) {
    const productsService = {
      getActiveTechnicalIdentityCatalog: async () => [],
      getPublicSummariesByIds: async (ids) =>
        new Map(ids.map((id) => [id, summary(id)])),
    };
    const matcher = {
      evaluate: async (_parsed, ids) =>
        ids.map((id) => ({
          productId: id,
          identityMatch: 'none',
          identityEvidence: [],
          protocolMatches: [
            {
              queryProtocol: 'SDI-12',
              result: id === 'MATCH' ? 'MATCH' : 'UNKNOWN',
              evidence:
                id === 'MATCH'
                  ? [
                      {
                        source: 'product_document',
                        canonicalProtocol: 'SDI-12',
                        relation: 'supported',
                      },
                    ]
                  : [],
            },
          ],
          temperatureMatches: [],
          hardMismatch: false,
        })),
    };
    const scores =
      internalMode === 'keyword_fallback'
        ? { keywordScore: 0.8 }
        : { semanticScore: 0.8 };
    const service = createSearchService(
      {
        search: async () =>
          hybridResult(internalMode, [
            candidate('UNKNOWN', scores),
            candidate('MATCH', scores),
          ]),
      },
      productsService,
      { parser: new TechnicalQueryParserService(), matcher },
    );

    const response = await service.search({ query: 'SDI-12', limit: 10 });
    assert.equal(response.mode, publicMode);
    assert.deepEqual(
      response.results.map((result) => result.product_id),
      ['MATCH'],
    );
    assert.deepEqual(response.results[0].matched_features, ['protocol:SDI-12']);
  }
});

test('requires confirmed numeric evidence before applying the result limit', async () => {
  const productsService = {
    getActiveTechnicalIdentityCatalog: async () => [],
    getPublicSummariesByIds: async (ids) =>
      new Map(ids.map((id) => [id, summary(id)])),
  };
  const constraint = {
    kind: 'point',
    intent: 'operating',
    valueCelsius: -40,
    unit: '°C',
    confidence: 'high',
  };
  const matcher = {
    evaluate: async (_parsed, ids) =>
      ids.map((id) => {
        const result =
          id === 'MATCH' ? 'MATCH' : id === 'MISMATCH' ? 'MISMATCH' : 'UNKNOWN';
        return {
          productId: id,
          identityMatch: 'none',
          identityEvidence: [],
          protocolMatches: [],
          temperatureMatches: [
            {
              constraint,
              result,
              evidence:
                result === 'MATCH'
                  ? [
                      {
                        source: 'normalized_spec',
                        canonicalKey: 'operating_temperature_range',
                        candidateRange: {
                          minCelsius: -50,
                          maxCelsius: 70,
                          unit: '°C',
                        },
                        result: 'MATCH',
                        rawRef: {
                          file: 'data/raw/test.json',
                          product_index: 0,
                          spec_index: 0,
                          source_rows: [1],
                        },
                      },
                    ]
                  : [],
            },
          ],
          hardMismatch: result === 'MISMATCH',
        };
      }),
  };
  const service = createSearchService(
    {
      search: async () =>
        hybridResult('hybrid', [
          candidate('MISMATCH', { rrfScore: 0.04 }),
          candidate('UNKNOWN', { rrfScore: 0.03 }),
          candidate('MATCH', { rrfScore: 0.02 }),
        ]),
    },
    productsService,
    { parser: new TechnicalQueryParserService(), matcher },
  );

  const response = await service.search({
    query: 'operates at -40°C',
    limit: 2,
  });
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['MATCH'],
  );
  assert.equal(response.results[0].scores.hybrid, 0.02);
  assert.deepEqual(response.results[0].matched_features, [
    'operating-temperature:-40°C',
  ]);
  assert.equal(response.results.length, 1);
});

test('returns an empty success after identity routing without technical matching', async () => {
  let catalogCalls = 0;
  let parserCalls = 0;
  let matcherCalls = 0;
  const service = createSearchService(
    { search: async () => hybridResult('hybrid', []) },
    {
      getActiveTechnicalIdentityCatalog: async () => {
        catalogCalls += 1;
        return [];
      },
      getPublicSummariesByIds: async () => new Map(),
    },
    {
      parser: {
        parse: () => {
          parserCalls += 1;
          return noSignalQuery('sensor');
        },
      },
      matcher: {
        evaluate: async () => {
          matcherCalls += 1;
          return [];
        },
      },
    },
  );

  const response = await service.search({ query: 'equipment', limit: 10 });
  assert.deepEqual(response.results, []);
  assert.deepEqual(
    { catalogCalls, parserCalls, matcherCalls },
    {
      catalogCalls: 1,
      parserCalls: 1,
      matcherCalls: 0,
    },
  );
});

test('successful reranking stays schema-compatible and keeps raw logits private', async () => {
  const productsService = {
    getActiveTechnicalIdentityCatalog: async () => [],
    getPublicSummariesByIds: async (ids) =>
      new Map(ids.map((id) => [id, summary(id)])),
  };
  const service = createSearchService(
    {
      search: async () =>
        hybridResult('hybrid', [candidate('A'), candidate('B')]),
    },
    productsService,
    {
      reranker: {
        rerank: async (_query, _parsed, baseline) => [...baseline].reverse(),
      },
    },
  );
  const response = await service.search({ query: 'equipment', limit: 10 });
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['B', 'A'],
  );
  assert.equal(response.mode, 'hybrid');
  assert.equal(response.results[0].scores.rerank, null);
  assert.equal(SearchResponseSchema.safeParse(response).success, true);
});

test('reranker fallback preserves SearchResponse baseline order', async () => {
  const productsService = {
    getActiveTechnicalIdentityCatalog: async () => [],
    getPublicSummariesByIds: async (ids) =>
      new Map(ids.map((id) => [id, summary(id)])),
  };
  const baseline = [candidate('A'), candidate('B')];
  const service = createSearchService(
    { search: async () => hybridResult('hybrid', baseline) },
    productsService,
    { reranker: { rerank: async (_query, _parsed, ranked) => ranked } },
  );
  const response = await service.search({ query: 'equipment', limit: 10 });
  assert.deepEqual(
    response.results.map((result) => result.product_id),
    ['A', 'B'],
  );
  assert.equal(SearchResponseSchema.safeParse(response).success, true);
});

test('public HTTP boundary returns fallback 200, both-fail 503, and validation 400', async (t) => {
  const retrievalCalls = [];
  const hybridSearch = {
    search: async (query) => {
      retrievalCalls.push(query);
      if (query === 'both fail') {
        throw new HybridSearchError(
          'HYBRID_RETRIEVAL_FAILED',
          'Hybrid retrieval is temporarily unavailable',
          {
            cause: new AggregateError(
              [
                new Error('DATABASE_URL=secret'),
                new Error('vector=[0.1] service-role-key=secret'),
              ],
              'private child errors',
            ),
          },
        );
      }
      if (query === 'semantic fallback') {
        return hybridResult('semantic_fallback', [
          candidate('S', { semanticScore: 0.8 }),
        ]);
      }
      return hybridResult('keyword_fallback', [
        candidate('K', { keywordScore: 0.8 }),
      ]);
    },
  };
  const productsService = {
    getActiveTechnicalIdentityCatalog: async () => [],
    getPublicSummariesByIds: async (ids) =>
      new Map(ids.map((id) => [id, summary(id)])),
  };
  const searchService = createSearchService(hybridSearch, productsService);

  class PublicSearchTestModule {}
  Module({
    controllers: [SearchController],
    providers: [{ provide: SearchService, useValue: searchService }],
  })(PublicSearchTestModule);

  const app = await NestFactory.create(PublicSearchTestModule, {
    logger: false,
  });
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  t.after(() => app.close());
  const baseUrl = await app.getUrl();
  const post = (body) =>
    fetch(`${baseUrl}/api/v1/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

  const keywordResponse = await post({ query: 'keyword fallback', limit: 5 });
  assert.equal(keywordResponse.status, 200);
  assert.equal((await keywordResponse.json()).mode, 'keyword');

  const semanticResponse = await post({
    query: 'semantic fallback',
    limit: 5,
  });
  assert.equal(semanticResponse.status, 200);
  assert.equal((await semanticResponse.json()).mode, 'semantic');

  const failureResponse = await post({ query: 'both fail', limit: 5 });
  assert.equal(failureResponse.status, 503);
  const failureText = await failureResponse.text();
  assert.match(failureText, /Search is temporarily unavailable/);
  assert.doesNotMatch(
    failureText,
    /DATABASE_URL|service-role|vector|private child errors/,
  );

  for (const body of [
    { query: '', limit: 5 },
    { query: '   ', limit: 5 },
    { query: 'x'.repeat(501), limit: 5 },
    { query: 'equipment', limit: 0 },
    { query: 'equipment', limit: 101 },
    { query: 'equipment', limit: 1.5 },
  ]) {
    const invalidResponse = await post(body);
    assert.equal(invalidResponse.status, 400);
  }
  assert.deepEqual(retrievalCalls, [
    'keyword fallback',
    'semantic fallback',
    'both fail',
    'both fail',
  ]);
});
