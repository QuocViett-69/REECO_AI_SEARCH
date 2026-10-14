import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { App } from './App';
import { UNAUTHORIZED_EVENT } from './services/http';
import { ADMIN_USER, CLIENT_USER, json, makeOrder, mockFetch, sessionFor, storeSession } from './test/fetchMock';

const STATS = {
  totalOrders: 4,
  totalRevenue: 26920000,
  paidOrdersCount: 2,
  averageOrderValue: 13460000,
  processingCount: 1,
  shippedCount: 1,
  deliveredCount: 1,
  pendingCount: 1,
  cancelledCount: 0,
  ordersByStatus: { PENDING_PAYMENT: 1, PROCESSING: 1, SHIPPED: 1, DELIVERED: 1 },
  vnpayRevenue: 0,
  codRevenue: 26920000,
  dailyRevenueMap: {},
  topProducts: [],
};

function adminRoutes(overrides = {}) {
  return {
    'POST /auth/login': ({ body }) =>
      body.email === 'admin@reeco.vn' && body.password === 'ilovereeco'
        ? json(sessionFor(ADMIN_USER))
        : body.email === 'haitran@example.com' && body.password === 'ilovereeco'
          ? json(sessionFor(CLIENT_USER))
          : json({ message: 'Invalid email or password' }, 401),
    'GET /admin/products': () => json({ items: [], pagination: {} }),
    'GET /admin/orders/stats': () => json(STATS),
    'GET /admin/orders': () => json({ items: [makeOrder()], total: 1 }),
    'GET /admin/orders/REECO-1001': () => json(makeOrder()),
    'GET /health': () => json({ status: 'ok' }),
    ...overrides,
  };
}

let currentLocation;
function LocationProbe() {
  currentLocation = useLocation();
  return null;
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>
  );
}

async function login(email, password) {
  fireEvent.change(screen.getByPlaceholderText('admin@reeco.vn'), { target: { value: email } });
  fireEvent.change(document.querySelector('input[type="password"]'), { target: { value: password } });
  fireEvent.submit(document.querySelector('form'));
}

describe('routing and auth', () => {
  test('an unauthenticated visit goes to /login and returns to the requested page after login', async () => {
    mockFetch(adminRoutes());
    renderAt('/orders?status=SHIPPED');

    expect(currentLocation.pathname).toBe('/login');
    await login('admin@reeco.vn', 'ilovereeco');

    await waitFor(() => expect(currentLocation.pathname).toBe('/orders'));
    expect(currentLocation.search).toBe('?status=SHIPPED');
    expect(JSON.parse(localStorage.getItem('reeco_admin_session')).user.role).toBe('admin');
  });

  test('a customer account is refused and no session is stored', async () => {
    mockFetch(adminRoutes());
    renderAt('/');

    await login('haitran@example.com', 'ilovereeco');

    expect(await screen.findByText('Tài khoản không có quyền quản trị')).toBeInTheDocument();
    expect(currentLocation.pathname).toBe('/login');
    expect(localStorage.getItem('reeco_admin_session')).toBeNull();
  });

  test('a made-up account is refused', async () => {
    mockFetch(adminRoutes());
    renderAt('/');

    await login('random@example.com', 'whatever');

    expect(await screen.findByText('Email hoặc mật khẩu không hợp lệ.')).toBeInTheDocument();
    expect(localStorage.getItem('reeco_admin_session')).toBeNull();
  });

  test.each([
    ['/', 'Dashboard'],
    ['/products', 'Products'],
    ['/products/CSI_CS655', 'Products'],
    ['/orders', 'Orders'],
    ['/orders/REECO-1001', 'Orders'],
  ])('a reload on %s stays there and highlights %s', async (path, navLabel) => {
    storeSession(sessionFor(ADMIN_USER));
    mockFetch(
      adminRoutes({
        'GET /admin/products/CSI_CS655': () => json({ product: { product_id: 'CSI_CS655', model: 'CS655', status: 'active' }, price_vnd: null }),
      })
    );
    renderAt(path);

    expect(currentLocation.pathname).toBe(path);
    const active = await screen.findByRole('link', { name: navLabel });
    expect(active).toHaveClass('active');
    expect(document.querySelectorAll('.nav-item.active')).toHaveLength(1);
  });

  test('import is hidden and its old URL redirects to products', async () => {
    storeSession(sessionFor(ADMIN_USER));
    mockFetch(adminRoutes());
    renderAt('/import');
    await waitFor(() => expect(currentLocation.pathname).toBe('/products'));
    expect(screen.queryByRole('link', { name: 'Import' })).not.toBeInTheDocument();
  });

  test('reeco:unauthorized signs out to /login', async () => {
    storeSession(sessionFor(ADMIN_USER));
    mockFetch(adminRoutes());
    renderAt('/orders');
    await screen.findByText('REECO-1001', { selector: 'a' });

    localStorage.removeItem('reeco_admin_session');
    act(() => {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    });

    await waitFor(() => expect(currentLocation.pathname).toBe('/login'));
    expect(await screen.findByText('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')).toBeInTheDocument();
  });

  test('a 401 from the products list (expired refresh token) ends at /login', async () => {
    storeSession(sessionFor(ADMIN_USER));
    mockFetch(
      adminRoutes({
        'GET /admin/products': () => json({ message: 'Unauthorized' }, 401),
        'GET /admin/orders/stats': () => json({ message: 'Unauthorized' }, 401),
        'GET /admin/orders': () => json({ message: 'Unauthorized' }, 401),
        'POST /auth/refresh': () => json({ message: 'Invalid refresh token' }, 401),
      })
    );
    renderAt('/products');

    await waitFor(() => expect(currentLocation.pathname).toBe('/login'));
  });
});

