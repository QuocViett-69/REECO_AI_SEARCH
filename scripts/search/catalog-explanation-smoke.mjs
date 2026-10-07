import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { SearchResponseSchema } = require('@reeco/shared');
const responses = [];
const endpoint = process.env.SEARCH_API_URL ?? 'http://127.0.0.1:3100/api/v1/search';
async function search(request) {
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...request, limit: 10, explain: true }), signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  const body = SearchResponseSchema.parse(await response.json());
  assert.ok(body.results.length);
  for (const result of body.results) assert.ok(result.explanation?.requirements);
  responses.push({ request, body });
  console.log(JSON.stringify({ query: request.query, models: body.results.map(item => item.model), llm: body.results.filter(item => item.explanation?.generation?.status === 'accepted').map(item => item.model) }));
  return body;
}
for (const [query, model, measurement] of [
  ['Tôi cần đo độ ướt lá', 'LWS', 'Độ ướt lá'],
  ['I need to measure leaf wetness', 'LWS', 'Leaf Wetness'],
  ['Tôi cần đo mật độ thông lượng photon quang hợp', 'CS310', 'Mật độ thông lượng photon quang hợp'],
  ['Tôi cần đo thông lượng nhiệt đất', 'HFP01', 'Thông lượng nhiệt đất'],
  ['Tôi cần đo mực nước', 'CS451', 'Mực nước'],
]) {
  const body = await search({ query });
  const product = body.results.find(item => item.model === model);
  assert.ok(product, `${model}: missing result`);
  assert.ok(product.explanation.evidence.some(item => item.field === 'measurements' && item.value.toLowerCase().includes(measurement.toLowerCase())));
  assert.ok(product.explanation.requirements.some(item => item.status === 'confirmed'));
}
const weather = await search({ query: 'Cảm biến khí tượng' });
assert.ok(weather.results.every(item => item.model !== 'LWS'));
const base = 'Tôi cần cảm biến thời tiết hỗ trợ Modbus';
const comparison = await search({ query: 'Vì sao các model này phù hợp?', context: { base_query: base, previous_query: base, product_ids: ['CSI_CLIMAVUE40', 'CSI_CLIMAVUE50G2'] } });
assert.equal(comparison.results.find(item => item.model === 'ClimaVue40').explanation.requirements.find(item => item.label === 'Modbus').status, 'confirmed');
assert.equal(comparison.results.find(item => item.model === 'ClimaVue50G2').explanation.requirements.find(item => item.label === 'Modbus').status, 'unconfirmed');
if (process.argv.includes('--require-llm')) assert.ok(responses.some(response => response.body.results.some(item => item.explanation.source === 'llm')), 'No accepted local LLM explanation');
await mkdir(new URL('../../output/catalog-explanation/', import.meta.url), { recursive: true });
await writeFile(new URL('../../output/catalog-explanation/live-smoke.json', import.meta.url), `${JSON.stringify(responses, null, 2)}\n`);
console.log(JSON.stringify({ verified_queries: responses.length }));
