import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { embeddingConfig } from '../create-embeddings/lib.mjs';
const require = createRequire(import.meta.url);
const { SearchResponseSchema } = require('@reeco/shared');
const endpoint = process.env.SEARCH_API_URL ?? 'http://127.0.0.1:3100/api/v1/search';
const config = embeddingConfig();
const health = await fetch(endpoint.replace(/\/search\/?$/u, '/health'), { signal: AbortSignal.timeout(10000) });
assert.ok(health.ok, 'API is unreachable');
const metadata = (await health.json()).embedding;
assert.equal(metadata?.model, config.model, 'Running API model differs from deployment configuration');
assert.equal(metadata?.dimensions, config.dimensions);
assert.equal(metadata?.version, config.version);
const reports = [];
async function search(query, extra = {}) {
  const started = Date.now();
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 10, explain: false, ...extra }), signal: AbortSignal.timeout(45000),
  });
  assert.equal(response.status, 200, query);
  const body = SearchResponseSchema.parse(await response.json());
  reports.push({ query, mode: body.mode, models: body.results.map(item => item.model), latency_ms: Date.now() - started });
  return body;
}
const exact = await search('CS655', { limit: 1, explain: true });
assert.equal(exact.mode, 'hybrid', 'Keyword fallback is not sufficient for the AI-search demo');
assert.equal(exact.results[0]?.model, 'CS655');
assert.ok(exact.results[0].explanation?.evidence.length);
const sensors = await search('sensor supporting SDI-12');
assert.equal(sensors.mode, 'hybrid');
assert.ok(sensors.results.length);
assert.ok(sensors.results.every(item => item.category === 'Sensors'), 'Non-sensor returned');
const usb = await search('does this product support USB?', { explain: true, limit: 1,
  context: { base_query: 'CS655', previous_query: 'CS655', product_ids: [exact.results[0].product_id] } });
assert.equal(usb.results[0]?.model, 'CS655');
assert.equal(usb.results[0].explanation.requirements.find(item => item.label === 'USB')?.status, 'unconfirmed');
for (const condition of ['with Modbus', 'without SDI-12']) {
  const body = await search(`I want a system to monitor soil moisture and rainfall remotely ${condition}`);
  assert.equal(body.guidance?.needs_clarification, true);
  assert.equal(body.results.length, 0);
}
if (process.argv.includes('--require-llm')) assert.equal(exact.results[0].explanation.source, 'llm', 'No accepted LLM explanation');
console.log(JSON.stringify({ result: 'PASS', model: metadata.model, queries: reports }, null, 2));