describe('dashboard', () => {
  test('shows order stats in VND, per-status counts and the latest orders', async () => {
    storeSession(sessionFor(ADMIN_USER));
    const calls = mockFetch(adminRoutes());
    renderAt('/');

    await waitFor(() => expect(screen.getByText('Total Revenue').nextSibling).toHaveTextContent(/26\.920\.000\s₫/));
    expect(screen.getByText('Total Orders').nextSibling).toHaveTextContent('4');
    expect(screen.getByText('Pending Payment').nextSibling).toHaveTextContent('1');
    expect(screen.getByText('Processing Orders').nextSibling).toHaveTextContent('1');
    expect(screen.getByText('Delivered Orders').nextSibling).toHaveTextContent('1');
    expect(screen.getByText('5 đơn mới nhất')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'REECO-1001' });
    expect(link).toHaveAttribute('href', '/orders/REECO-1001');
    const recent = calls.find((c) => c.path === '/admin/orders');
    expect(recent.query.get('page_size')).toBe('5');
    // ordersByStatus drives the overview cards (FORWARDED is 0, SHIPPED is 1)
    expect(screen.getByText('Đã chuyển hãng').nextSibling).toHaveTextContent('0 đơn');
    expect(screen.getByText('Đang vận chuyển').nextSibling).toHaveTextContent('1 đơn');
  });
});

test('products list and KPIs cover every page of the catalog, not just the first 100', async () => {
  storeSession(sessionFor(ADMIN_USER));
  const item = (n) => ({ product_id: `P${n}`, model: `M${n}`, name_en: `Product ${n}`, status: 'active' });
  const calls = mockFetch(
    adminRoutes({
      'GET /admin/products': ({ query }) =>
        query.get('page') === '2'
          ? json({ items: [item(101)], pagination: { page: 2, limit: 100, total: 101, total_pages: 2 } })
          : json({ items: Array.from({ length: 100 }, (_, i) => item(i + 1)), pagination: { page: 1, limit: 100, total: 101, total_pages: 2 } }),
    })
  );
  renderAt('/dashboard');

  await waitFor(() => expect(calls.filter((c) => c.path === '/admin/products')).toHaveLength(2));
  expect(await screen.findAllByText('101')).not.toHaveLength(0);
});

test('reports show an error with retry when stats fail, and no fabricated growth figure', async () => {
  storeSession(sessionFor(ADMIN_USER));
  let fail = true;
  mockFetch(adminRoutes({ 'GET /admin/orders/stats': () => (fail ? json({ message: 'Service Unavailable' }, 503) : json(STATS)) }));
  renderAt('/reports');

  const retry = await screen.findByRole('button', { name: 'Thử lại' });
  fail = false;
  fireEvent.click(retry);
  expect(await screen.findByText('Tổng doanh thu đã thu')).toBeInTheDocument();
  expect(screen.queryByText(/so với kỳ trước/)).not.toBeInTheDocument();
});
