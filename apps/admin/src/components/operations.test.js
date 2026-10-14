import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DataQualityView } from './quality/DataQualityView';
import { PaymentOperationsView } from './payments/PaymentOperationsView';
import { ClientOperationsView } from './clients/ClientOperationsView';
import { ADMIN_USER, json, mockFetch, sessionFor, storeSession } from '../test/fetchMock';

beforeEach(() => storeSession(sessionFor(ADMIN_USER)));

const qualityProduct = (overrides = {}) => ({
  product_id: 'CSI_A',
  model: 'A',
  name: 'Sensor A',
  category: 'Sensors',
  status: 'active',
  missing_fields: [],
  needs_review: false,
  data_quality_score: 100,
  ...overrides,
});

const qualityResponse = {
  stats: {
    totalProducts: 3,
    needsReview: 1,
    missingViName: 1,
    missingEnName: 1,
    missingPrice: 0,
    missingImage: 0,
    missingStructuredSpecs: 0,
    searchIndexHealth: { staleSearchDocument: 2, staleEmbedding: 0, missingSemanticEnrichment: 0, status: 'degraded' },
  },
  products: [
    qualityProduct(),
    // Only the EN name is missing: listed as a gap, but not "needs review"
    qualityProduct({ product_id: 'CSI_B', model: 'B', name: 'Sensor B', missing_fields: ['Missing EN Name'], data_quality_score: 80 }),
    qualityProduct({ product_id: 'CSI_C', model: 'C', name: 'Sensor C', category: null, missing_fields: ['Missing VI Name'], needs_review: true, data_quality_score: 85 }),
  ],
};

describe('DataQualityView', () => {
  test('loads everything from one request and shows the real search health', async () => {
    const calls = mockFetch({ 'GET /admin/quality': () => json(qualityResponse) });
    render(<DataQualityView onSelectProduct={() => {}} />);

    expect(await screen.findByText('Sensor C')).toBeInTheDocument();
    expect(calls).toHaveLength(1);
    expect(screen.getByText('Sync Health: Cần đồng bộ')).toBeInTheDocument();
    expect(screen.getByText('2 tài liệu')).toBeInTheDocument();
    expect(screen.queryByText(/tài liệu chính thức/i)).toBeNull();
    expect(screen.getByText('—')).toBeInTheDocument(); // missing category is shown as missing
  });

  test('the "needs review" filter lists exactly the products counted in the KPI', async () => {
    mockFetch({ 'GET /admin/quality': () => json(qualityResponse) });
    render(<DataQualityView onSelectProduct={() => {}} />);
    await screen.findByText('Sensor C');

    fireEvent.click(screen.getByRole('button', { name: 'Cần xem xét / Có lỗi' }));
    expect(screen.getByText('Sensor C')).toBeInTheDocument();
    expect(screen.queryByText('Sensor A')).toBeNull();
    expect(screen.queryByText('Sensor B')).toBeNull();
  });

  test('shows the API error instead of an empty page', async () => {
    mockFetch({ 'GET /admin/quality': () => json({ message: 'down' }, 503) });
    render(<DataQualityView onSelectProduct={() => {}} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Server không khả dụng/);
  });
});

const payment = (overrides = {}) => ({
  id: 'o-1',
  order_code: 'REECO-1001',
  customer_name: 'Hai Tran',
  customer_email: 'hai@example.com',
  payment_method: 'vnpay',
  payment_status: 'PAID',
  total: 1000000,
  currency: 'VND',
  created_at: '2026-10-01T03:00:00Z',
  ...overrides,
});
const paymentStats = { totalPayments: 45, vnpayCount: 30, codCount: 15, paidCount: 20, pendingCount: 20, failedCount: 5 };

describe('PaymentOperationsView', () => {
  test('sends API enum values, omits "all" filters and pages through results', async () => {
    const calls = mockFetch({
      'GET /admin/payments': () => json({ items: [payment()], total: 45, stats: paymentStats }),
    });
    render(<PaymentOperationsView />);
    await screen.findByText('#REECO-1001');
    expect(calls[0].query.get('method')).toBeNull();
    expect(calls[0].query.get('status')).toBeNull();
    expect(calls[0].query.get('page')).toBe('1');
    expect(screen.getByText('Trang 1 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    await waitFor(() => expect(calls.at(-1).query.get('page')).toBe('2'));

    // A filter change goes back to page 1 and uses the lowercase API value
    fireEvent.click(screen.getByRole('button', { name: 'Cổng VNPay' }));
    await waitFor(() => expect(calls.at(-1).query.get('method')).toBe('vnpay'));
    expect(calls.at(-1).query.get('page')).toBe('1');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'COD_PENDING' } });
    await waitFor(() => expect(calls.at(-1).query.get('status')).toBe('COD_PENDING'));
    expect(screen.queryByRole('option', { name: /\(PENDING\)/ })).toBeNull();
  });

  test('a slow earlier response does not overwrite newer results', async () => {
    let releaseFirst;
    const firstResponse = new Promise((resolve) => {
      releaseFirst = resolve;
    });
    mockFetch({
      'GET /admin/payments': async ({ query }) => {
        if (!query.get('search')) {
          await firstResponse;
          return json({ items: [payment({ id: 'old', order_code: 'OLD-1' })], total: 1, stats: paymentStats });
        }
        return json({ items: [payment()], total: 1, stats: paymentStats });
      },
    });
    render(<PaymentOperationsView />);
    // Let the first (unfiltered) request start before searching
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByPlaceholderText('Tìm theo mã đơn, TxnRef...'), { target: { value: 'REECO' } });
    await screen.findByText('#REECO-1001');

    releaseFirst();
    await act(async () => {});
    expect(screen.queryByText('#OLD-1')).toBeNull();
  });

  test('shows the API error instead of an empty table', async () => {
    mockFetch({ 'GET /admin/payments': () => json({ message: 'down' }, 503) });
    render(<PaymentOperationsView />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Server không khả dụng/);
  });
});

describe('ClientOperationsView', () => {
  test('lists clients and shows the API error when loading fails', async () => {
    mockFetch({
      'GET /admin/clients': () =>
        json([{ id: 'c1', name: 'Hai Tran', email: 'hai@example.com', phone: '0900', orders_count: 2, total_spent: 5, last_order_date: '2026-10-01T00:00:00Z', active_orders_count: 1 }]),
    });
    const { unmount } = render(<ClientOperationsView />);
    expect(await screen.findByText('Hai Tran')).toBeInTheDocument();
    unmount();

    mockFetch({ 'GET /admin/clients': () => json({ message: 'down' }, 503) });
    render(<ClientOperationsView />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Server không khả dụng/);
  });
});
