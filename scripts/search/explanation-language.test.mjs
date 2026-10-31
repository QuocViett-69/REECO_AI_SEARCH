import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { ExplanationService } = require('../../apps/api/dist/modules/search/explanation.service.js');
const { searchLanguage, numericSpecificationText } = require('../../apps/api/dist/modules/search/search-language.js');
const service = new ExplanationService();
const products = [];
for (const file of await readdir(new URL('../../data/search-documents/', import.meta.url))) {
  if (!file.endsWith('.json')) continue;
  const document = JSON.parse(await readFile(new URL(`../../data/search-documents/${file}`, import.meta.url), 'utf8'));
  const normalized = JSON.parse(await readFile(new URL(`../../data/normalized/specifications/${file}`, import.meta.url), 'utf8'));
  const specs = normalized.specifications.map(s => ({ canonical_key: s.canonical_key, normalized_value: { ...(s.normalized ?? { type: 'text', value: s.value_raw }), value_raw: s.value_raw }, raw_ref: s.raw_ref }));
  products.push({ document, specs });
}
const englishProse = /(?<![\p{L}\p{N}])(?:the|with|from|operating|accuracy|resolution|temperature|range|supports|heated|of|and|profile|cellular|logger|measurement|to)(?![\p{L}\p{N}])/iu;
const vietnamese = /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu;

test('response language recognizes short Vietnamese and unaccented requests, with context only for ambiguous identifiers', () => {
  for (const query of ['có Wi-Fi?', 'và USB?', 'cam bien do am dat', 'giai thich CS655']) assert.equal(searchLanguage(query), 'vi');
  for (const query of ['Does CS655 support Wi-Fi?', 'Explain this product', 'operating temperature -35 to 70°C', 'Ingress protection IP68', 'Current consumption 14 mA', 'Weight 770 g', 'SDI-12 sensors', 'and IP68', 'no Wi-Fi']) assert.equal(searchLanguage(query, 'vi'), 'en');
  assert.equal(searchLanguage('CS655', 'vi'), 'vi');
  assert.equal(searchLanguage('SDI-12', 'en'), 'en');
});

test('all transport requirement labels are nonempty strings in both reply languages', () => {
  const schema = require('@reeco/shared').SearchResultSchema.shape.explanation;
  for (const [model, query] of [['TX325', 'satellite communication'], ['RF407', 'radio communication'], ['CELL210-V', 'cellular communication']]) {
    const { document, specs } = products.find(p => p.document.model === model);
    for (const language of ['vi', 'en']) {
      const explanation = service.explain(query, document, undefined, specs, language);
      assert.ok(explanation.requirements.length);
      assert.ok(explanation.requirements.every(requirement => typeof requirement.label === 'string' && requirement.label.trim()));
      schema.parse(explanation);
    }
  }
});

test('numeric rendering preserves source conditions by keeping untranslated conditional prose in evidence', () => {
  const spec = { normalized_value: { type: 'range', min_value: -20, max_value: 50, unit: '°C', qualifier: null, value_raw: '-20 to 50°C, heated' } };
  assert.equal(numericSpecificationText(spec, 'vi'), undefined);
  assert.equal(numericSpecificationText({ normalized_value: { ...spec.normalized_value, value_raw: '-20 to 50°C' } }, 'vi'), '-20 đến 50 °C');
});

test('every catalog model has a single-language overview and requirement labels', () => {
  for (const { document, specs } of products) for (const language of ['vi', 'en']) {
    const explanation = service.explain(language === 'vi' ? `Cho tôi thông tin về ${document.model}` : `Show information about ${document.model}`, document, undefined, specs);
    assert.equal(explanation.language, language);
    const text = [explanation.text, ...explanation.requirements.map(r => r.label)].join(' ');
    assert.doesNotMatch(text, language === 'vi' ? englishProse : vietnamese, `${language}: ${document.model}: ${text}`);
    assert.ok(explanation.evidence.length);
  }
});

