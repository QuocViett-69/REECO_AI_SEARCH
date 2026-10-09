import { getStoredUser, loginAdminApi, setAdminProductPriceApi, triggerAdminImport, updateAdminProductApi } from './api';
import { ADMIN_USER, CLIENT_USER, json, mockFetch, sessionFor, storeSession } from '../test/fetchMock';

describe('loginAdminApi', () => {
  test('logs in through POST /auth/login and stores the session under reeco_admin_session', async () => {
    const calls = mockFetch({ 'POST /auth/login': () => json(sessionFor(ADMIN_USER, { token: 'tok' })) });

    const result = await loginAdminApi('admin@reeco.vn', 'ilovereeco');

    expect(calls[0].body).toEqual({ email: 'admin@reeco.vn', password: 'ilovereeco' });
    expect(calls[0].headers.Authorization).toBeUndefined();
    expect(result).toEqual({ success: true, user: ADMIN_USER });
    expect(JSON.parse(localStorage.getItem('reeco_admin_session')).access_token).toBe('tok');
    expect(getStoredUser()).toEqual(ADMIN_USER);
  });

  test('rejects a non-admin account without storing anything', async () => {
    mockFetch({ 'POST /auth/login': () => json(sessionFor(CLIENT_USER)) });

    const result = await loginAdminApi('haitran@example.com', 'ilovereeco');

    expect(result).toEqual({ success: false, message: 'Tài khoản không có quyền quản trị' });
    expect(localStorage.length).toBe(0);
  });

  test('wrong credentials', async () => {
    mockFetch({ 'POST /auth/login': () => json({ message: 'Invalid email or password' }, 401) });

    const result = await loginAdminApi('admin@reeco.vn', 'nope');

    expect(result).toEqual({ success: false, message: 'Email hoặc mật khẩu không hợp lệ.' });
    expect(localStorage.length).toBe(0);
  });

  test('a login 401 does not fire the session-expired flow', async () => {
    mockFetch({ 'POST /auth/login': () => json({ message: 'Invalid email or password' }, 401) });
    const listener = jest.fn();
    window.addEventListener('reeco:unauthorized', listener);

    await loginAdminApi('x@y.z', 'bad');

    window.removeEventListener('reeco:unauthorized', listener);
    expect(listener).not.toHaveBeenCalled();
  });

  test('API not reachable', async () => {
    mockFetch({
      'POST /auth/login': () => {
        throw new TypeError('Failed to fetch');
      },
    });

    const result = await loginAdminApi('admin@reeco.vn', 'ilovereeco');

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Không kết nối được tới máy chủ API/);
  });
});

describe('product and import calls', () => {
  beforeEach(() => storeSession(sessionFor(ADMIN_USER)));

  test('price goes to PUT /admin/products/:id/price', async () => {
    const calls = mockFetch({ 'PUT /admin/products/CSI_CS655/price': () => json({ product: {}, price_vnd: 9000000 }) });

    const result = await setAdminProductPriceApi('CSI_CS655', 9000000);

    expect(calls[0].body).toEqual({ price_vnd: 9000000 });
    expect(result.price_vnd).toBe(9000000);
  });

  test('validation errors come back as { error: "validation", fieldErrors }', async () => {
    mockFetch({
      'PATCH /admin/products/CSI_CS655': () =>
        json({ message: 'Request validation failed', errors: [{ path: 'price_vnd', message: 'Required' }] }, 400),
    });

    const result = await updateAdminProductApi('CSI_CS655', {});

    expect(result.error).toBe('validation');
    expect(result.fieldErrors).toEqual({ price_vnd: 'Required' });
  });

  test('demo import reports the read-only restriction', async () => {
    mockFetch({ 'POST /admin/import': () => json({ message: 'Demo catalog is read-only' }, 403) });
    const result = await triggerAdminImport();
    expect(result.error).toBe('forbidden');
    expect(result.success).not.toBe(true);
  });
});
