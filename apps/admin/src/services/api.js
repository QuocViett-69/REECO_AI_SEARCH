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

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// ─── Check if JWT token is expired (or close to expiring) ───────────────────────
export function isJwtExpired(token) {
  try {
    if (!token || typeof token !== 'string') return true;
    // Admin sessions are always Supabase JWTs; anything else is not a usable token.
    if (!token.startsWith('ey') || token.split('.').length !== 3) return true;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.exp) return true;
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

export async function ensureAdminToken(forceRefresh = false) {
  if (forceRefresh) localStorage.removeItem('admin_access_token');
  return getAuthToken();
}

// The stored profile only counts while its session token is still valid.
export function getStoredUser() {
  if (!getAuthToken()) {
    clearAuthSession();
    return null;
  }
  try {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const missing = [
      !SUPABASE_URL && 'REACT_APP_SUPABASE_URL',
      !SUPABASE_ANON_KEY && 'REACT_APP_SUPABASE_ANON_KEY',
    ].filter(Boolean);
    return {
      success: false,
      message: `Thiếu cấu hình Supabase: ${missing.join(', ')}. Thêm vào apps/admin/.env.local rồi khởi động lại app.`,
    };
  }

  let authRes;
  try {
    authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    console.warn('Supabase login warning:', err);
    return { success: false, message: 'Không kết nối được tới Supabase. Kiểm tra mạng và REACT_APP_SUPABASE_URL.' };
  }

  const data = await authRes.json().catch(() => ({}));

  if (authRes.ok) {
    if (!data.access_token || data.user?.app_metadata?.role !== 'admin') {
      return { success: false, message: 'Tài khoản không có quyền quản trị.' };
    }
    const token = data.access_token;
    const user = { email: data.user?.email || email, role: 'admin', loggedInAt: new Date().toISOString() };
    setAuthSession(token, user);
    return { success: true, token, user };
  }

  const detail = data.error_code || data.msg || data.message || data.error_description || data.error || '';
  console.warn('Supabase login failed:', authRes.status, detail);

  if (data.error_code === 'invalid_credentials') {
    return { success: false, message: 'Email hoặc mật khẩu không hợp lệ.' };
  }
  if (data.error_code === 'email_not_confirmed') {
    return { success: false, message: 'Email chưa được xác nhận.' };
  }
  if (authRes.status === 401 || /api key/i.test(detail)) {
    return {
      success: false,
      message: 'Supabase từ chối API key. Kiểm tra REACT_APP_SUPABASE_ANON_KEY có đúng project với REACT_APP_SUPABASE_URL.',
    };
  }
  return { success: false, message: `Đăng nhập thất bại (${authRes.status}${detail ? `: ${detail}` : ''}).` };
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

  // There is no refresh token flow: a 401 is returned to the caller, which signs out.
  const token = await ensureAdminToken();
  const headers = { ...(options.headers || {}) };
  if (!headers['Authorization'] && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const primaryUrl = `${primaryBase}${path.startsWith('/') ? '' : '/'}${path}`;
  try {
    return await fetch(primaryUrl, { ...options, headers });
  } catch (err) {
    // Network failure only: try the other local API port (dev 3000 / staging 3100)
    const secondaryUrl = `${secondaryBase}${path.startsWith('/') ? '' : '/'}${path}`;
    try {
      return await fetch(secondaryUrl, { ...options, headers });
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

    // Admin data only. Falling back to the public catalog would hide 401/403 and show
    // public rows (active products only) as if they were the admin view.
    const adminRes = await safeFetch(`/admin/products?${queryParams.toString()}`);
    if (adminRes.ok) {
      const data = await adminRes.json();
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

    if (res.ok) {
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
