import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { SearchResults } from './SearchResults';

jest.mock('../commerce/FavoriteButton', () => ({ FavoriteButton: () => null }));
jest.mock('../commerce/AddToCartButton', () => ({ AddToCartButton: () => null }));

test('ranking and category evidence do not claim that products satisfy the full request', () => {
  for (const language of ['vi', 'en']) {
    const text = language === 'vi'
      ? 'Chưa có dữ liệu xác nhận toàn bộ yêu cầu.'
      : 'The data does not confirm all requirements.';
    const results = ['ClimaVue40', 'ClimaVue50G2', 'LWS'].map(model => ({
      product_id: model, model, name_en: model,
      explanation: { text, language, source: 'rule', evidence: [{
        source: 'product_document', field: 'taxonomy.device_type', value: 'Weather Sensor',
      }] },
    }));
    const markup = renderToStaticMarkup(<SearchResults query="Cảm biến khí tượng" results={results} />);
    expect(markup).not.toMatch(/phù hợp nhất|phù hợp với yêu cầu|fit your request|closest matches|Closest fit|Strong fit|Also meet your main requirement/);
    expect(markup).toContain(text);
    expect(markup).toContain(language === 'vi' ? 'Đối chiếu' : 'Compare');
  }
});

test('shows system components and clarification even with no products, and hides stale guidance while loading', () => {
  const props = { query: 'system', results: [], guidance: { text: 'Cần phối hợp thiết bị.', language: 'vi',
    components: [{ label: 'Ghi dữ liệu', query: 'data logger', models: ['CR310-NA'] }, { label: 'Nguồn', query: 'power supply', models: [] }] } };
  const markup = renderToStaticMarkup(<SearchResults {...props} />);
  expect(markup).toContain('Cần phối hợp thiết bị.');
  expect(markup).toContain('CR310-NA');
  expect(markup).toContain('Chưa có ứng viên được xác nhận');
  expect(renderToStaticMarkup(<SearchResults {...props} isLoading />)).not.toContain('Cần phối hợp thiết bị.');
});

test('shows the actual explanation source and hides evidence chips, including legacy responses', () => {
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
  expect(markup).not.toContain('Measures: Water temperature');
  expect(markup).not.toContain('Đại lượng đo: Water temperature');
  expect(markup).not.toContain('res-reasons');
  expect((markup.match(/explanation-source/g) || []).length).toBe(2);
});

test('keeps the overview brief and reveals the complete explanation with evidence collapsed', async () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const first = 'ClimaVue40 đo nhiệt độ và lượng mưa.';
  const caveat = 'Chưa xác nhận cấu hình lắp đặt phù hợp.';
  const results = ['ClimaVue40', 'ClimaVue50G2', '52202'].map(model => ({
    product_id: model, model, name: model,
    explanation: { text: `${first} ${caveat}`, language: 'vi', source: 'rule',
      evidence: [{ field: 'measurements', value: 'Lượng mưa', source: 'product_document' }] },
  }));
  try {
    await act(async () => root.render(<SearchResults query="Khí tượng thủy văn" results={results} />));
    expect(container.querySelector('.res-answer').textContent).not.toContain(first);
    expect(container.querySelector('.res-answer').textContent).toContain('ClimaVue40, ClimaVue50G2 và 52202');
    expect(container.textContent).not.toContain(caveat);
    expect(container.querySelectorAll('.res-reasons')).toHaveLength(0);
    const button = container.querySelector('.res-explain');
    await act(async () => button.click());
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const panel = container.querySelector('.res-fit');
    expect(panel.id).toBe(button.getAttribute('aria-controls'));
    expect(panel.querySelector('.res-fit__summary').textContent).toBe(first + caveat);
    expect(panel.querySelector('.res-fit__evidence').open).toBe(false);
    expect(panel.textContent).toContain('Đại lượng đo: Lượng mưa');
    await act(async () => panel.querySelector('.res-fit__close').click());
    expect(container.querySelector('.res-fit')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  } finally {
    await act(async () => root.unmount());
    delete global.IS_REACT_ACT_ENVIRONMENT;
  }
});
