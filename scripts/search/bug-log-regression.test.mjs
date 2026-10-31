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
const { OPERATING_TEMPERATURE_KEYS, MEASUREMENT_TEMPERATURE_KEYS } = fromDist('technical-query.constants');
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
const cases = JSON.parse(await readFile(new URL('./bug-log-cases.json', import.meta.url), 'utf8'));
import { expected, explanationChecks, firstExpected } from './bug-log-expectations.mjs';

test('the current follow-up language controls both explanations and guidance across languages', async () => {
  for (const [query, baseQuery, language] of [
    ['Explain this product for my requirements', 'Tôi cần cảm biến độ ẩm đất', 'en'],
    ['Giải thích sản phẩm này', 'I need a soil moisture sensor', 'vi'],
    ['Does it support SDI-12?', 'Tôi cần cảm biến độ ẩm đất', 'en'],
  ]) {
    const response = await service.search({ query, limit: 10, explain: true,
      context: { base_query: baseQuery, previous_query: baseQuery, product_ids: ['CSI_CS655'] } });
    assert.ok(response.results.length);
    if (response.guidance) assert.equal(response.guidance.language, language);
    for (const result of response.results) {
      assert.equal(result.explanation.language, language);
      assert.doesNotMatch(result.explanation.text, language === 'en' ? /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu : /\b(?:operating|supports|measurement|profile|logger|cellular)\b/iu);
    }
  }
});

test('named technical specifications retrieve, rank and explain their own fields', async () => {
  for (const [query, expectedModel] of [
    ['Điện áp nguồn 9 to 28 VDC', 'BaroVue10'],
    ['Dải áp suất 500 to 1100 hPa', 'BaroVue10'],
    ['Bộ nhớ 80 MB', 'VWANALYZER'],
    ['Bộ nhớ tối thiểu 64 MB', 'VWANALYZER'],
    ['Độ chính xác ±0.005%', 'VWANALYZER'],
    ['Cấp bảo vệ IP68', 'CS655'],
    ['Dòng tiêu thụ 14 mA', 'CELL210-V'],
    ['Đầu vào dòng 4 to 20 mA', 'CR310-NA'],
  ]) {
    const response = await service.search({ query, limit: 100, explain: true });
    assert.ok(response.results.some(p => p.model === expectedModel), query);
    assert.ok(response.results.every(p => p.matched_features.some(f => f.startsWith('specification:'))));
    for (const result of response.results) {
      assert.ok(result.explanation.requirements.some(r => r.status === 'confirmed'));
      assert.ok(result.explanation.evidence.some(e => e.source === 'normalized_spec' && e.raw_ref));
      assert.doesNotMatch(result.explanation.text, /Operating Temperature Range|Thông số output power|Thông số operating system memory/u);
    }
    if (query.startsWith('Dòng tiêu thụ')) assert.match(response.results[0].explanation.text, /chế độ nghỉ/u);
  }
  const combined = await service.search({ query: 'Điện áp nguồn 6 to 18 VDC và cấp bảo vệ IP68', limit: 100 });
  assert.deepEqual(combined.results.map(p => p.model).sort(), ['CS650', 'CS655']);
  assert.deepEqual((await service.search({ query: 'Bộ nhớ tối thiểu 900 GB', limit: 10 })).results, []);
});

test('exact specification interval remains first when semantic reranking reverses the candidate list', async () => {
  const reversed = new SearchService({ search: async () => ({ mode: 'hybrid', candidates }) }, products,
    new TechnicalQueryParserService(), new TechnicalMatchService(products), new TechnicalRankingService(),
    { rerank: async (_q, _p, rows) => [...rows].reverse() }, new ExplanationService());
  const response = await reversed.search({ query: 'Tần số 300 to 6500 Hz', limit: 100, explain: true });
  assert.equal(response.results[0].model, 'VWANALYZER');
  assert.match(response.results[0].explanation.text, /khớp đúng giá trị/u);
  const covering = response.results.find(p => p.model === 'AVW200-ST');
  assert.match(covering.explanation.text, /bao phủ/u);
});

