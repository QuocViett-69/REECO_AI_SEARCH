import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const fromDist = name => require(`../../apps/api/dist/modules/search/${name}.js`);
const { specificationTerms, specificationEvidence } = fromDist('specification-query');
const { parseSearchIntent } = fromDist('search-intent');
const { hasUnsupportedNegativeConstraint } = fromDist('conversation-query');
const { TechnicalQueryParserService } = fromDist('technical-query-parser.service');
const { ProductsRepository } = require('../../apps/api/dist/modules/products/products.repository.js');
const { suggestModels } = fromDist('model-suggestions');

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
