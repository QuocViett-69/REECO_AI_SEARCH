import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EMBEDDING_DEFAULTS,
  classifyEmbedding,
  parseBackfillLimit,
  runEmbeddingBackfill,
} from './lib.mjs';

const config = EMBEDDING_DEFAULTS;
const row = (overrides = {}) => ({
  product_id: 'product-1',
  status: 'active',
  search_text: 'soil moisture sensor',
  source_content_hash: 'hash-1',
  index_version: 'fts-v1',
  embedding_present: true,
  embedding_model: config.model,
  embedding_dimensions: config.dimensions,
  embedding_version: config.version,
  embedded_at: '2026-09-16T00:00:00.000Z',
  ...overrides,
});

test('detects current embedding state', () => {
  assert.equal(classifyEmbedding(row(), config).current, true);
});

test('detects stale model, dimensions, and version', () => {
  assert.equal(
    classifyEmbedding(row({ embedding_model: 'old-model' }), config).staleModel,
    true,
  );
  assert.equal(
    classifyEmbedding(row({ embedding_dimensions: 768 }), config)
      .staleDimensions,
    true,
  );
  assert.equal(
    classifyEmbedding(row({ embedding_version: 'old-version' }), config)
      .staleVersion,
    true,
  );
});

test('detects partial metadata state', () => {
  assert.equal(
    classifyEmbedding(row({ embedded_at: null }), config).partial,
    true,
  );
});

test('counts a concurrent source change without overwriting it', async () => {
  let guardedUpdate;
  const repository = {
    findSearchableRows: async () => [
      row({
        embedding_present: false,
        embedding_model: null,
        embedding_dimensions: null,
        embedding_version: null,
        embedded_at: null,
      }),
    ],
    updateEmbeddingIfSourceCurrent: async (update) => {
      guardedUpdate = update;
      return false;
    },
  };
  const provider = { embedMany: async () => [Array(1536).fill(0)] };
  const result = await runEmbeddingBackfill({ repository, provider, config });
  assert.equal(guardedUpdate.sourceContentHash, 'hash-1');
  assert.equal(guardedUpdate.indexVersion, 'fts-v1');
  assert.equal(result.concurrent_source_changed, 1);
  assert.equal(result.embedded, 0);
});

test('a second run makes zero provider calls and zero updates', async () => {
  const rows = [
    row({
      embedding_present: false,
      embedding_model: null,
      embedding_dimensions: null,
      embedding_version: null,
      embedded_at: null,
    }),
  ];
  let providerCalls = 0;
  let updates = 0;
  const repository = {
    findSearchableRows: async () => rows,
    updateEmbeddingIfSourceCurrent: async (update) => {
      updates += 1;
      Object.assign(rows[0], {
        embedding_present: true,
        embedding_model: update.model,
        embedding_dimensions: update.dimensions,
        embedding_version: update.version,
        embedded_at: '2026-09-16T00:00:00.000Z',
      });
      return true;
    },
  };
  const provider = {
    embedMany: async () => {
      providerCalls += 1;
      return [Array(1536).fill(0)];
    },
  };

  const first = await runEmbeddingBackfill({ repository, provider, config });
  const second = await runEmbeddingBackfill({ repository, provider, config });
  assert.equal(first.embedded, 1);
  assert.equal(second.skipped_current, 1);
  assert.equal(second.attempted, 0);
  assert.equal(second.provider_calls, 0);
  assert.equal(second.database_update_calls, 0);
  assert.equal(second.database_updates, 0);
  assert.equal(providerCalls, 1);
  assert.equal(updates, 1);
});

test('--limit selects exactly one candidate without changing remaining count', async () => {
  const rows = ['product-1', 'product-2', 'product-3'].map((productId) =>
    row({
      product_id: productId,
      model: `model-${productId}`,
      embedding_present: false,
      embedding_model: null,
      embedding_dimensions: null,
      embedding_version: null,
      embedded_at: null,
    }),
  );
  const embeddedInputs = [];
  const updatedProducts = [];
  const repository = {
    findSearchableRows: async () => rows,
    updateEmbeddingIfSourceCurrent: async (update) => {
      updatedProducts.push(update.productId);
      return true;
    },
  };
  const provider = {
    embedMany: async (inputs) => {
      embeddedInputs.push(...inputs);
      return inputs.map(() => Array(1536).fill(0));
    },
  };

  const result = await runEmbeddingBackfill({
    repository,
    provider,
    config,
    limit: parseBackfillLimit(['--execute', '--limit', '1']),
  });

  assert.deepEqual(updatedProducts, ['product-1']);
  assert.deepEqual(embeddedInputs, ['soil moisture sensor']);
  assert.equal(result.attempted, 1);
  assert.equal(result.embedded, 1);
  assert.equal(result.remaining_missing_or_stale, 2);
  assert.equal(result.provider_calls, 1);
  assert.equal(result.database_update_calls, 1);
  assert.equal(result.database_updates, 1);
  assert.deepEqual(result.embedded_products, [
    { product_id: 'product-1', model: 'model-product-1' },
  ]);
});

test('--limit rejects missing, duplicate, zero, and non-integer values', () => {
  assert.throws(() => parseBackfillLimit(['--limit']), /positive integer/);
  assert.throws(
    () => parseBackfillLimit(['--limit', '1', '--limit', '2']),
    /only be provided once/,
  );
  assert.throws(() => parseBackfillLimit(['--limit', '0']), /positive integer/);
  assert.throws(
    () => parseBackfillLimit(['--limit', '1.5']),
    /positive integer/,
  );
});
