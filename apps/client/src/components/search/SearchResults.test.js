import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchResults } from './SearchResults';

jest.mock('../commerce/FavoriteButton', () => ({ FavoriteButton: () => null }));
jest.mock('../commerce/AddToCartButton', () => ({ AddToCartButton: () => null }));

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