test('temperature specification queries rank exact intervals and explain covering alternatives', async () => {
  for (const query of ['Dải nhiệt độ hoạt động\t-35 to +70 °C', 'Nhiệt độ vận hành −35 – +70°C', 'Operating temperature -31 to 158°F']) {
    const response = await service.search({ query, limit: 100, explain: true });
    assert.equal(response.results[0].model, 'WindSonic1');
    assert.match(response.results[0].explanation.text, /khớp đúng dải|exactly matches/u);
    assert.ok(response.results.slice(1).some(p => /bao phủ|covers/u.test(p.explanation.text)));
    assert.ok(response.results.every(p => p.matched_features.includes('operating-temperature:-35..70°C')));
    assert.ok(response.results.every(p => p.explanation.evidence.some(e => OPERATING_TEMPERATURE_KEYS.includes(e.field) && e.raw_ref)));
  }
  const measurement = await service.search({ query: 'Dải đo nhiệt độ -35 to +70°C', limit: 100, explain: true });
  assert.ok(measurement.results.length);
  assert.ok(measurement.results.every(p => p.explanation.evidence.some(e => MEASUREMENT_TEMPERATURE_KEYS.includes(e.field) && e.raw_ref)));
  const empty = await service.search({ query: 'Dải nhiệt độ hoạt động -200 to +300°C', limit: 10, explain: true });
  assert.deepEqual(empty.results, []);
});

test('canonical retrieval retains temperature requirements beside the measurement target', async () => {
  const capture = makeService(async query => {
    const parsed = new TechnicalQueryParserService().parse(query);
    assert.equal(parsed.temperatureConstraints[0].intent, 'operating');
    assert.equal(parsed.temperatureConstraints[0].minCelsius, -35);
    assert.equal(parsed.temperatureConstraints[0].maxCelsius, 70);
    return { mode: 'hybrid', candidates };
  });
  const response = await capture.search({ query: 'Cảm biến đo tốc độ gió dải nhiệt độ hoạt động -35 to +70°C', limit: 10 });
  assert.equal(response.results[0].model, 'WindSonic1');
});

