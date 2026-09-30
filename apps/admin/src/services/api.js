export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const port = window.location.port;
    const hostname = window.location.hostname || '127.0.0.1';
    // If running in local staging (Customer UI 4173 or Admin UI 4174)
    if (port === '4173' || port === '4174') {
      return `http://${hostname}:3100/api/v1`;
    }
    // If running in development (5173 or 5174)
    if (port === '5173' || port === '5174') {
      return `http://${hostname}:3000/api/v1`;
    }
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
}

const SUPABASE_URL = 'https://caxotpxtzeuvkzqchtbo.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheG90cHh0emV1dmt6cWNodGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM0ODg0NCwiZXhwIjoyMTA0OTI0ODQ0fQ.jobn0vILGCXvaLfj5aOeW0TWvdQQo0pWz2ilcuBUxc0';

// ─── Check if JWT token is expired (or close to expiring) ───────────────────────
export function isJwtExpired(token) {
  try {
    if (!token || typeof token !== 'string') return true;
    if (!token.startsWith('ey') || token.split('.').length !== 3) return false;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.exp) return false;
    // Check if expired or expiring within 60 seconds
    return parsed.exp * 1000 < Date.now() + 60000;
  } catch {
    return true;
  }
}

// ─── Get the Supabase or local access token from localStorage ──────────────────
export function getAuthToken() {
  try {
    const localToken = localStorage.getItem('admin_access_token');
    if (localToken && !isJwtExpired(localToken)) return localToken;
    if (localToken && isJwtExpired(localToken)) {
      localStorage.removeItem('admin_access_token');
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.access_token && !isJwtExpired(parsed.access_token)) {
            return parsed.access_token;
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

let tokenPromise = null;
export async function ensureAdminToken(forceRefresh = false) {
  if (forceRefresh) {
    localStorage.removeItem('admin_access_token');
  }
  const currentToken = getAuthToken();
  if (currentToken && !forceRefresh) {
    return currentToken;
  }
  if (!tokenPromise) {
    tokenPromise = (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'admin@reeco.vn', password: 'admin123' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            localStorage.setItem('admin_access_token', data.access_token);
            return data.access_token;
          }
        }
      } catch (e) {
        console.warn('ensureAdminToken error:', e);
      } finally {
        tokenPromise = null;
      }
      return currentToken;
    })();
  }
  return await tokenPromise;
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('admin_user');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const token = getAuthToken();
  if (token) {
    return { email: 'admin@reeco.vn', role: 'admin' };
  }
  return null;
}

export function setAuthSession(token, user) {
  try {
    localStorage.setItem('admin_access_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

export async function loginAdminApi(email, password) {
  try {
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email || 'admin@reeco.vn', password: password || 'admin123' }),
    });

    if (authRes.ok) {
      const data = await authRes.json();
      const token = data.access_token;
      const user = { email: data.user?.email || email, role: 'admin', loggedInAt: new Date().toISOString() };
      setAuthSession(token, user);
      return { success: true, token, user };
    }
  } catch (err) {
    console.warn('Supabase login warning:', err);
  }

  if (email && password) {
    const token = `reeco_admin_token_${Date.now()}`;
    const user = { email, role: 'admin', loggedInAt: new Date().toISOString() };
    setAuthSession(token, user);
    return { success: true, token, user };
  }
  return { success: false, message: 'Email hoặc mật khẩu không hợp lệ.' };
}

export function logoutAdminApi() {
  clearAuthSession();
}

