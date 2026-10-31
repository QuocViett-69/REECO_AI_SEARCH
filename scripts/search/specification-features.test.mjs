import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { specificationConstraints: parse, matchSpecificationConstraints: match, specificationTerms } = require('../../apps/api/dist/modules/search/specification-query.js');
const { parseSearchIntent } = require('../../apps/api/dist/modules/search/search-intent.js');
const spec = (key, raw, normalized = { type: 'text', value: raw }) => ({
  canonical_key: key, normalized_value: { ...normalized, value_raw: raw }, raw_ref: { file: 'data/raw/test.json', product_index: 0, spec_index: 0, source_rows: [1] },
});

for (const [query, key, raw] of [
  ['Điện áp nguồn: 9 to 28 VDC', 'supply_voltage', '9 to 28 V DC'],
  ['Điện áp đầu ra 5 V', 'output_voltage_high', '5 V'],
  ['Dải áp suất 500 đến 1100 hPa', 'pressure_range', '50 to 110 kPa'],
  ['Dải tốc độ gió 0 to 60 m/s', 'wind_speed_range', '0 to 216 km/h'],
  ['Tần số 300 to 6500 Hz', 'vibrating_wire_frequency_range', '0.3 to 6.5 kHz'],
  ['Độ phân giải 0,001 Hz', 'measurement_resolution', '0.001 Hz RMS'],
  ['Độ chính xác ±0.005%', 'measurement_accuracy', '±0.005% of reading'],
  ['Bộ nhớ 80 MB', 'usb_memory', '80000 kB'],
  ['Cấp bảo vệ IP68', 'ingress_protection_rating', 'IP68'],
  ['Dòng tiêu thụ 14 mA', 'idle_current', '0.014 A'],
  ['Khối lượng 770 g', 'weight', '0.77 kg'],
  ['Đầu vào dòng 4 to 20 mA', 'current_loop_description', 'Two terminals support 4-to-20 mA current-loop inputs'],
  ['Độ phân giải 0,001 ° C', 'soil_temperature_resolution', '0.001°C'],
  ['Dải độ ẩm 0 to 100%RH', 'relative_humidity_range', '0 to 100% RH'],
]) test(`field-aware lookup: ${query}`, () => {
  const constraints = parse(query);
  assert.equal(constraints.length, 1);
  assert.deepEqual(specificationTerms(query), []);
  const result = match(constraints, [spec(key, raw)]);
  assert.ok(result, query);
  assert.equal(result[0].exact, true);
});

test('fields, units and conditions cannot be interchanged to satisfy a numeric request', () => {
  for (const [query, key, raw] of [
    ['Điện áp nguồn 12 VDC', 'output_voltage', '12 VDC'],
    ['Điện áp đầu ra 0.1 V', 'output_voltage_accuracy', '0.1 V'],
    ['Công suất tiêu thụ 10 W', 'power_output', '10 W'],
    ['Điện áp nguồn 12 VDC', 'supply_voltage', '12 VAC'],
    ['Dòng đầu ra 4 to 20 mA', 'current_loop_description', '4 to 20 mA'],
    ['Đầu vào dòng 4 to 20 mA', 'current_loop_description', 'Two terminals do not support 4 to 20 mA inputs'],
    ['Đầu vào dòng 4 to 20 mA', 'current_loop_description', '10004 to 20 mA'],
    ['Độ phân giải 0.1 hPa', 'pressure_range', '0.1 hPa'],
    ['Dải đo độ ẩm 0 to 100%', 'operating_humidity_range', '0 to 100%'],
    ['Tần số lấy mẫu 40 Hz', 'frequency_range', '40 Hz'],
    ['Bộ nhớ lưu dữ liệu 2 MB', 'operating_system_memory', '2 MB'],
    ['USB memory 80 MB', 'system_memory', '80 MB'],
    ['Cấp bảo vệ IP67', 'ingress_protection', 'IP68'],
    ['Điện áp nguồn 28 to 9 VDC', 'supply_voltage', '28 to 9 VDC'],
    ['Độ chính xác <=0.1°C', 'accuracy', '±0.1°C at 0°C'],
  ]) assert.equal(match(parse(query), [spec(key, raw)]), null, query);
});

test('exact interval precedes covering intervals and explicit bounds respect direction', () => {
  const exact = spec('supply_voltage', '9 to 28 VDC');
  const covering = spec('supply_voltage', '5 to 30 VDC');
  assert.equal(match(parse('Điện áp nguồn 9 to 28 VDC'), [covering, exact])[0].specification, exact);
  assert.equal(match(parse('Điện áp nguồn 12 VDC'), [covering])[0].exact, false);
  const memory = spec('usb_memory', '80 MB', { type: 'number', value: 80, unit: 'MB', qualifier: null });
  assert.ok(match(parse('Bộ nhớ tối thiểu 64 MB'), [memory]));
  assert.equal(match(parse('Bộ nhớ >80 MB'), [memory]), null);
  assert.ok(match(parse('Bộ nhớ >=80 MB'), [memory]));
  const accuracy = spec('accuracy', '0.1 hPa', { type: 'number', value: 0.1, unit: 'hPa', qualifier: null });
  assert.ok(match(parse('Độ chính xác <=20 Pa'), [accuracy]));
  assert.equal(match(parse('Độ chính xác <10 Pa'), [accuracy]), null);
});

test('multiple constraints stay separate from legacy values and product intent', () => {
  const query = 'Điện áp nguồn 9 to 28 VDC và cấp bảo vệ IP68';
  assert.equal(parse(query).length, 2);
  assert.equal(match(parse(query), [spec('supply_voltage', '9 to 28 VDC')]), null);
  assert.ok(match(parse(query), [spec('supply_voltage', '9 to 28 VDC'), spec('ip_rating', 'IP68')]));
  assert.deepEqual(parseSearchIntent('Tốc độ truyền dữ liệu 9600 bps').roles, []);
  assert.deepEqual(specificationTerms('độ phân giải 24 bit ADC'), ['24 bit adc']);
});

test('signed voltage ranges and documented bounds retain their meaning', () => {
  const bipolar = spec('output_voltage', '±5 V', { type: 'number', value: 5, unit: 'V', qualifier: '±' });
  assert.equal(match(parse('Điện áp đầu ra 5 V'), [bipolar])[0].exact, false);
  assert.equal(match(parse('Điện áp đầu ra ±5 V'), [bipolar])[0].exact, true);
  const upper = spec('current_consumption', '<5 mA', { type: 'number', value: 5, unit: 'mA', qualifier: '<' });
  assert.ok(match(parse('Dòng tiêu thụ <=5 mA'), [upper]));
  assert.ok(match(parse('Dòng tiêu thụ <5 mA'), [upper]));
  assert.equal(match(parse('Dòng tiêu thụ >=5 mA'), [upper]), null);
  assert.equal(match(parse('Dòng tiêu thụ 5 mA'), [upper]), null);
});