test('TC22/30/63: preferred rain gauge, Vietnamese prose and direct Wi-Fi answer', async () => {
  const rain = await service.search({ query: cases.find(c => c.id === 'TC-05').query, limit: 10, explain: true });
  assert.equal(rain.results[0].model, 'RainVue10-MM');
  assert.doesNotMatch(rain.results[0].explanation.text, /\bheated\b|\brainfall\b|Precipitation Amount|measurement uncertainty|\bintensity\b/iu);
  const wind = await service.search({ query: cases.find(c => c.id === 'TC-09').query, limit: 10, explain: true });
  assert.match(wind.results[0].explanation.text, /không có bộ phận quay cơ học/u);
  assert.doesNotMatch(wind.results[0].explanation.text, /full-scale|coordinate system|customized|rotor/iu);
  const wifi = await service.search({ query: cases.find(c => c.id === 'TC-18').query, limit: 10, explain: true });
  assert.match(wifi.results[0].explanation.text, /không kết nối Wi-Fi trực tiếp/u);
  assert.match(wifi.results[0].explanation.text, /SDI-12 hoặc RS-232/u);
  assert.doesNotMatch(wifi.results[0].explanation.text, /RS-485/u);
});
// The adversarial candidate pool deliberately contains every catalog item. This
// verifies policy/evidence, not retrieval recall; bug-log-live.mjs tests real retrieval.
for (const item of cases) test(`${item.id}: catalog policy and grounded explanation`, async () => {
  const n = Number(item.id.slice(3));
  if (n >= 25) {
    assert.equal(require('@reeco/shared').SearchRequestSchema.safeParse({ query: item.query }).success, false);
    const guarded = makeService(async () => assert.fail('invalid input reached retrieval'));
    await assert.rejects(guarded.search({ query: item.query, limit: 10 }), error => error.getStatus() === 400);
    return;
  }
  if (n >= 22) {
    const guarded = makeService(async () => assert.fail('outside catalog reached retrieval'));
    assert.deepEqual((await guarded.search({ query: item.query, limit: 10 })).results, []);
    return;
  }
  const response = await service.search({ query: item.query, limit: 30, explain: true });
  for (const model of expected[item.id]) assert.ok(response.results.some(p => p.model === model), `${item.id}: missing ${model}`);
  if (firstExpected.includes(item.id)) assert.equal(response.results[0].model, expected[item.id][0]);
  if (['TC-01','TC-02','TC-03','TC-04','TC-06','TC-07','TC-11','TC-12','TC-18'].includes(item.id)) {
    assert.deepEqual(response.results.map(p => p.model).sort(), expected[item.id].sort());
  }
  if (item.id === 'TC-14') {
    for (const role of ['weather', 'data logger', 'cellular', 'power']) assert.ok(response.guidance.components.some(c => c.query.includes(role)), role);
    assert.match(response.guidance.text, /chưa xác nhận tương thích/u);
  }
  if (['TC-10','TC-21'].includes(item.id)) assert.ok(response.results.every(p => !/logger/iu.test(p.device_type)));
  if (['TC-15','TC-16','TC-17'].includes(item.id)) assert.ok(response.results.every(p => !/cellular/iu.test(p.device_type)));
  for (const result of response.results) {
    assert.ok(result.explanation.evidence.length);
    for (const fact of result.explanation.evidence.filter(e => e.source === 'normalized_spec' && e.raw_ref)) {
      const spec = specifications.get(result.product_id).find(s => s.canonical_key === fact.field);
      assert.ok(spec, fact.field);
      assert.deepEqual(fact.raw_ref, spec.raw_ref, 'evidence belongs to this product and source attribute');
    }
  }
  if (explanationChecks[item.id]) {
    const result = response.results.find(p => p.model === expected[item.id][0]);
    assert.match(result.explanation.text, explanationChecks[item.id]);
  }
});

test('BUG-07: best follow-up retains constraints; allowing immersion broadens candidates', async () => {
  const query = cases[0].query;
  const first = await service.search({ query, limit: 10 });
  const context = { base_query: query, previous_query: query, product_ids: first.results.map(p => p.product_id) };
  const best = await service.search({ query: 'cái nào phù hợp nhất?', limit: 10, context });
  assert.deepEqual(best.results.map(p => p.model), ['RangeVue30']);
  const broader = await service.search({ query: 'chấp nhận cảm biến chìm', limit: 30, context });
  assert.ok(broader.results.some(p => p.model === 'CS451'));
  assert.equal(broader.context_applied, true);
});

