import { buildSpecMap, formatSpecValue, groupSpecifications } from './specifications';

test('BLACKGLOBE condition-dependent values survive detail and comparison grouping', () => {
  const values = ['±0.10°C from 0°C to 70°C', '±0.14°C at -5°C', '±0.25°C at 85°C', '±0.35°C at 95°C'];
  const specs = values.map((value) => ({ canonical_key: 'interchangeability_error', normalized_value: { type: 'text', value, value_raw: value } }));
  specs.push({ canonical_key: 'steinhart_hart_equation_error', normalized_value: { type: 'text', value_raw: '≤±0.01°C from -35°C to 50°C' } });
  const groups = groupSpecifications(specs);
  expect(groups).toHaveLength(2);
  expect(groups[0].values).toEqual(['±0.10 °C from 0 °C to 70 °C', '±0.14 °C at -5 °C', '±0.25 °C at 85 °C', '±0.35 °C at 95 °C']);
  expect(buildSpecMap(specs).interchangeability_error.split('\n')).toEqual(groups[0].values);
  expect(groups[1].values).toEqual(['≤ ±0.01 °C from -35 °C to 50 °C']);
});

test('comparison retains source qualifiers, operating conditions and alternate units', () => {
  expect(formatSpecValue({ type: 'number', value: 5, unit: 'mA', value_raw: '<5 mA, active' })).toBe('<5 mA, active');
  expect(formatSpecValue({ type: 'number', value: 305, unit: 'm', value_raw: '305 m (1000 ft)' })).toBe('305 m (1000 ft)');
  expect(formatSpecValue({ type: 'number', value: 0.3, unit: '°C', qualifier: '±', condition: 'at 0°C' })).toBe('± 0.3 °C (at 0 °C)');
  expect(formatSpecValue({ type: 'protocol', values: ['SDI-12', 'RS-485'] })).toBe('SDI-12, RS-485');
  expect(formatSpecValue({ type: 'boolean', value: false })).toBe('No');
  expect(buildSpecMap(null)).toEqual({});
});
