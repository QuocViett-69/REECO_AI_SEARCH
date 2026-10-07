import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const fromDist = name => require(`../../apps/api/dist/modules/search/${name}.js`);
const { SearchService } = fromDist('search.service');
const { TechnicalQueryParserService } = fromDist('technical-query-parser.service');
const { TechnicalMatchService } = fromDist('technical-match.service');
const { TechnicalRankingService } = fromDist('technical-ranking.service');
const { ExplanationService } = fromDist('explanation.service');
const { ServiceUnavailableException } = require('@nestjs/common');
const root = new URL('../../', import.meta.url);
const documents = new Map();
const specifications = new Map();
for (const file of await readdir(new URL('data/search-documents/', root))) {
  if (!file.endsWith('.json')) continue;
  const document = JSON.parse(await readFile(new URL(`data/search-documents/${file}`, root), 'utf8'));
  documents.set(document.product_id, document);
  const normalized = JSON.parse(await readFile(new URL(`data/normalized/specifications/${file}`, root), 'utf8'));
  specifications.set(document.product_id, normalized.specifications.map((s, i) => ({
    specification_id: i + 1, canonical_key: s.canonical_key, quantity_kind: s.quantity_kind ?? null,
    normalized_value: { ...(s.normalized ?? { type: 'text', value: s.value_raw }), value_raw: s.value_raw }, raw_ref: s.raw_ref,
  })));
}
const products = {
  getActiveTechnicalIdentityCatalog: async () => [...documents.values()].map(d => ({ productId: d.product_id, model: d.model })),
  getSearchDocumentsByIds: async ids => new Map(ids.map(id => [id, documents.get(id)])),
  getEnvironmentalSpecificationsByIds: async ids => new Map(ids.map(id => [id, specifications.get(id)])),
  getTechnicalEvidenceByIds: async ids => new Map(ids.map(id => [id, { product: documents.get(id), document: documents.get(id), specifications: specifications.get(id) }])),
  getPublicSummariesByIds: async ids => new Map(ids.map(id => { const d = documents.get(id); return [id, {
    product_id: id, model: d.model, name_en: d.name_en, name_vi: d.name_vi,
    category: d.taxonomy.category, device_type: d.taxonomy.device_type, image_url: null,
  }]; })),
};
const candidates = [...documents.values()].map((d, i) => ({ productId: d.product_id, model: d.model, productNameEn: d.name_en, keywordScore: 0.5, semanticScore: 0.5, rrfScore: 1 / (i + 1) }));
const makeService = search => new SearchService({ search }, products, new TechnicalQueryParserService(), new TechnicalMatchService(products), new TechnicalRankingService(), { rerank: async (_q, _p, rows) => rows }, new ExplanationService());
const service = makeService(async () => ({ mode: 'hybrid', candidates }));
const soil = ['HS2-12', 'SoilVue10-5', 'CS616', 'CS650', 'CS655'];
const soilMulti = ['CS650', 'CS655', 'SoilVue10-5'];

test('explaining these models retains the selected scope and reports missing protocol evidence', async () => {
  for (const query of ['Vì sao các model này phù hợp?', 'Why are these models suitable?']) {
    const base = 'Tôi cần cảm biến thời tiết hỗ trợ Modbus';
    const response = await service.search({ query, limit: 10, explain: true, context: {
      base_query: base, previous_query: base, product_ids: ['CSI_CLIMAVUE40', 'CSI_CLIMAVUE50G2'],
    } });
    assert.deepEqual(response.results.map(item => item.model), ['ClimaVue40', 'ClimaVue50G2']);
    assert.equal(response.results[0].explanation.requirements.find(item => item.label === 'Modbus').status, 'confirmed');
    assert.equal(response.results[1].explanation.requirements.find(item => item.label === 'Modbus').status, 'unconfirmed');
    assert.equal(response.context_applied, true);
  }
});