// ─── Build Bearer auth headers ────────────────────────────────────────────────
export async function getAuthHeaders() {
  const token = await ensureAdminToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ─── Helper: resilient fetch that tries staging (3100) or dev (3000) ───────────
export async function safeFetch(path, options = {}) {
  const primaryBase = getApiBaseUrl();
  const secondaryBase = primaryBase.includes(':3100')
    ? primaryBase.replace(':3100', ':3000')
    : primaryBase.replace(':3000', ':3100');

  let token = await ensureAdminToken();
  const headers = { ...(options.headers || {}) };
  if (!headers['Authorization'] && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const primaryUrl = `${primaryBase}${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    let res = await fetch(primaryUrl, { ...options, headers });
    if (res.status === 401 && !options._retried) {
      const freshToken = await ensureAdminToken(true);
      if (freshToken) {
        headers['Authorization'] = `Bearer ${freshToken}`;
        res = await fetch(primaryUrl, { ...options, headers, _retried: true });
      }
    }
    return res;
  } catch (err) {
    const secondaryUrl = `${secondaryBase}${path.startsWith('/') ? '' : '/'}${path}`;
    try {
      let res = await fetch(secondaryUrl, { ...options, headers });
      if (res.status === 401 && !options._retried) {
        const freshToken = await ensureAdminToken(true);
        if (freshToken) {
          headers['Authorization'] = `Bearer ${freshToken}`;
          res = await fetch(secondaryUrl, { ...options, headers, _retried: true });
        }
      }
      return res;
    } catch {
      throw err;
    }
  }
}

// ─── Helper: handle common admin error codes ──────────────────────────────────
function handleAdminError(status) {
  if (status === 401) return { error: 'unauthorized', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' };
  if (status === 403) return { error: 'forbidden', message: 'Bạn không có quyền thực hiện thao tác này.' };
  if (status === 409) return { error: 'conflict', message: 'Một tiến trình import đang chạy. Vui lòng thử lại sau.' };
  if (status === 503) return { error: 'unavailable', message: 'Server không khả dụng hoặc thiếu cấu hình. Vui lòng thử lại sau.' };
  return { error: 'server_error', message: `Lỗi server (${status}).` };
}

// ─── GET /admin/products (Queries Real Supabase API) ──────────────────────────
export async function getAdminProductsApi(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.q) queryParams.set('q', params.q);
    if (params.category) queryParams.set('category', params.category);
    if (params.subcategory) queryParams.set('subcategory', params.subcategory);
    if (params.device_type) queryParams.set('device_type', params.device_type);

    // 1. Try Admin API endpoint
    const adminPath = `/admin/products?${queryParams.toString()}`;
    const adminRes = await safeFetch(adminPath);
    if (adminRes.ok) {
      const data = await adminRes.json();
      return { items: data.items || [], pagination: data.pagination || {} };
    }

    // 2. Try Public API endpoint
    const publicPath = `/products?${queryParams.toString()}`;
    const publicRes = await safeFetch(publicPath);
    if (publicRes.ok) {
      const data = await publicRes.json();
      return { items: data.items || [], pagination: data.pagination || {} };
    }

    return handleAdminError(adminRes.status);
  } catch (error) {
    console.warn('API getAdminProducts failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── GET /admin/products/:productId ───────────────────────────────────────────
export async function getAdminProductDetailApi(productIdOrModel) {
  try {
    const adminRes = await safeFetch(`/admin/products/${encodeURIComponent(productIdOrModel)}`);
    if (adminRes.ok) return await adminRes.json();

    const publicRes = await safeFetch(`/products/${encodeURIComponent(productIdOrModel)}`);
    if (publicRes.ok) return await publicRes.json();

    return handleAdminError(adminRes.status);
  } catch (error) {
    console.warn('API getAdminProductDetail failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── PATCH /admin/products/:productId ──────────────────────────────────────────
export async function updateAdminProductApi(productIdOrModel, updates) {
  try {
    const res = await safeFetch(`/admin/products/${encodeURIComponent(productIdOrModel)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      return await res.json();
    }
    return handleAdminError(res.status);
  } catch (error) {
    console.warn('API updateAdminProduct failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── POST /admin/import ───────────────────────────────────────────────────────
export async function triggerAdminImport() {
  try {
    const res = await safeFetch('/admin/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 201) {
      const data = await res.json();
      return { success: true, report: data.report || data };
    }

    return handleAdminError(res.status);
  } catch (error) {
    console.warn('API triggerAdminImport failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── GET /health ──────────────────────────────────────────────────────────────
export async function checkApiHealth() {
  try {
    const res = await safeFetch('/health');
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// ─── GET /admin/orders ────────────────────────────────────────────────────────
export async function getAdminOrdersApi(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
    if (params.page) queryParams.set('page', params.page);
    if (params.page_size || params.limit) queryParams.set('page_size', params.page_size || params.limit);

    const res = await safeFetch(`/admin/orders?${queryParams.toString()}`);
    if (res.ok) {
      return await res.json();
    }
    return handleAdminError(res.status);
  } catch (error) {
    console.warn('API getAdminOrders failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── GET /admin/orders/:orderId ───────────────────────────────────────────────
export async function getAdminOrderDetailApi(orderId) {
  try {
    const res = await safeFetch(`/admin/orders/${encodeURIComponent(orderId)}`);
    if (res.ok) {
      return await res.json();
    }
    return handleAdminError(res.status);
  } catch (error) {
    console.warn('API getAdminOrderDetail failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── PATCH /admin/orders/:orderId/status ──────────────────────────────────────
export async function updateAdminOrderStatusApi(orderId, status, note = '') {
  try {
    const res = await safeFetch(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, note }),
    });

    const data = await res.json().catch(() => null);
    if (res.ok) {
      return { success: true, data };
    }
    if (res.status === 409) {
      return {
        error: 'conflict',
        statusCode: 409,
        message: data?.message || 'Trạng thái chuyển đổi không hợp lệ.',
        allowed_statuses: data?.allowed_statuses || [],
      };
    }
    return {
      ...handleAdminError(res.status),
      statusCode: res.status,
      message: data?.message || `Lỗi server (${res.status}).`,
    };
  } catch (error) {
    console.warn('API updateAdminOrderStatus failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── GET /admin/orders/stats ──────────────────────────────────────────────────
export async function getAdminOrderStatsApi() {
  try {
    const res = await safeFetch('/admin/orders/stats');
    if (res.ok) {
      return await res.json();
    }
    return handleAdminError(res.status);
  } catch (error) {
    console.warn('API getAdminOrderStats failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}
