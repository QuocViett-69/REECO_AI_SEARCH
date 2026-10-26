import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const fromDist = name => require(`../../apps/api/dist/modules/search/${name}.js`);
const { TechnicalQueryParserService } = fromDist('technical-query-parser.service');
const { TechnicalMatchService } = fromDist('technical-match.service');
const { parseNegativeConstraints, resolveConversationQuery } = fromDist('conversation-query');
const { parseSearchIntent } = fromDist('search-intent');
const { specificationTerms, specificationEvidence } = fromDist('specification-query');
const { verifiedWording } = fromDist('explanation-wording');
const parser = new TechnicalQueryParserService();
const spec = (value, key = 'test') => ({ canonical_key: key, normalized_value: { type: 'text', value, value_raw: value } });

test('temperature units, comma decimals and mixed-unit intervals normalize to Celsius', () => {
  for (const [query, expected] of [
    ['operates at -40°F', -40], ['hoạt động ở 273,15 K', 0],
    ['đo nhiệt độ nước 32 Fahrenheit', 0], ['operates at 21,5°C', 21.5],
  ]) {
    const [constraint] = parser.parse(query).temperatureConstraints;
    assert.equal(constraint.valueCelsius, expected, query);
    assert.equal(constraint.unit, '°C');
    assert.equal(constraint.confidence, 'high');
  }
  for (const query of ['operating temperature -40–158°F', 'operating temperature -40°F to 343.15 K', 'nhiệt độ hoạt động giữa -40 và 70 độ C']) {
    const [constraint] = parser.parse(query).temperatureConstraints;
    assert.equal(constraint.kind, 'range', query);
    assert.equal(constraint.minCelsius, -40);
    assert.equal(constraint.maxCelsius, 70);
  }
  assert.equal(parser.parse('operates at 50 without a unit').temperatureConstraints.length, 0);
  const constraints = parser.parse('operates at -40°F; measurement range 273.15 K to 323.15 K').temperatureConstraints;
  assert.deepEqual(constraints.map(item => item.intent), ['operating', 'measurement']);
});

test('temperature evidence in Fahrenheit is converted without mixing measurement and operating keys', async () => {
  const evidence = new Map([['A', { product: { product_id: 'A' }, document: { supported_protocols: [], unsupported_protocols: [] },
    specifications: [{ canonical_key: 'operating_temperature_range', normalized_value: { type: 'range', min_value: -40, max_value: 158, unit: '°F' }, raw_ref: { file: 'fixture.json' } }] }]]);
  const matcher = new TechnicalMatchService({ getTechnicalEvidenceByIds: async () => evidence });
  assert.equal((await matcher.evaluate(parser.parse('operates at 343.15 K'), ['A']))[0].temperatureMatches[0].result, 'MATCH');
  assert.equal((await matcher.evaluate(parser.parse('operates at 71°C'), ['A']))[0].temperatureMatches[0].result, 'MISMATCH');
  assert.equal((await matcher.evaluate(parser.parse('measure up to 70°C'), ['A']))[0].temperatureMatches[0].result, 'UNKNOWN');
});

test('specific protocols stay distinct, preserve aliases and work in follow-up queries', async () => {
  assert.deepEqual(parser.parse('Modbus TCP/IP and Modbus-ASCII, Ethernet, rs422, Pak Bus, DNP-3, MQTT').protocols,
    ['Modbus TCP', 'Modbus ASCII', 'RS-422', 'Ethernet', 'PakBus', 'DNP3', 'MQTT']);
  const evidence = new Map([['A', { product: { product_id: 'A' }, document: { supported_protocols: ['Modbus RTU', 'rs 485'], unsupported_protocols: [] }, specifications: [] }]]);
  const matcher = new TechnicalMatchService({ getTechnicalEvidenceByIds: async () => evidence });
  const evaluated = await matcher.evaluate(parser.parse('Modbus TCP RS485'), ['A']);
  assert.deepEqual(evaluated[0].protocolMatches.map(item => item.result), ['MATCH', 'UNKNOWN']);
  assert.deepEqual(resolveConversationQuery('Ethernet', { base_query: 'data logger', previous_query: 'data logger USB' }),
    { query: 'data logger USB Ethernet', applied: true });
  assert.deepEqual(parser.parse('MQTTbroker DNP30 ModbusTCPjunk').protocols, []);
});