test('weather aliases filter unrelated leaf sensors and retain measurement evidence', async () => {
  for (const query of ['Cảm biến thời tiết', 'Cảm biến khí tượng', 'Khí tượng thủy văn', 'meteorological sensor']) {
    const response = await service.search({ query, limit: 30, explain: true });
    assert.ok(response.results.some(p => p.model === 'ClimaVue40'), query);
    assert.ok(response.results.every(p => p.model !== 'LWS'), query);
    const weather = response.results.find(p => p.model === 'ClimaVue40');
    assert.ok(weather.explanation.evidence.some(item => item.field === 'measurements'));
  }
});
test('bilingual use cases, system components, contextual absence and scoped explanations', async () => {
  for (const query of [
    'Nước hồ ngày càng đục, tôi nên dùng cảm biến nào?',
    'My pond water is becoming turbid. Which sensor should I use?',
  ]) {
    const response = await service.search({ query, limit: 10, explain: true });
    assert.deepEqual(response.results.map(p => p.model), ['ClariVue10']);
  }
  for (const query of [
    'Tôi muốn hệ thống theo dõi độ ẩm đất, lượng mưa và nhiệt độ từ xa',
    'I want a system to monitor soil moisture and rainfall remotely',
  ]) {
    const response = await service.search({ query, limit: 10, explain: true });
    assert.ok(response.results.some(p => /Data Logger/u.test(p.device_type)));
    assert.ok(response.results.some(p => /Rain|Precipitation/u.test(p.device_type)));
    assert.ok(response.guidance.components.some(c => c.query === 'communication equipment'));
    assert.ok(response.guidance.components.every(c => c.models.every(model => response.results.some(p => p.model === model))));
  }
  const logger = await service.search({ query: 'I have soil-moisture and rainfall sensors. Which datalogger can connect them?', limit: 10, explain: true });
  assert.ok(logger.results.length);
  assert.ok(logger.results.every(p => /Data Logger/u.test(p.device_type)));
  assert.ok(logger.results.some(p => p.explanation.evidence.some(e => e.source === 'normalized_spec')));
  const unattended = await service.search({ query: 'I need rainfall monitoring without personnel on site', limit: 5 });
  assert.ok(unattended.results.length);
  const unclear = await service.search({ query: 'Why is this product suitable for my application?', limit: 5, explain: true });
  assert.equal(unclear.guidance.needs_clarification, true);
  assert.deepEqual(unclear.results, []);
  const scoped = await service.search({ query: 'Which requirements does this product satisfy?', limit: 5, explain: true,
    context: { base_query: 'soil moisture with SDI-12', previous_query: 'soil moisture with SDI-12', product_ids: ['CSI_CS655', 'CSI_TCAV'] } });
  assert.equal(scoped.context_applied, true);
  assert.deepEqual(scoped.results.map(p => p.model), ['CS655', 'TCAV']);
  assert.match(scoped.results[1].explanation.text, /does not confirm|unconfirmed/u);
  const comparison = await service.search({ query: 'Why is a soil-moisture sensor more appropriate than a weather sensor when deciding when to irrigate?', limit: 10, explain: true });
  assert.ok(comparison.results.length);
  assert.ok(comparison.results.every(p => /Soil/u.test(p.device_type)));
  const networks = await service.search({ query: 'Should I use Ethernet, Wi-Fi or cellular for my monitoring station?', limit: 10, explain: true });
  assert.match(networks.guidance.text, /alternatives/u);
  assert.ok(networks.guidance.components.find(c => c.label === 'Ethernet').models.every(model => [...documents.values()].find(d => d.model === model).supported_protocols.includes('Ethernet')));
  const zones = await service.search({ query: 'What system can compare soil moisture across different soil zones?', limit: 10, explain: true });
  assert.ok(zones.guidance.components.some(c => c.query === 'data logger'));
  const selectedLogger = await service.search({ query: 'Why is this product suitable for my application?', limit: 5, explain: true,
    context: { base_query: 'I want a system to monitor soil moisture and rainfall remotely', previous_query: 'I want a system to monitor soil moisture and rainfall remotely', product_ids: ['CSI_CR310_NA'] } });
  assert.equal(selectedLogger.results.length, 1);
  assert.match(selectedLogger.results[0].explanation.text, /is a data logger/u);
  assert.ok(selectedLogger.results[0].explanation.evidence.some(item => item.field === 'taxonomy.device_type'));
  for (const query of ['Tôi muốn biết sau mỗi trận mưa, độ ẩm đất thay đổi như thế nào', 'I want to remotely monitor the overall environmental conditions of a farm']) {
    const result = await service.search({ query, limit: 10, explain: true });
    assert.ok(result.guidance.components.some(item => item.query === 'data logger'));
  }
  const ambiguous = await service.search({ query: 'I want a system to monitor soil moisture, rainfall and temperature', limit: 10, explain: true });
  assert.equal(ambiguous.guidance.components.find(item => item.query === 'temperature sensor').needs_clarification, true);
  assert.deepEqual(ambiguous.guidance.components.find(item => item.query === 'temperature sensor').models, []);
  const impossible = await service.search({ query: 'I want a system to monitor soil moisture and rainfall operating at -200°C', limit: 10, explain: true });
  assert.deepEqual(impossible.results, []);
});
const cases = [
  ['CS655', ['CS655']],
  ['soil moisture sensor', soil],
  ['cảm biến đo độ ẩm đất', soil],
  ['soil sensor with SDI-12', [...soilMulti, 'TempVue50']],
  ['cảm biến độ ẩm đất hỗ trợ SDI-12 và đo nhiệt độ đất', soilMulti],
  ['thiết bị dùng để quan trắc độ ẩm đất ngoài đồng', soil],
  ['sensor suitable for harsh outdoor environments', ['ClimaVue40', 'ClimaVue50G2']],
  ['thiết bị hoạt động ở nhiệt độ -50°C', null],
  ['thiết bị truyền dữ liệu qua cellular', ['CELL205-AT', 'CELL210-V', 'CELL215-IT1A', 'CELL220-IT1A', 'CELL225-IT1A', 'RV50X']],
  ['datalogger có Wi-Fi', ['CR310-WIFI']],
  ['cảm biến đo nhiệt độ độ ẩm và áp suất không khí', ['ClimaVue50G2', 'MetSENS300-D2', 'MetSENS500-DS', 'MetSENS550-D2']],
  ['cảm biến đo độ đục của nước', ['ClariVue10']],
  ['thiết bị đọc cảm biến vibrating wire', ['AVW200-ST', 'VWANALYZER', 'VWIRE305-XD', 'CRVW3-NE']],
  ['nguồn cấp cho hệ thống Campbell ngoài hiện trường', ['PS150', 'PS200', 'PS84-CR', 'PS24-w/CH150', 'CH150', 'CH200']],
  ['tôi cần cảm biến để theo dõi độ ẩm đất và nhiệt độ đất, ưu tiên giao tiếp SDI-12', soilMulti],
];