test('TC-19: actual explanation path times out at 20000 ms, aborts and ignores late output', async t => {
  const oldEnabled = process.env.LLM_EXPLANATION_ENABLED;
  const oldModel = process.env.LLM_MODEL;
  const oldTimeout = process.env.LLM_EXPLANATION_TIMEOUT_MS;
  const oldFetch = globalThis.fetch;
  process.env.LLM_EXPLANATION_ENABLED = 'true';
  process.env.LLM_MODEL = 'fault-injection';
  process.env.LLM_EXPLANATION_TIMEOUT_MS = '20000';
  let signal, release;
  globalThis.fetch = async (_url, options) => { signal = options.signal; return new Promise(resolve => { release = resolve; }); };
  t.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const timed = new SearchService({ search: async () => ({ mode: 'hybrid', candidates }) }, products,
      new TechnicalQueryParserService(), new TechnicalMatchService(products), new TechnicalRankingService(),
      { rerank: async (_q, _p, rows) => rows }, new ExplanationService());
    const pending = timed.search({ query: 'CS655 soil moisture sensor', limit: 10, explain: true });
    for (let i = 0; i < 100 && !signal; i++) await Promise.resolve();
    assert.ok(signal, 'LLM was actually called');
    t.mock.timers.tick(19999);
    assert.equal(signal.aborted, false);
    t.mock.timers.tick(1);
    const response = await pending;
    assert.deepEqual(response.results.map(p => p.model), ['CS655']);
    assert.equal(response.results[0].explanation.generation.status, 'timeout');
    assert.equal(response.results[0].explanation.source, 'rule');
    assert.equal(signal.aborted, true);
    const snapshot = JSON.stringify(response);
    release({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: response.results[0].explanation.text }] }) } }) });
    await Promise.resolve(); await Promise.resolve();
    assert.equal(JSON.stringify(response), snapshot);
  } finally {
    globalThis.fetch = oldFetch;
    for (const [key, value] of Object.entries({ LLM_EXPLANATION_ENABLED: oldEnabled, LLM_MODEL: oldModel, LLM_EXPLANATION_TIMEOUT_MS: oldTimeout })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    t.mock.timers.reset();
  }
});

test('TC-27: each/both branch errors, deadlines, healthy empty and sanitized 503', async t => {
  const { HybridSearchService } = fromDist('hybrid-search.service');
  const { SearchScoreService } = fromDist('search-score.service');
  const keyword = [{ product_id: 'CSI_CS655', model: 'CS655', product_name_en: 'Soil sensor', rank: 1 }];
  const semantic = [{ productId: 'CSI_CS655', model: 'CS655', productNameEn: 'Soil sensor', rank: 1, similarity: 0.9 }];
  for (const failure of ['error', 'timeout']) for (const failed of [['keyword'], ['semantic'], ['keyword', 'semantic']]) {
    const signals = [];
    const branch = (name, rows) => ({ search: async (_q, _l, signal) => {
      if (!failed.includes(name)) return rows;
      if (failure === 'error') throw new Error('private database connection secret');
      signals.push(signal); return new Promise(() => {});
    } });
    const hybrid = new HybridSearchService(branch('keyword', keyword), branch('semantic', semantic), new SearchScoreService());
    t.mock.timers.enable({ apis: ['setTimeout'] });
    try {
      const pending = hybrid.search('soil moisture');
      const outcome = pending.then(value => ({ value }), error => ({ error }));
      if (failure === 'timeout') t.mock.timers.tick(15000);
      const result = await outcome;
      if (failed.length === 2) assert.equal(result.error.code, 'HYBRID_RETRIEVAL_FAILED');
      else {
        assert.equal(result.value.mode, failed[0] === 'keyword' ? 'semantic_fallback' : 'keyword_fallback');
        assert.equal(result.value.candidates[0].productId, 'CSI_CS655');
      }
      assert.ok(signals.every(s => s.aborted));
    } finally { t.mock.timers.reset(); }
  }
  const empty = new HybridSearchService({ search: async () => [] }, { search: async () => [] }, new SearchScoreService());
  assert.deepEqual((await empty.search('soil')).candidates, []);
  const broken = new HybridSearchService({ search: async () => { throw new Error('secret'); } }, { search: async () => { throw new Error('secret'); } }, new SearchScoreService());
  await assert.rejects(makeService(broken.search.bind(broken)).search({ query: 'soil', limit: 10 }), e => e.getStatus() === 503 && !JSON.stringify(e.getResponse()).includes('secret'));
});

