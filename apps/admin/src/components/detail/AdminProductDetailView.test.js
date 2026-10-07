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

test('saves the name with PATCH and a changed price with PUT, then shows the saved values', async () => {
  let saved = detail();
  const calls = mockFetch({
    'GET /admin/products/CSI_CS655': () => json(saved),
    'PATCH /admin/products/CSI_CS655': ({ body }) => {
      saved = detail({ product: { ...saved.product, name_en: body.product_name_en }, price_vnd: saved.price_vnd });
      return json(saved);
    },
    'PUT /admin/products/CSI_CS655/price': ({ body }) => {
      saved = { ...saved, price_vnd: body.price_vnd };
      return json(saved);
    },
  });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  fireEvent.click(await screen.findByRole('button', { name: /Sửa sản phẩm/ }));
  fireEvent.change(document.getElementById('field-product_name_en'), { target: { value: 'CS655 Reflectometer' } });
  fireEvent.change(document.getElementById('field-price_vnd'), { target: { value: '12.500.000' } });
  fireEvent.click(screen.getByRole('button', { name: /Lưu tất cả thay đổi/ }));

  expect(await screen.findByText('Đã lưu thông tin sản phẩm.')).toBeInTheDocument();
  expect(calls.find((c) => c.method === 'PATCH').body.product_name_en).toBe('CS655 Reflectometer');
  expect(calls.find((c) => c.method === 'PUT').body).toEqual({ price_vnd: 12500000 });
  expect(screen.getAllByText('CS655 Reflectometer').length).toBeGreaterThan(0);
  expect(screen.getByText(/12\.500\.000\s₫/)).toBeInTheDocument();
});

test('an unchanged price is not re-sent', async () => {
  const calls = mockFetch({
    'GET /admin/products/CSI_CS655': () => json(detail()),
    'PATCH /admin/products/CSI_CS655': () => json(detail()),
  });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  fireEvent.click(await screen.findByRole('button', { name: /Sửa sản phẩm/ }));
  fireEvent.click(screen.getByRole('button', { name: /Lưu tất cả thay đổi/ }));

  await screen.findByText('Đã lưu thông tin sản phẩm.');
  expect(calls.some((c) => c.method === 'PUT')).toBe(false);
});

test('server validation errors appear under the matching field', async () => {
  mockFetch({
    'GET /admin/products/CSI_CS655': () => json(detail()),
    'PATCH /admin/products/CSI_CS655': () =>
      json(
        {
          message: 'Request validation failed',
          errors: [
            { path: 'product_url', message: 'Only http(s) URLs are allowed' },
            { path: 'supported_protocols.0', message: 'String must contain at most 60 character(s)' },
            { path: '', message: "Unrecognized key(s) in object: 'foo'" },
          ],
        },
        400
      ),
  });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  fireEvent.click(await screen.findByRole('button', { name: /Sửa sản phẩm/ }));
  fireEvent.click(screen.getByRole('button', { name: /Lưu tất cả thay đổi/ }));

  const urlError = await screen.findByText('Only http(s) URLs are allowed');
  expect(urlError.previousSibling).toBe(document.getElementById('field-product_url'));
  expect(screen.getByText('String must contain at most 60 character(s)').previousSibling).toBe(
    document.getElementById('field-supported_protocols')
  );
  // An error with no matching input is listed in the banner
  expect(screen.getByText(/Dữ liệu không hợp lệ: Unrecognized key\(s\) in object: 'foo'/)).toBeInTheDocument();
});

test('an invalid price is caught before any request', async () => {
  const calls = mockFetch({ 'GET /admin/products/CSI_CS655': () => json(detail()) });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  fireEvent.click(await screen.findByRole('button', { name: /Sửa sản phẩm/ }));
  fireEvent.change(document.getElementById('field-price_vnd'), { target: { value: '-1' } });
  fireEvent.click(screen.getByRole('button', { name: /Lưu tất cả thay đổi/ }));

  expect(await screen.findByText('Giá phải là số nguyên VND (không âm).')).toBeInTheDocument();
  await waitFor(() => expect(calls).toHaveLength(1));
});

test('a 403 is shown instead of falling back to public data', async () => {
  mockFetch({ 'GET /admin/products/CSI_CS655': () => json({ message: 'Forbidden' }, 403) });
  render(<AdminProductDetailView productId="CSI_CS655" onBack={() => {}} />);

  expect(await screen.findByText('Bạn không có quyền thực hiện thao tác này.')).toBeInTheDocument();
});
