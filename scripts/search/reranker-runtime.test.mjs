import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  serializeCandidate as serializeOffline,
} from '../search-evaluation/reranker/bge-provider.mjs';
import {
  compactCandidate,
} from '../search-evaluation/reranker/candidate-input.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..', '..');
const { configuration } = require(
  path.join(root, 'apps/api/dist/config/configuration.js'),
);
const {
  RerankerService,
  serializeRerankerCandidate,
} = require(
  path.join(root, 'apps/api/dist/modules/search/reranker.service.js'),
);

const revision = '953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e';
const parsed = {
  parserVersion: 'technical-query-v1',
  originalQuery: 'SDI-12 at -40°C',
  identity: null,
  protocols: ['SDI-12'],
  temperatureConstraints: [
    {
      kind: 'point',
      intent: 'operating',
      valueCelsius: -40,
      unit: '°C',
      confidence: 'high',
    },
  ],
  confidence: { identity: 'none', protocol: 'high', temperature: 'high' },
};

const ranked = (id, exactIdentity = false) => ({
  candidate: { productId: id },
  originalHybridRank: 1,
  technical: {
    exactIdentity,
    satisfiedConstraintCount: 0,
    confirmedProtocolMatchCount: 0,
    temperatureState: null,
    hardMismatch: false,
  },
  matchedFeatures: [],
});

const response = (ids) => ({
  ok: true,
  json: async () => ({
    results: ids.map((product_id, index) => ({ product_id, score: -index })),
    model: 'BAAI/bge-reranker-v2-m3',
    revision,
    latency_ms: 10,
  }),
});

function service(documents, enabled = true) {
  process.env.RERANKER_ENABLED = String(enabled);
  process.env.RERANKER_TOP_N = '5';
  const evidence = new Map(
    documents.map((document) => [
      document.product_id,
      { product: {}, document, specifications: [] },
    ]),
  );
  return new RerankerService({
    getSearchDocumentsByIds: async (ids) =>
      new Map(
        ids.flatMap((id) =>
          evidence.has(id) ? [[id, evidence.get(id).document]] : [],
        ),
      ),
  });
}

test('runtime serialization is byte-identical to compact-bilingual-evidence-v1', async () => {
  const document = JSON.parse(
    await readFile(
      path.join(root, 'data/search-documents/CSI_CS655.json'),
      'utf8',
    ),
  );
  const compact = compactCandidate(document, parsed);
  assert.equal(
    serializeRerankerCandidate(document, parsed, compact.matched_features),
    serializeOffline(compact),
  );
});

test('protocol evidence semantics remain identical for the protected protocol set', async () => {
  const base = JSON.parse(
    await readFile(path.join(root, 'data/search-documents/CSI_CS655.json'), 'utf8'),
  );
  for (const protocol of ['SDI-12', 'RS-485', 'Modbus', 'Modbus RTU']) {
    const document = { ...base, supported_protocols: [protocol] };
    const protocolQuery = {
      ...parsed,
      protocols: [protocol],
      temperatureConstraints: [],
    };
    const compact = compactCandidate(document, protocolQuery);
    const runtime = serializeRerankerCandidate(
      document,
      protocolQuery,
      compact.matched_features,
    );
    assert.equal(runtime, serializeOffline(compact));
    assert.match(runtime, new RegExp(`Matched structured features: protocol:${protocol}`));
  }
});

test('disabled feature preserves exact object order without loading evidence', async () => {
  process.env.RERANKER_ENABLED = 'false';
  let evidenceCalls = 0;
  const reranker = new RerankerService({
    getSearchDocumentsByIds: async () => {
      evidenceCalls += 1;
      return new Map();
    },
  });
  const baseline = [ranked('A'), ranked('B')];
  assert.strictEqual(await reranker.rerank('sensor', parsed, baseline), baseline);
  assert.equal(evidenceCalls, 0);
});

test('reorders only top five, keeps exact identity first, and preserves tail', async () => {
  const documents = await Promise.all(
    ['CSI_CS655', 'CSI_CS650', 'CSI_CS616', 'CSI_CS610', 'CSI_43347'].map(
      async (id) =>
        JSON.parse(
          await readFile(path.join(root, `data/search-documents/${id}.json`), 'utf8'),
        ),
    ),
  );
  const baseline = [
    ranked(documents[0].product_id, true),
    ...documents.slice(1).map((item) => ranked(item.product_id)),
    ranked('TAIL_6'),
    ranked('TAIL_7'),
  ];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    response([
      documents[4].product_id,
      documents[3].product_id,
      documents[2].product_id,
      documents[1].product_id,
      documents[0].product_id,
    ]);
  try {
    const result = await service(documents).rerank('CS655', parsed, baseline);
    assert.deepEqual(
      result.map((item) => item.candidate.productId),
      [
        documents[0].product_id,
        documents[4].product_id,
        documents[3].product_id,
        documents[2].product_id,
        documents[1].product_id,
        'TAIL_6',
        'TAIL_7',
      ],
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('unknown, duplicate, missing, timeout, and unavailable responses fallback', async (t) => {
  const document = JSON.parse(
    await readFile(path.join(root, 'data/search-documents/CSI_CS655.json'), 'utf8'),
  );
  const second = { ...document, product_id: 'B', model: 'B' };
  const baseline = [ranked(document.product_id), ranked('B')];
  const cases = {
    unknown: async () => response([document.product_id, 'UNKNOWN']),
    duplicate: async () => response([document.product_id, document.product_id]),
    missing: async () => response([document.product_id]),
    timeout: async (_url, options) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener('abort', () => reject(options.signal.reason)),
      ),
    unavailable: async () => {
      throw new TypeError('fetch failed');
    },
    busy: async () => ({ ok: false, status: 503 }),
  };
  for (const [name, mockFetch] of Object.entries(cases)) {
    await t.test(name, async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = mockFetch;
      try {
        const result = await service([document, second]).rerank(
          'sensor',
          parsed,
          baseline,
        );
        assert.strictEqual(result, baseline);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  }
});

test('hard mismatch or inactive ID cannot be injected', async () => {
  const document = JSON.parse(
    await readFile(path.join(root, 'data/search-documents/CSI_CS655.json'), 'utf8'),
  );
  const baseline = [ranked(document.product_id), ranked('B')];
  const second = { ...document, product_id: 'B', model: 'B' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => response([document.product_id, 'HARD_MISMATCH']);
  try {
    assert.strictEqual(
      await service([document, second]).rerank('sensor', parsed, baseline),
      baseline,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('production topN above five is rejected', () => {
  const previous = process.env.RERANKER_TOP_N;
  process.env.RERANKER_TOP_N = '6';
  try {
    assert.throws(() => configuration(), /RERANKER_TOP_N/);
  } finally {
    if (previous === undefined) delete process.env.RERANKER_TOP_N;
    else process.env.RERANKER_TOP_N = previous;
  }
});
