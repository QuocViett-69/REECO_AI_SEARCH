import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const { ExplanationService } = require(path.join(root, 'apps/api/dist/modules/search/explanation.service.js'));
const document = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_CS655.json'), 'utf8'));
const service = new ExplanationService();

test('water temperature explanation names the measured medium and cites catalog evidence', async () => {
  const waterSensor = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_TEMPVUE50.json'), 'utf8'));
  const soilSensor = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_TCAV.json'), 'utf8'));
  const query = 'tôi muốn mua một cảm biến đo nhiệt độ nước';
  const confirmed = service.explain(query, waterSensor);
  const unconfirmed = service.explain(query, soilSensor);
  assert.match(confirmed.text, /nhiệt độ nước/u);
  assert.equal(confirmed.evidence[0].field, 'measurements');
  assert.match(unconfirmed.text, /chưa có dữ liệu xác nhận/iu);
  assert.equal(unconfirmed.evidence.length, 0);
});

test('protocol confirmation requires supporting catalog evidence', () => {
  const base = { productId: document.product_id, identityMatch: 'none', protocolMatches: [], temperatureMatches: [] };
  const unknown = service.explain('sensor with SDI-12', document, {
    ...base,
    protocolMatches: [{ queryProtocol: 'SDI-12', result: 'UNKNOWN', evidence: [] }],
  });
  assert.match(unknown.text, /does not confirm support/u);
  assert.equal(unknown.evidence.length, 0);

  const supported = service.explain('cảm biến hỗ trợ SDI-12', document, {
    ...base,
    protocolMatches: [{ queryProtocol: 'SDI-12', result: 'MATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'SDI-12', relation: 'supported' }] }],
  });
  assert.equal(supported.language, 'vi');
  assert.equal(supported.evidence[0].value, 'SDI-12');
});

test('numeric claim cites only a confirmed structured range', () => {
  const explanation = service.explain('operates at -40°C', document, {
    productId: document.product_id,
    identityMatch: 'none',
    protocolMatches: [],
    temperatureMatches: [{
      constraint: { kind: 'point', intent: 'operating', valueCelsius: -40, unit: '°C', confidence: 'high' },
      result: 'MATCH',
      evidence: [{ source: 'normalized_spec', canonicalKey: 'operating_temperature_range', candidateRange: { minCelsius: -50, maxCelsius: 70, unit: '°C' }, result: 'MATCH', rawRef: { file: 'x', source_rows: [] } }],
    }],
  });
  assert.match(explanation.text, /-50–70°C.*-40°C/u);
  assert.deepEqual(explanation.evidence, [{ source: 'normalized_spec', field: 'operating_temperature_range', value: '-50–70°C' }]);
});

test('local LLM rewrites grounded text and falls back on invented model details', async () => {
  const priorEnabled = process.env.LLM_EXPLANATION_ENABLED;
  const priorModel = process.env.LLM_MODEL;
  const priorFetch = globalThis.fetch;
  process.env.LLM_EXPLANATION_ENABLED = 'true';
  process.env.LLM_MODEL = 'test-model';
  const llmService = new ExplanationService();
  const match = { productId: document.product_id, identityMatch: 'none', protocolMatches: [{ queryProtocol: 'SDI-12', result: 'MATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'SDI-12', relation: 'supported' }] }], temperatureMatches: [] };
  const input = [{ document, match }];
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: `${document.model} supports SDI-12 as confirmed by product data.` }] }) } }) });
    const [rewritten] = await llmService.explainMany('sensor supporting SDI-12', input);
    assert.equal(rewritten.text, `${document.model} supports SDI-12 as confirmed by product data.`);
    assert.equal(rewritten.evidence[0].value, document.model);

    globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: `The model ${document.model} supports Modbus 999.` }] }) } }) });
    const [rejected] = await llmService.explainMany('sensor supporting SDI-12', input);
    assert.equal(rejected.text, llmService.explain('sensor supporting SDI-12', document, match).text);

    globalThis.fetch = async () => { throw new Error('offline'); };
    const [fallback] = await llmService.explainMany('sensor supporting SDI-12', input);
    assert.equal(fallback.text, llmService.explain('sensor supporting SDI-12', document, match).text);
  } finally {
    globalThis.fetch = priorFetch;
    if (priorEnabled === undefined) delete process.env.LLM_EXPLANATION_ENABLED;
    else process.env.LLM_EXPLANATION_ENABLED = priorEnabled;
    if (priorModel === undefined) delete process.env.LLM_MODEL;
    else process.env.LLM_MODEL = priorModel;
  }
});