test('HTTP trust boundary: invalid queries 400, failed sources 503, healthy empty 200', async () => {
  const { Module } = require('@nestjs/common');
  const { NestFactory } = require('@nestjs/core');
  const { SearchController } = fromDist('search.controller');
  const { HybridSearchError } = fromDist('hybrid-search.service');
  let mode = 'empty', calls = 0;
  const actual = makeService(async () => {
    calls++;
    if (mode === 'failed') throw new HybridSearchError('HYBRID_RETRIEVAL_FAILED', 'private backend error');
    return { mode: 'hybrid', candidates: [] };
  });
  class HttpFixture {}
  Module({ controllers: [SearchController], providers: [{ provide: SearchService, useValue: actual }] })(HttpFixture);
  const app = await NestFactory.create(HttpFixture, { logger: false });
  app.setGlobalPrefix('api/v1');
  await app.listen(0, '127.0.0.1');
  const url = `${await app.getUrl()}/api/v1/search`;
  const post = query => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  try {
    for (const query of [' \t\n ', '!@#$%^&*']) assert.equal((await post(query)).status, 400);
    assert.equal(calls, 0);
    const healthy = await post('soil moisture sensor');
    assert.equal(healthy.status, 200); assert.deepEqual((await healthy.json()).results, []);
    mode = 'failed';
    const failed = await post('soil moisture sensor');
    assert.equal(failed.status, 503); assert.doesNotMatch(await failed.text(), /private|secret/iu);
  } finally { await app.close(); }
});

test('numeric variants, unseen depth, absent mandatory evidence, and capability intent', async () => {
  for (const temperature of ['âm 40 độ C', '-40°C', '−40 °C', 'âm 45 độ C']) {
    const query = `Cảm biến nhiệt độ không khí chịu lạnh ${temperature}`;
    const result = await service.search({ query, limit: 30, explain: true });
    assert.ok(result.results.some(p => p.model === '109'));
    const match = result.results.find(p => p.model === '109').explanation.requirements.find(r => r.label.includes('°C'));
    assert.equal(match.status, 'confirmed');
    assert.match(match.label, /-(?:40|45)°C/u);
  }
  assert.deepEqual((await service.search({ query: 'Cảm biến độ ẩm đất nhiều tầng ở độ sâu 70cm', limit: 30 })).results, []);
  assert.deepEqual((await service.search({ query: 'Cảm biến độ ẩm đất nhiều tầng giao tiếp RS-485 Modbus RTU', limit: 30 })).results, []);
  await assert.rejects(service.search({ query: 'Cảm biến độ ẩm đất nhiều tầng without PROFINET', limit: 30 }), e => e.getStatus() === 400);
  const english = await service.search({ query: 'I have CR1000X need to buy soil moisture sensor supporting SDI-12', limit: 30 });
  assert.ok(english.results.some(p => p.model === 'CS655')); assert.ok(english.results.every(p => !/logger/iu.test(p.device_type)));
  const capability = await service.search({ query: 'Does CS655 support Wi-Fi?', limit: 10, explain: true });
  assert.deepEqual(capability.results.map(p => p.model), ['CS655']);
  assert.equal(capability.results[0].explanation.requirements.find(r => r.label === 'Wi-Fi').status, 'unconfirmed');
  const demanded = await service.search({ query: 'CS655 with Wi-Fi', limit: 10 });
  assert.deepEqual(demanded.results, []);
  for (const query of ['cảm biến áp suất không khí', 'quan trắc chất lượng nước', 'modem truyền dữ liệu']) {
    assert.ok((await service.search({ query, limit: 10 })).results.length, query);
  }
  const noncontact = await service.search({ query: 'water level sensor without immersing the probe', limit: 30 });
  assert.deepEqual(noncontact.results.map(p => p.model), ['RangeVue30']);
  const logger = await service.search({ query: 'bộ ghi dữ liệu không dùng Modbus', limit: 30, explain: true });
  const alternative = logger.results.find(p => p.model === 'CR310-NA').explanation.requirements.find(r => r.label === 'không dùng Modbus');
  assert.equal(alternative.status, 'confirmed'); assert.ok(alternative.evidence.length);
  const englishLogger = await service.search({ query: 'data logger without using Modbus', limit: 30, explain: true });
  assert.ok(englishLogger.results.some(p => p.model === 'CR310-NA'));
});
