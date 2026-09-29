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
