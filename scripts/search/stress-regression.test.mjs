import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const fromDist = name => require(`../../apps/api/dist/modules/search/${name}.js`);
const { specificationTerms, specificationEvidence } = fromDist('specification-query');
const { parseSearchIntent, matchSearchIntent } = fromDist('search-intent');
const { hasUnsupportedNegativeConstraint } = fromDist('conversation-query');
const { TechnicalQueryParserService } = fromDist('technical-query-parser.service');
const { ProductsRepository } = require('../../apps/api/dist/modules/products/products.repository.js');
const { suggestModels } = fromDist('model-suggestions');
const { KeywordSearchService } = fromDist('keyword-search.service');

test('sparse keyword prose supplements canonical intent and preserves original ordering', async () => {
  for (const query of ['datalogger có wifi', 'data loger wifi', 'bộ ghi dữ liệu']) {
    const queries = [];
    const row = { product_id: 'catalog-id', model: 'TEST', rank: 0.25 };
    const keyword = new KeywordSearchService({ getClient: () => ({ rpc: async (_, args) => {
      queries.push(args.query_text);
      return { data: args.query_text === '"data logger"' ? [row] : [] };
    } }) }, { getActiveTechnicalIdentityCatalog: async () => [] });
    assert.deepEqual(await keyword.search(query, 40), [row]);
    assert.deepEqual(queries, [query, '"data logger"']);
  }
  let calls = 0;
  const rows = [{ product_id: 'original', rank: 0.8 }];
  const keyword = new KeywordSearchService({ getClient: () => ({ rpc: async () => { calls++; return { data: rows }; } }) }, {});
  assert.equal(await keyword.search('bộ ghi dữ liệu', 1), rows);
  assert.equal(calls, 1);
  const extra = { product_id: 'additional', rank: 0.2 };
  const sparse = new KeywordSearchService({ getClient: () => ({ rpc: async (_, args) => ({
    data: args.query_text === '"data logger"' ? [...rows, extra] : rows,
  }) }) }, { getActiveTechnicalIdentityCatalog: async () => [] });
  assert.deepEqual(await sparse.search('datalogger with Wi-Fi', 40), [...rows, extra]);
  const unavailable = new KeywordSearchService({ getClient: () => ({ rpc: async (_, args) =>
    args.query_text === '"data logger"' ? { data: null, error: { message: 'unavailable' } } : { data: rows },
  }) }, { getActiveTechnicalIdentityCatalog: async () => [] });
  assert.deepEqual(await unavailable.search('datalogger with Wi-Fi', 40), rows);
});

test('model suggestions use the catalog and never collapse an ambiguous prefix to exact identity', () => {
  const catalog = [{ productId: 'a', model: 'ZX450' }, { productId: 'b', model: 'ZX455' }, { productId: 'c', model: 'RainTest10-MM' }];
  assert.deepEqual(suggestModels('ZX45', catalog).map(p => p.productId), ['a', 'b']);
  assert.deepEqual(suggestModels('ZX4555', catalog).map(p => p.productId), ['b']);
  assert.deepEqual(suggestModels('rain test', catalog).map(p => p.productId), ['c']);
  assert.deepEqual(suggestModels('ZX455', catalog), []);
  assert.deepEqual(suggestModels('completely unrelated', catalog), []);
});

test('raw specification matching preserves boundaries, ranges, and hyphen variants', () => {
  const spec = (value, key = 'test') => ({ canonical_key: key, normalized_value: { type: 'text', value, value_raw: value } });
  for (const [query, value] of [['24 bit ADC', '24-bit ADC'], ['IP62', 'IP62'], ['300 to 6500 Hz', '300 to 6500 Hz'], ['5 AA battery', '5 AA (1.5 V)'], ['accuracy 0.005%', '±0.005% of reading']]) {
    assert.ok(specificationTerms(query).length);
    assert.ok(specificationEvidence(specificationTerms(query), [spec(value)]));
  }
  assert.equal(specificationEvidence(['1 khz'], [spec('11 kHz')]), null);
  assert.equal(specificationEvidence(['ip62'], [spec('IP620')]), null);
  assert.equal(specificationEvidence(['canbus'], [spec('CANbus is not supported')]), null);
  assert.equal(specificationEvidence(['24 bit adc'], [spec('24-bit resistance measurement')]), null);
  assert.ok(specificationEvidence(['24 bit adc'], [spec('24-bit', 'adc')]));
  assert.deepEqual(specificationTerms('CS655 SDI-12 RS-232 operating -50°C'), []);
});

test('soil water wording and weather lists retain each independent requirement', () => {
  for (const q of ['soil humidity sensor', 'water content in soil', 'lượng nước trong đất', 'how wet the soil is']) {
    assert.deepEqual(parseSearchIntent(q).measurements.map(m => m.key), ['volumetric_water_content']);
  }
  for (const q of ['weather sensor temperature humidity pressure', 'thời tiết đo nhiệt độ độ ẩm áp suất']) {
    const intent = parseSearchIntent(q);
    assert.equal(intent.target.key, 'air_temperature');
    assert.deepEqual(intent.measurements.map(m => m.key), ['relative_humidity', 'barometric_pressure']);
  }
  assert.ok(hasUnsupportedNegativeConstraint('non-cellular communication device'));
  assert.ok(hasUnsupportedNegativeConstraint('soil sensor but not temperature sensor'));
  const parser = new TechnicalQueryParserService();
  assert.deepEqual(parser.parse('cellular because Wi-Fi is unavailable').protocols, []);
  assert.deepEqual(parser.parse('datalogger with Wi-Fi').protocols, ['Wi-Fi']);
  assert.deepEqual(parseSearchIntent('monitor rainfall').measurements.map(m => m.key), ['precipitation']);
  assert.deepEqual(parseSearchIntent('đo chất lượng nước').roles.map(r => r.key), ['waterquality']);
  assert.deepEqual(parseSearchIntent('data loger with USB').roles.map(r => r.key), ['logger']);
  assert.deepEqual(parseSearchIntent('power').roles.map(r => r.key), ['power']);
  assert.deepEqual(parseSearchIntent('low power soil sensor').roles.map(r => r.key), ['soil']);
  const reader = parseSearchIntent('vibrating wire field reader');
  const doc = type => ({ measurements: [], capabilities: [], name_en: type, taxonomy: { device_type: type } });
  assert.equal(matchSearchIntent(reader, doc('Vibrating Wire Data Logger')), null);
  assert.ok(matchSearchIntent(reader, doc('Vibrating Wire Analyzer')));
  const evidence = matchSearchIntent(parseSearchIntent('soil temperature'), { measurements: [], capabilities: [], taxonomy: { device_type: 'Soil Temperature Sensor' } });
  assert.deepEqual(evidence, [{ source: 'product_document', field: 'taxonomy.device_type', value: 'Soil Temperature Sensor' }]);
});

test('batch specification reads include text and paginate past the server cap', async () => {
  const ranges = [];
  const rows = Array.from({ length: 1001 }, (_, i) => ({ specification_id: i + 1, normalized_value: { type: 'text', value: 'IP62' } }));
  const query = {
    select() { return this; }, in() { return this; }, order() { return this; },
    range(from, to) { ranges.push([from, to]); return Promise.resolve({ data: rows.slice(from, to + 1), error: null }); },
  };
  const repository = new ProductsRepository({ getClient: () => ({ from: () => query }) });
  assert.equal((await repository.listSpecificationsByProductIds(['p'])).length, 1001);
  assert.deepEqual(ranges, [[0, 499], [500, 999], [1000, 1499]]);
});