test('negated protocol lists never become positive filters, while optional and question forms stay distinct', () => {
  for (const query of ['sensor without RS-485 and USB', 'cảm biến không hỗ trợ RS485 và USB', 'sensor doesn’t support RS-485, USB']) {
    const negative = parseNegativeConstraints(query);
    assert.deepEqual(negative.exclusions.protocols, ['RS-485', 'USB'], query);
    assert.equal(negative.unsupported, false);
    assert.deepEqual(parser.parse(query).protocols, []);
  }
  assert.deepEqual(parser.parse('cảm biến không dùng CAN bus, cần SDI12').protocols, ['SDI-12']);
  assert.deepEqual(parseSearchIntent('cảm biến không dùng CAN bus').specifications, []);
  assert.deepEqual(parser.parse('cảm biến không cần Wi-Fi, cần USB').protocols, ['USB']);
  assert.deepEqual(parseNegativeConstraints('cảm biến không cần Wi-Fi').exclusions.protocols, []);
  assert.deepEqual(parser.parse('có hỗ trợ RS485 không?').protocols, ['RS-485']);
  assert.deepEqual(parser.parse('USB is not supported; RS485').protocols, ['RS-485']);
  assert.deepEqual(parseNegativeConstraints('cảm biến USB không được hỗ trợ').exclusions.protocols, ['USB']);
  assert.deepEqual(parser.parse('sensor does not need Wi-Fi, with USB').protocols, ['USB']);
  assert.deepEqual(parser.parse('không chỉ RS485 mà còn USB').protocols, ['RS-485', 'USB']);
  assert.deepEqual(parser.parse('Arduino sensor with USB').protocols, ['USB']);
  assert.equal(parseNegativeConstraints('sensor without PROFINET').unsupported, true);
  assert.equal(parseNegativeConstraints('cảm biến không hỗ trợ PROFINET').unsupported, true);
  assert.equal(parseNegativeConstraints('sensor does not operate at 70°C').unsupported, true);
  assert.equal(parseNegativeConstraints('cảm biến không đo độ ẩm đất').unsupported, true);
  assert.equal(parseNegativeConstraints('non-contact water level sensor').unsupported, false);
});

test('engineering quantities convert only explicit compatible units with numeric boundaries', () => {
  for (const [query, raw] of [
    ['1000 Hz', '1 kHz'], ['1 MHz', '1000000 Hz'], ['2500 mV', '2.5 V'],
    ['12 VDC', '9 to 24 VDC'], ['-5 V', '-5000 mV'], ['0,02 A', '20 mA'], ['0.001 A', '1000 µA'],
    ['30 cm', '300 mm'], ['100 kPa', '1 bar'], ['4 to 20 mA', '0.004 to 0.020 A'],
  ]) assert.ok(specificationEvidence(specificationTerms(query), [spec(raw)]), `${query}: ${raw}`);
  for (const [query, raw] of [['1 kHz', '11 kHz'], ['12 VDC', '12 VAC'], ['-5 V', '5 V'], ['5 V', '-5 V'], ['30 cm', '30 m'], ['1 mW', '1 MW'], ['1 mPa', '1 MPa']]) {
    assert.equal(specificationEvidence(specificationTerms(query), [spec(raw)]), null, `${query}: ${raw}`);
  }
  assert.deepEqual(specificationTerms('CS655 SDI-12 RS-485 3100'), []);
  assert.equal(specificationEvidence(specificationTerms('4 to 20 mA'), [spec('8 to 20 mA')]), null);
  assert.equal(specificationEvidence(specificationTerms('20 to 4 mA'), [spec('20 to 4 mA')]), null);
  assert.equal(specificationEvidence(specificationTerms('1 mVDC'), [spec('1 MVDC')]), null);
});

test('generated wording accepts combined paraphrases and sentence ordering, not claims altered with the same vocabulary', () => {
  const original = 'Product data confirms support for SDI-12. Available data does not confirm air temperature. The documented operating range -50–70°C covers -40°C.';
  const natural = 'The documented operating temperature range -50–70°C covers -40°C. CS655 supports SDI-12. The available evidence does not confirm air temperature.';
  assert.equal(verifiedWording(natural, original, 'CS655'), true);
  for (const text of [
    natural.replace('does not confirm', 'confirms'), natural.replace('-40°C', '-41°C'),
    natural.replace('operating temperature', 'measurement temperature'), natural.replace('SDI-12', 'Modbus RTU'),
    natural.replace('CS655', 'CS650'), natural + ' CS655 is waterproof.',
    'CS655 supports SDI-12.', natural.replace('supports SDI-12', 'SDI-12 supports CS655'),
  ]) assert.equal(verifiedWording(text, original, 'CS655'), false, text);
  assert.equal(verifiedWording(natural.replace('CS655 supports SDI-12.', 'CS655 supports SDI-12. CS655 supports SDI-12.'), original, 'CS655'), false);
});
