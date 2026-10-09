import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
const require = createRequire(import.meta.url);
const { configuration } = require('../../apps/api/dist/config/configuration.js');
const { EmbeddingsModule } = require('../../apps/api/dist/modules/embeddings/embeddings.module.js');
const { HealthController } = require('../../apps/api/dist/modules/health/health.controller.js');

test('runtime query timeout is independent of backfill and exposed as liveness metadata', () => {
  const queryTimeout = process.env.SEARCH_EMBEDDING_TIMEOUT_MS;
  const backfillTimeout = process.env.OLLAMA_EMBEDDING_TIMEOUT_MS;
  try {
    process.env.SEARCH_EMBEDDING_TIMEOUT_MS = '25';
    process.env.OLLAMA_EMBEDDING_TIMEOUT_MS = '180000';
    assert.equal(configuration().embedding.timeoutMs, 180000);
    const factory = Reflect.getMetadata('providers', EmbeddingsModule).find(provider => provider.useFactory);
    assert.equal(factory.useFactory().config.timeoutMs, 25);
    const health = new HealthController().getHealth();
    assert.equal(health.check, 'liveness');
    assert.equal(health.embedding.query_timeout_ms, 25);
    process.env.SEARCH_EMBEDDING_TIMEOUT_MS = '0';
    assert.throws(configuration, /SEARCH_EMBEDDING_TIMEOUT_MS/);
  } finally {
    if (queryTimeout === undefined) delete process.env.SEARCH_EMBEDDING_TIMEOUT_MS;
    else process.env.SEARCH_EMBEDDING_TIMEOUT_MS = queryTimeout;
    if (backfillTimeout === undefined) delete process.env.OLLAMA_EMBEDDING_TIMEOUT_MS;
    else process.env.OLLAMA_EMBEDDING_TIMEOUT_MS = backfillTimeout;
  }
});