for (const [query, allowed] of cases) test(`catalog evidence: ${query}`, async () => {
  const response = await service.search({ query, limit: 100, explain: true });
  assert.ok(response.results.length > 0, 'must retrieve a confirmed match');
  for (const result of response.results) {
    if (allowed) assert.ok(allowed.includes(result.model), `unexpected result ${result.model}`);
    else assert.ok(specifications.get(result.product_id).some(s =>
      ['operating_temperature_range', 'operating_temperature_extended_duty_xd'].includes(s.canonical_key)
      && s.normalized_value.type === 'range' && s.normalized_value.unit === '°C'
      && s.normalized_value.min_value <= -50 && s.normalized_value.max_value >= -50), result.model);
    assert.ok(result.explanation.evidence.length > 0, 'show supporting evidence');
    assert.doesNotMatch(result.explanation.text, /chưa có|cannot confirm|no more specific/iu);
  }
  if (query.includes('harsh')) for (const result of response.results) {
    assert.match(result.explanation.evidence.find(e => e.field === 'ingress_protection').value, /no official certification.*should not/iu);
  }
});

for (const [query, excluded] of [
  ['soil moisture sensor without SDI-12', document => document.supported_protocols.includes('SDI-12')],
  ['datalogger without Wi-Fi', document => {
    const option = document.variants?.find(variant => variant.model === document.model)?.distinguishing_specifications.find(specification => specification.name_en === 'Communication Option')?.value_raw;
    return document.supported_protocols.includes('Wi-Fi') && (!option || /^wi[ -]?fi$/iu.test(option));
  }],
  ['non-cellular communication device', document => /\b(?:cellular|lte|[345]g)\b/iu.test(document.taxonomy.device_type + ' ' + document.supported_protocols.join(' '))],
  ['soil sensor but not temperature sensor', document => /temperature/iu.test(document.taxonomy.device_type + ' ' + document.measurements.map(item => item.key).join(' '))],
  ['c\u1ea3m bi\u1ebfn \u0111\u1ed9 \u1ea9m \u0111\u1ea5t kh\u00f4ng h\u1ed7 tr\u1ee3 SDI-12', document => document.supported_protocols.includes('SDI-12')],
]) test('applies exclusion from product evidence', async () => {
  const response = await service.search({ query, limit: 100 });
  assert.ok(response.results.length > 0);
  for (const result of response.results) assert.equal(excluded(documents.get(result.product_id)), false, result.model);
});

test('all requirements must hold even with a high semantic score; empty is preferable to inventing capability', async () => {
  const response = await service.search({ query: 'soil moisture sensor with Wi-Fi', limit: 10 });
  assert.deepEqual(response.results, []);
});

test('one transient read failure is retried; a persistent failure remains an error', async () => {
  let calls = 0;
  const recovered = makeService(async () => {
    if (++calls === 1) throw new ServiceUnavailableException();
    return { mode: 'hybrid', candidates };
  });
  assert.equal((await recovered.search({ query: 'CS655', limit: 10 })).results[0].model, 'CS655');
  assert.equal(calls, 2);
  calls = 0;
  const unavailable = makeService(async () => { calls++; throw new ServiceUnavailableException(); });
  await assert.rejects(unavailable.search({ query: 'CS655', limit: 10 }), ServiceUnavailableException);
  assert.equal(calls, 2);
});