test('component retrieval language and historical query language do not override the current reply language', async () => {
  const { document, specs } = products.find(p => p.document.model === 'CS655');
  const [vi] = await service.explainMany('Tôi cần theo dõi độ ẩm đất', [{ document, specifications: specs, query: 'soil moisture sensor' }]);
  assert.equal(vi.language, 'vi');
  assert.doesNotMatch(vi.text, englishProse);
  const en = service.explain('Tôi cần cảm biến độ ẩm đất. Explain this product', document, undefined, specs, 'en');
  assert.equal(en.language, 'en');
  assert.doesNotMatch(en.text, vietnamese);
});

test('technical English inside a Vietnamese request is localized in prose and requirement labels', () => {
  const { document, specs } = products.find(p => p.document.model === 'VWANALYZER');
  for (const [query, language] of [['Tôi cần memory at least 64 MB', 'vi'], ['Memory at least 64 MB', 'en']]) {
    const explanation = service.explain(query, document, undefined, specs);
    assert.equal(explanation.language, language);
    assert.doesNotMatch([explanation.text, ...explanation.requirements.map(r => r.label)].join(' '), language === 'vi' ? /\bmemory\b|at least|\bto\b/iu : vietnamese);
  }
});

test('use-case explanations stay in the request language, including quoted specification values', () => {
  for (const [model, vi, en] of [
    ['SoilVue10-5', 'cảm biến độ ẩm đất nhiều tầng', 'multi depth soil moisture sensor'],
    ['52202', 'đo mưa khi có tuyết rơi', 'heated rain gauge for snow'],
    ['CS301', 'đo quang năng bức xạ cho điện mặt trời phát điện', 'solar radiation for photovoltaic power'],
    ['TX325', 'thiết bị truyền thông qua vệ tinh', 'satellite communication equipment'],
    ['ClimaVue40', 'cảm biến thời tiết Modbus RTU RS-485 cho PLC', 'weather sensor with Modbus RTU RS-485 for a PLC'],
  ]) for (const [query, language] of [[vi, 'vi'], [en, 'en']]) {
    const { document, specs } = products.find(p => p.document.model === model);
    const explanation = service.explain(query, document, undefined, specs);
    assert.equal(explanation.language, language);
    assert.doesNotMatch(explanation.text, language === 'vi' ? englishProse : vietnamese, explanation.text);
  }
});

test('LLM wording in the wrong language is rejected and the localized fallback is retained', async () => {
  const old = { enabled: process.env.LLM_EXPLANATION_ENABLED, model: process.env.LLM_MODEL, fetch: globalThis.fetch };
  process.env.LLM_EXPLANATION_ENABLED = 'true';
  process.env.LLM_MODEL = 'language-test';
  const { document, specs } = products.find(p => p.document.model === 'CS655');
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: 'CS655 measures soil moisture.' }] }) } }) });
    const [fallback] = await new ExplanationService().explainMany('Cảm biến độ ẩm đất', [{ document, specifications: specs }]);
    assert.equal(fallback.language, 'vi');
    assert.equal(fallback.source, 'rule');
    assert.doesNotMatch(fallback.text, englishProse);
    const original = new ExplanationService().explain('soil moisture sensor', document, undefined, specs);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: original.text }] }) } }) });
    const [accepted] = await new ExplanationService().explainMany('soil moisture sensor', [{ document, specifications: specs }]);
    assert.equal(accepted.source, 'llm');
    assert.equal(accepted.language, 'en');
    assert.doesNotMatch(accepted.text, vietnamese);
  } finally {
    globalThis.fetch = old.fetch;
    if (old.enabled === undefined) delete process.env.LLM_EXPLANATION_ENABLED; else process.env.LLM_EXPLANATION_ENABLED = old.enabled;
    if (old.model === undefined) delete process.env.LLM_MODEL; else process.env.LLM_MODEL = old.model;
  }
});
