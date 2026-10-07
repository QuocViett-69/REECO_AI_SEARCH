import { apiFetch, ApiError, getSession, UNAUTHORIZED_EVENT } from './http';
import { ADMIN_USER, CLIENT_USER, json, mockFetch, sessionFor, storeSession } from '../test/fetchMock';

describe('apiFetch', () => {
  test('sends the stored admin access token', async () => {
    storeSession(sessionFor(ADMIN_USER, { token: 'tok-A' }));
    const calls = mockFetch({ 'GET /admin/products': () => json({ items: [] }) });

    await apiFetch('/admin/products');

    expect(calls[0].headers.Authorization).toBe('Bearer tok-A');
  });

  test('refreshes a token that is about to expire before the request', async () => {
    storeSession(sessionFor(ADMIN_USER, { token: 'old', refresh: 'r-old', expiresInSeconds: 10 }));
    const calls = mockFetch({
      'POST /auth/refresh': ({ body }) => {
        expect(body).toEqual({ refresh_token: 'r-old' });
        return json(sessionFor(ADMIN_USER, { token: 'new', refresh: 'r-new' }));
      },
      'GET /admin/orders': () => json({ items: [], total: 0 }),
    });

    await apiFetch('/admin/orders');

    expect(calls.map((c) => c.path)).toEqual(['/auth/refresh', '/admin/orders']);
    expect(calls[1].headers.Authorization).toBe('Bearer new');
    expect(getSession().refresh_token).toBe('r-new');
  });

  test('retries once with a refreshed token after a 401', async () => {
    storeSession(sessionFor(ADMIN_USER, { token: 'revoked' }));
    let attempts = 0;
    const calls = mockFetch({
      'GET /admin/orders/stats': ({ headers }) => {
        attempts += 1;
        return headers.Authorization === 'Bearer fresh' ? json({ totalOrders: 3 }) : json({ message: 'x' }, 401);
      },
      'POST /auth/refresh': () => json(sessionFor(ADMIN_USER, { token: 'fresh' })),
    });

    await expect(apiFetch('/admin/orders/stats')).resolves.toEqual({ totalOrders: 3 });
    expect(attempts).toBe(2);
    expect(calls.filter((c) => c.path === '/auth/refresh')).toHaveLength(1);
  });

  test('clears the session and fires reeco:unauthorized when the refresh token is rejected', async () => {
    storeSession(sessionFor(ADMIN_USER));
    mockFetch({
      'GET /admin/products': () => json({ message: 'Unauthorized' }, 401),
      'POST /auth/refresh': () => json({ message: 'Invalid refresh token' }, 401),
    });
    const listener = jest.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    await expect(apiFetch('/admin/products')).rejects.toMatchObject({ status: 401 });

    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('reeco_admin_session')).toBeNull();
  });

  test('a refreshed session that is no longer admin is not kept', async () => {
    storeSession(sessionFor(ADMIN_USER, { expiresInSeconds: 5 }));
    mockFetch({ 'POST /auth/refresh': () => json(sessionFor(CLIENT_USER)) });

    await expect(apiFetch('/admin/products')).rejects.toMatchObject({ status: 401 });
    expect(getSession()).toBeNull();
  });

  test('a 403 surfaces as an error and keeps the session', async () => {
    storeSession(sessionFor(ADMIN_USER));
    mockFetch({ 'GET /admin/products': () => json({ message: 'Forbidden' }, 403) });

    const error = await apiFetch('/admin/products').catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(403);
    expect(error.message).toBe('Bạn không có quyền thực hiện thao tác này.');
    expect(getSession()).not.toBeNull();
  });

  test('turns ZodValidationPipe issues into per-field errors', async () => {
    storeSession(sessionFor(ADMIN_USER));
    mockFetch({
      'PATCH /admin/products/CS655': () =>
        json(
          {
            message: 'Request validation failed',
            errors: [
              { path: 'product_url', message: 'Invalid url' },
              { path: '', message: "Unrecognized key(s) in object: 'foo'" },
            ],
          },
          400
        ),
    });

    const error = await apiFetch('/admin/products/CS655', { method: 'PATCH', body: { foo: 1 } }).catch((err) => err);

    expect(error.status).toBe(400);
    expect(error.message).toBe('Request validation failed');
    expect(error.fieldErrors).toEqual({ product_url: 'Invalid url', _: "Unrecognized key(s) in object: 'foo'" });
  });

  test('network failures become ApiError with status 0', async () => {
    mockFetch({
      'GET /health': () => {
        throw new TypeError('Failed to fetch');
      },
    });

    await expect(apiFetch('/health', { auth: false })).rejects.toMatchObject({ status: 0 });
  });
});
