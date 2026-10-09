import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminProductDetailView, parsePriceInput } from './AdminProductDetailView';
import { ADMIN_USER, json, mockFetch, sessionFor, storeSession } from '../../test/fetchMock';

const detail = (overrides = {}) => ({
  product: { product_id: 'CSI_CS655', model: 'CS655', name_en: 'Water Content Reflectometer', name_vi: null, status: 'active' },
  supported_protocols: ['SDI-12'],
  specifications: [],
  important_specifications: [],
  media: [],
  price_vnd: 13210000,
  ...overrides,
});

beforeEach(() => storeSession(sessionFor(ADMIN_USER)));

test('parsePriceInput accepts whole VND amounts with separators', () => {
  expect(parsePriceInput('13.210.000')).toEqual({ value: 13210000 });
  expect(parsePriceInput('')).toEqual({ value: null });
  expect(parsePriceInput('-5').error).toBeTruthy();
  expect(parsePriceInput('12abc').error).toBeTruthy();
});

test('saves only price and offers no catalog inputs', async () => {
  const calls = mockFetch({
    'GET /admin/products/CSI_CS655': () => json(detail()),
    'PUT /admin/products/CSI_CS655/price': ({ body }) => json(detail({ price_vnd: body.price_vnd })),
  });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);
  fireEvent.click(await screen.findByRole('button', { name: /S\u1eeda gi\u00e1/ }));
  expect(document.getElementById('field-product_name_en')).toBeNull();
  fireEvent.change(document.getElementById('field-price_vnd'), { target: { value: '12.500.000' } });
  fireEvent.click(screen.getByRole('button', { name: /L\u01b0u gi\u00e1/ }));
  await screen.findByText('\u0110\u00e3 l\u01b0u gi\u00e1 s\u1ea3n ph\u1ea9m.');
  expect(calls.filter(c => c.method !== 'GET')).toEqual([expect.objectContaining({ method: 'PUT', body: { price_vnd: 12500000 } })]);
});

test('an unchanged price is not re-sent', async () => {
  const calls = mockFetch({
    'GET /admin/products/CSI_CS655': () => json(detail()),
    'PATCH /admin/products/CSI_CS655': () => json(detail()),
  });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  fireEvent.click(await screen.findByRole('button', { name: /S\u1eeda gi\u00e1/ }));
  fireEvent.click(screen.getByRole('button', { name: /L\u01b0u gi\u00e1/ }));

  await screen.findByText('\u0110\u00e3 l\u01b0u gi\u00e1 s\u1ea3n ph\u1ea9m.');
  expect(calls.some((c) => c.method !== 'GET')).toBe(false);
});

test('price write errors remain visible', async () => {
  mockFetch({
    'GET /admin/products/CSI_CS655': () => json(detail()),
    'PUT /admin/products/CSI_CS655/price': () => json({ message: 'Request validation failed', errors: [{ path: 'price_vnd', message: 'Price too large' }] }, 400),
  });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);
  fireEvent.click(await screen.findByRole('button', { name: /S\u1eeda gi\u00e1/ }));
  fireEvent.change(document.getElementById('field-price_vnd'), { target: { value: '999999999999' } });
  fireEvent.click(screen.getByRole('button', { name: /L\u01b0u gi\u00e1/ }));
  expect(await screen.findByText('Price too large')).toBeInTheDocument();
});

test('an invalid price is caught before any request', async () => {
  const calls = mockFetch({ 'GET /admin/products/CSI_CS655': () => json(detail()) });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  fireEvent.click(await screen.findByRole('button', { name: /S\u1eeda gi\u00e1/ }));
  fireEvent.change(document.getElementById('field-price_vnd'), { target: { value: '-1' } });
  fireEvent.click(screen.getByRole('button', { name: /L\u01b0u gi\u00e1/ }));

  expect(await screen.findByText('Giá phải là số nguyên VND (không âm).')).toBeInTheDocument();
  await waitFor(() => expect(calls).toHaveLength(1));
});

test('a 403 is shown instead of falling back to public data', async () => {
  mockFetch({ 'GET /admin/products/CSI_CS655': () => json({ message: 'Forbidden' }, 403) });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  expect(await screen.findByText('Bạn không có quyền thực hiện thao tác này.')).toBeInTheDocument();
});
