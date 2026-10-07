import { getApiBaseUrl } from '../services/http';

// Routes fetch() calls to handlers keyed by "METHOD /path" (path relative to the API base, query string
// ignored). A handler returns { status?, body? } or throws to simulate a network failure.
const API_PREFIX = new URL(getApiBaseUrl()).pathname.replace(/\/$/, '');

export function json(body, status = 200) {
  return { status, body };
}

export function mockFetch(routes) {
  const calls = [];
  global.fetch = jest.fn(async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const parsed = new URL(url);
    const path = parsed.pathname.slice(API_PREFIX.length);
    const body = options.body ? JSON.parse(options.body) : undefined;
    const call = { method, path, query: parsed.searchParams, headers: options.headers || {}, body };
    calls.push(call);
    const handler = routes[`${method} ${path}`];
    if (!handler) throw new Error(`Unexpected request ${method} ${path}`);
    const result = await handler(call);
    const status = result?.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null) },
      json: async () => result?.body ?? null,
      text: async () => JSON.stringify(result?.body ?? null),
    };
  });
  return calls;
}

export const ADMIN_USER = { id: 'u-admin', email: 'admin@reeco.vn', role: 'admin', full_name: 'REECO Administrator' };
export const CLIENT_USER = { id: 'u-client', email: 'haitran@example.com', role: 'client', full_name: 'Hai Tran' };

export function sessionFor(user, { expiresInSeconds = 3600, token = 'access-1', refresh = 'refresh-1' } = {}) {
  return {
    access_token: token,
    refresh_token: refresh,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    user,
  };
}

export function storeSession(session) {
  localStorage.setItem('reeco_admin_session', JSON.stringify(session));
}

export function makeOrder(overrides = {}) {
  return {
    id: '7d2a8a9e-0000-4000-8000-000000000001',
    order_number: 1001,
    order_code: 'REECO-1001',
    customer_id: 'u-client',
    status: 'PROCESSING',
    payment_method: 'cod',
    payment_status: 'COD_PENDING',
    shipping_method: 'standard',
    shipping_fee: 250000,
    subtotal: 13210000,
    total: 13460000,
    currency: 'VND',
    customer_name: 'Hai Tran',
    customer_email: 'haitran@example.com',
    customer_phone: '+84 908 123 456',
    shipping_address: '12 Nguyen Hue',
    city: 'Ho Chi Minh',
    province: 'HCM',
    country: 'Vietnam',
    postal_code: null,
    notes: null,
    created_at: '2026-10-06T08:00:00.000Z',
    updated_at: '2026-10-06T09:00:00.000Z',
    order_items: [
      {
        id: 1,
        order_id: '7d2a8a9e-0000-4000-8000-000000000001',
        product_id: 'CSI_CS655',
        model: 'CS655',
        product_name: 'Water Content Reflectometer',
        image_url: null,
        unit_price: 13210000,
        quantity: 1,
        line_total: 13210000,
      },
    ],
    order_status_history: [
      { id: 2, from_status: 'PENDING_PAYMENT', to_status: 'PROCESSING', note: 'COD', created_at: '2026-10-06T08:00:01.000Z' },
      { id: 1, from_status: null, to_status: 'PENDING_PAYMENT', note: null, created_at: '2026-10-06T08:00:00.000Z' },
    ],
    ...overrides,
  };
}
