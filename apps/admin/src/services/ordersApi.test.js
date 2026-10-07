import { ORDER_STATUS_TRANSITIONS, ORDER_STATUSES, formatVnd, listOrders, normalizeOrder, updateOrderStatus } from './ordersApi';
import { ADMIN_USER, json, makeOrder, mockFetch, sessionFor, storeSession } from '../test/fetchMock';

test('ORDER_STATUS_TRANSITIONS matches @reeco/shared', () => {
  // Built by `npm run build:shared`; the API enforces the shared table, so the admin copy must not drift.
  const shared = require('@reeco/shared');
  expect(ORDER_STATUS_TRANSITIONS).toEqual(shared.ORDER_STATUS_TRANSITIONS);
  expect(Object.keys(ORDER_STATUSES).sort()).toEqual(Object.keys(shared.ORDER_STATUS_TRANSITIONS).sort());
});

test('formatVnd uses vi-VN grouping and the đồng sign', () => {
  // Intl puts a no-break space before ₫
  const plain = (value) => formatVnd(value).replace(/\s/g, ' ');
  expect(plain(13460000)).toBe('13.460.000 ₫');
  expect(plain(0)).toBe('0 ₫');
  expect(formatVnd(undefined)).toBe('—');
});

test('normalizeOrder exposes items and an oldest-first history', () => {
  const order = normalizeOrder(makeOrder());
  expect(order.items).toHaveLength(1);
  expect(order.history.map((h) => h.status)).toEqual(['PENDING_PAYMENT', 'PROCESSING']);
  expect(order.history[1].from_status).toBe('PENDING_PAYMENT');
});

test('listOrders sends search, status and paging; ALL means no status filter', async () => {
  storeSession(sessionFor(ADMIN_USER));
  const calls = mockFetch({ 'GET /admin/orders': () => json({ items: [makeOrder()], total: 41 }) });

  const result = await listOrders({ search: ' hai ', status: 'SHIPPED', page: 3, pageSize: 20 });
  await listOrders({ status: 'ALL' });

  expect(Object.fromEntries(calls[0].query)).toEqual({ search: 'hai', status: 'SHIPPED', page: '3', page_size: '20' });
  expect(calls[1].query.has('status')).toBe(false);
  expect(result.total).toBe(41);
  expect(result.items[0].order_code).toBe('REECO-1001');
});

test('updateOrderStatus omits an empty note', async () => {
  storeSession(sessionFor(ADMIN_USER));
  const calls = mockFetch({ 'PATCH /admin/orders/REECO-1001/status': () => json(makeOrder({ status: 'SHIPPED' })) });

  await updateOrderStatus('REECO-1001', 'SHIPPED', '   ');
  await updateOrderStatus('REECO-1001', 'SHIPPED', ' VN123 ');

  expect(calls[0].body).toEqual({ status: 'SHIPPED' });
  expect(calls[1].body).toEqual({ status: 'SHIPPED', note: 'VN123' });
});
