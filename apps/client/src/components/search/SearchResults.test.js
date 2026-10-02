import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchResults } from './SearchResults';

jest.mock('../commerce/FavoriteButton', () => ({ FavoriteButton: () => null }));
jest.mock('../commerce/AddToCartButton', () => ({ AddToCartButton: () => null }));

test('shows system components and clarification even with no products, and hides stale guidance while loading', () => {
  const props = { query: 'system', results: [], guidance: { text: 'Cần phối hợp thiết bị.', language: 'vi',
    components: [{ label: 'Ghi dữ liệu', query: 'data logger', models: ['CR310-NA'] }, { label: 'Nguồn', query: 'power supply', models: [] }] } };
  const markup = renderToStaticMarkup(<SearchResults {...props} />);
  expect(markup).toContain('Cần phối hợp thiết bị.');
  expect(markup).toContain('CR310-NA');
  expect(markup).toContain('Chưa có ứng viên được xác nhận');
  expect(renderToStaticMarkup(<SearchResults {...props} isLoading />)).not.toContain('Cần phối hợp thiết bị.');
});

test('shows the actual explanation source and readable evidence labels, including legacy responses', () => {
  const product = { product_id: 'CSI_TEMPVUE50', model: 'TempVue50', name_en: 'Temperature Sensor', category: 'Sensors' };
  const explanation = { text: 'Documented water temperature measurement.', language: 'en', evidence: [{ source: 'product_document', field: 'measurements', value: 'Water temperature' }] };
  const markup = renderToStaticMarkup(<SearchResults
    query="temperature sensor"
    results={[
      { ...product, explanation: { ...explanation, source: 'llm' } },
      { ...product, product_id: 'rule', explanation: { ...explanation, language: 'vi', source: 'rule' } },
      { ...product, product_id: 'legacy', explanation },
    ]}
    isInCompare={() => false}
  />);
  expect(markup).toContain('AI-assisted wording');
  expect(markup).toContain('Dựa trên dữ liệu');
  expect(markup).toContain('Measures: Water temperature');
  expect(markup).toContain('Đại lượng đo: Water temperature');
  expect((markup.match(/explanation-source/g) || []).length).toBe(2);
});
