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
