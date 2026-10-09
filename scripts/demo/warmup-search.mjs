import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { configuration } = require('../../apps/api/dist/config/configuration.js');
const { OllamaEmbeddingProvider } = require('../../apps/api/dist/ai/ollama-embedding.provider.js');
const config = configuration();
const provider = new OllamaEmbeddingProvider(config.embedding);
await provider.embed('soil moisture sensor supporting SDI-12');
if (config.explanation.llmEnabled) {
  const response = await fetch(`${config.embedding.baseUrl.replace(/\/$/u, '')}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.explanation.model, stream: false, keep_alive: '30m', messages: [{ role: 'user', content: 'Return the JSON object {"ready":true}.' }], format: 'json' }),
    signal: AbortSignal.timeout(config.embedding.timeoutMs),
  });
  assert.ok(response.ok, 'Explanation model warmup failed');
  assert.ok((await response.json()).message?.content, 'Empty model response');
}
const endpoint = process.env.SEARCH_API_URL ?? 'http://127.0.0.1:3100/api/v1/search';
const response = await fetch(endpoint, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'CS655', limit: 1, explain: true }), signal: AbortSignal.timeout(45000),
});
assert.ok(response.ok, 'Real search warmup failed');
const body = await response.json();
assert.equal(body.mode, 'hybrid', 'Warmup fell back from hybrid search');
assert.equal(body.results?.[0]?.model, 'CS655');
console.log(JSON.stringify({ result: 'PASS', model: config.embedding.model, mode: body.mode, product: body.results[0].model }));
