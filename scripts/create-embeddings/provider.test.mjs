import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const require = createRequire(import.meta.url);
const { EmbeddingProviderError, OllamaEmbeddingProvider } = require(
  path.join(
    projectRoot,
    'apps',
    'api',
    'dist',
    'ai',
    'ollama-embedding.provider.js',
  ),
);

const baseConfig = Object.freeze({
  provider: 'ollama',
  baseUrl: 'http://127.0.0.1:11434',
  model: 'qwen3-embedding:4b',
  dimensions: 1536,
  version: 'ollama-qwen3-embedding-4b-1536-v1',
  timeoutMs: 100,
});
const vector = (value = 0.25) => Array.from({ length: 1536 }, () => value);
const response = (body, status = 200) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const assertCode = async (operation, code) => {
  await assert.rejects(operation, (error) => {
    assert.ok(error instanceof EmbeddingProviderError);
    assert.equal(error.code, code);
    return true;
  });
};

test('accepts a valid 1536-dimension vector', async () => {
  let requestInput;
  const provider = new OllamaEmbeddingProvider(
    baseConfig,
    async (_url, init) => {
      requestInput = JSON.parse(String(init.body)).input;
      return response({ embeddings: [vector()] });
    },
  );
  assert.equal((await provider.embed('valid input')).length, 1536);
  assert.equal(requestInput, 'valid input');
});

test('rejects a vector with the wrong dimensions', async () => {
  const provider = new OllamaEmbeddingProvider(baseConfig, async () =>
    response({ embeddings: [[1, 2]] }),
  );
  await assertCode(
    () => provider.embed('valid input'),
    'EMBEDDING_DIMENSION_MISMATCH',
  );
});

for (const [label, value] of [
  ['NaN', Number.NaN],
  ['Infinity', Number.POSITIVE_INFINITY],
]) {
  test(`rejects ${label} values`, async () => {
    const invalid = vector();
    invalid[10] = value;
    const provider = new OllamaEmbeddingProvider(baseConfig, async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ embeddings: [invalid] }),
    }));
    await assertCode(
      () => provider.embed('valid input'),
      'OLLAMA_INVALID_RESPONSE',
    );
  });
}

test('rejects empty and whitespace-only input', async () => {
  const provider = new OllamaEmbeddingProvider(baseConfig, async () =>
    response({ embeddings: [vector()] }),
  );
  await assertCode(() => provider.embed('  '), 'EMPTY_EMBEDDING_INPUT');
  await assertCode(() => provider.embedMany([]), 'EMPTY_EMBEDDING_INPUT');
});

test('rejects null, undefined, and non-string input at runtime', async () => {
  const provider = new OllamaEmbeddingProvider(baseConfig, async () =>
    response({ embeddings: [vector()] }),
  );
  await assertCode(() => provider.embed(undefined), 'EMPTY_EMBEDDING_INPUT');
  await assertCode(() => provider.embed(null), 'EMPTY_EMBEDDING_INPUT');
  await assertCode(
    () => provider.embedMany(['valid', 42]),
    'EMPTY_EMBEDDING_INPUT',
  );
});

test('preserves batch input and result ordering', async () => {
  let requestInput;
  const provider = new OllamaEmbeddingProvider(
    baseConfig,
    async (_url, init) => {
      requestInput = JSON.parse(String(init.body)).input;
      return response({ embeddings: [vector(1), vector(2)] });
    },
  );
  const result = await provider.embedMany(['first', 'second']);
  assert.deepEqual(requestInput, ['first', 'second']);
  assert.equal(result[0][0], 1);
  assert.equal(result[1][0], 2);
});

test('rejects the wrong number of vectors', async () => {
  const provider = new OllamaEmbeddingProvider(baseConfig, async () =>
    response({ embeddings: [vector()] }),
  );
  await assertCode(
    () => provider.embedMany(['first', 'second']),
    'OLLAMA_INVALID_RESPONSE',
  );
});

test('maps an unreachable Ollama host', async () => {
  const provider = new OllamaEmbeddingProvider(baseConfig, async () => {
    throw new TypeError('connect failed');
  });
  await assertCode(() => provider.embed('input'), 'OLLAMA_NOT_REACHABLE');
});

test('maps model-not-found without exposing the provider response', async () => {
  const provider = new OllamaEmbeddingProvider(baseConfig, async () =>
    response({ error: 'model secret-internal-detail not found' }, 404),
  );
  await assertCode(() => provider.embed('input'), 'OLLAMA_MODEL_NOT_FOUND');
});

test('rejects invalid JSON', async () => {
  const provider = new OllamaEmbeddingProvider(baseConfig, async () =>
    response('{broken-json'),
  );
  await assertCode(() => provider.embed('input'), 'OLLAMA_INVALID_RESPONSE');
});

test('aborts after the configured timeout', async () => {
  const provider = new OllamaEmbeddingProvider(
    { ...baseConfig, timeoutMs: 5 },
    async (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        });
      }),
  );
  await assertCode(() => provider.embed('input'), 'OLLAMA_TIMEOUT');
});

test('rejects a configuration whose dimensions are not 1536', () => {
  assert.throws(
    () => new OllamaEmbeddingProvider({ ...baseConfig, dimensions: 768 }),
    (error) => {
      assert.equal(error.code, 'EMBEDDING_CONFIG_INVALID');
      return true;
    },
  );
});
