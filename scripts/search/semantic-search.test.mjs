import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const { SemanticSearchError, SemanticSearchService } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'modules',
    'search',
    'semantic-search.service.js',
  ),
);
const metadata = Object.freeze({
  provider: 'ollama',
  model: 'qwen3-embedding:4b',
  dimensions: 1536,
  version: 'ollama-qwen3-embedding-4b-1536-v1',
  timeout_ms: 180000,
  batch_size: 8,
});
const vector = Object.freeze(Array(1536).fill(0.001));
const validRows = [
  {
    product_id: 'CSI_SOILVUE10_5',
    model: 'SoilVue10-5',
    product_name_en: 'Soil moisture profile sensor',
    similarity: 0.9,
  },
  {
    product_id: 'CSI_CS655',
    model: 'CS655',
    product_name_en: 'Water content reflectometer',
    similarity: 0.8,
  },
];

function harness({
  rows = validRows,
  rpcError = null,
  embedError,
  metadataValue = metadata,
} = {}) {
  const calls = { embedded: [], rpc: [] };
  const embeddings = {
    getConfigurationMetadata: () => metadataValue,
    embedQuery: async (query) => {
      calls.embedded.push(query);
      if (embedError) throw embedError;
      return vector;
    },
  };
  const supabase = {
    getClient: () => ({
      rpc: async (name, args) => {
        calls.rpc.push({ name, args });
        return { data: rows, error: rpcError };
      },
    }),
  };
  return {
    service: new SemanticSearchService(embeddings, supabase),
    calls,
  };
}

async function expectCode(promise, code) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof SemanticSearchError);
    assert.equal(error.code, code);
    return true;
  });
}

test('returns normalized candidates, preserves order, and assigns ranks', async () => {
  const { service, calls } = harness();
  const results = await service.search('soil moisture sensor', 10);

  assert.deepEqual(results, [
    {
      productId: 'CSI_SOILVUE10_5',
      model: 'SoilVue10-5',
      productNameEn: 'Soil moisture profile sensor',
      similarity: 0.9,
      rank: 1,
    },
    {
      productId: 'CSI_CS655',
      model: 'CS655',
      productNameEn: 'Water content reflectometer',
      similarity: 0.8,
      rank: 2,
    },
  ]);
  assert.equal(calls.embedded.length, 1);
  assert.equal(calls.rpc.length, 1);
  assert.equal(calls.rpc[0].name, 'search_products_semantic');
  assert.equal(calls.rpc[0].args.query_embedding, vector);
  assert.equal(calls.rpc[0].args.required_embedding_model, metadata.model);
  assert.equal(calls.rpc[0].args.required_embedding_version, metadata.version);
  assert.equal(calls.rpc[0].args.result_limit, 10);
});

test('trims the query before embedding', async () => {
  const { service, calls } = harness();
  await service.search('  cảm biến độ ẩm đất  ', 5);
  assert.deepEqual(calls.embedded, ['cảm biến độ ẩm đất']);
});

for (const invalidQuery of [null, undefined, '', '   ']) {
  test(`rejects invalid query ${String(invalidQuery)}`, async () => {
    const { service, calls } = harness();
    await expectCode(
      service.search(invalidQuery, 10),
      'SEMANTIC_QUERY_INVALID',
    );
    assert.equal(calls.embedded.length, 0);
    assert.equal(calls.rpc.length, 0);
  });
}

test('uses configured default and clamps requested limits to 1..100', async () => {
  const { service, calls } = harness();
  await service.search('default');
  await service.search('lower', 0);
  await service.search('upper', 101);
  assert.deepEqual(
    calls.rpc.map((call) => call.args.result_limit),
    [20, 1, 100],
  );
});

test('rejects non-integer limits as invalid configuration', async () => {
  const { service } = harness();
  await expectCode(service.search('query', 1.5), 'SEMANTIC_CONFIG_INVALID');
});

test('rejects duplicate product IDs', async () => {
  const { service } = harness({ rows: [validRows[0], validRows[0]] });
  await expectCode(
    service.search('query', 10),
    'SEMANTIC_RPC_INVALID_RESPONSE',
  );
});

for (const similarity of [Number.NaN, -0.1, 1.1]) {
  test(`rejects invalid similarity ${String(similarity)}`, async () => {
    const { service } = harness({
      rows: [{ ...validRows[0], similarity }],
    });
    await expectCode(
      service.search('query', 10),
      'SEMANTIC_RPC_INVALID_RESPONSE',
    );
  });
}

for (const malformed of [
  { ...validRows[0], product_id: '' },
  { ...validRows[0], model: '' },
  { ...validRows[0], product_name_en: '' },
  { ...validRows[0], similarity: '0.9' },
]) {
  test('rejects a malformed RPC row', async () => {
    const { service } = harness({ rows: [malformed] });
    await expectCode(
      service.search('query', 10),
      'SEMANTIC_RPC_INVALID_RESPONSE',
    );
  });
}

test('sanitizes embedding failures without leaking vectors or provider details', async () => {
  const secret = 'SECRET-VECTOR-[0.001,0.002]';
  const cause = new Error(secret);
  const { service } = harness({ embedError: cause });
  await assert.rejects(service.search('query', 10), (error) => {
    assert.equal(error.code, 'SEMANTIC_EMBEDDING_UNAVAILABLE');
    assert.equal(error.cause, cause);
    assert.doesNotMatch(error.message, /SECRET|0\.001/);
    return true;
  });
});

test('sanitizes Supabase RPC failures', async () => {
  const secret = 'service-key-and-vector-should-not-leak';
  const cause = { code: 'PGRST500', message: secret };
  const { service } = harness({ rpcError: cause });
  await assert.rejects(service.search('query', 10), (error) => {
    assert.equal(error.code, 'SEMANTIC_RPC_FAILED');
    assert.equal(error.cause, cause);
    assert.doesNotMatch(error.message, /service-key|vector/);
    return true;
  });
});

test('rejects an incompatible embedding dimension before embedding', async () => {
  const { service, calls } = harness({
    metadataValue: { ...metadata, dimensions: 768 },
  });
  await expectCode(service.search('query', 10), 'SEMANTIC_CONFIG_INVALID');
  assert.equal(calls.embedded.length, 0);
});
