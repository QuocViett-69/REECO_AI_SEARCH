const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// ─── Get the Supabase or local access token from localStorage ──────────────────
export function getAuthToken() {
  try {
    const localToken = localStorage.getItem('admin_access_token');
    if (localToken) return localToken;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed?.access_token || null;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
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
function authHeaders() {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
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
    const adminUrl = `${API_BASE_URL}/admin/products?${queryParams.toString()}`;
    const adminRes = await fetch(adminUrl, {
      headers: { ...authHeaders() },
    });

    if (adminRes.ok) {
      const data = await adminRes.json();
      return { items: data.items || [], pagination: data.pagination || {} };
    }

    // 2. Try Public API endpoint (queries real Supabase Database)
    const publicUrl = `${API_BASE_URL}/products?${queryParams.toString()}`;
    const publicRes = await fetch(publicUrl);
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
    const adminRes = await fetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(productIdOrModel)}`,
      { headers: { ...authHeaders() } }
    );
    if (adminRes.ok) return await adminRes.json();

    const publicRes = await fetch(
      `${API_BASE_URL}/products/${encodeURIComponent(productIdOrModel)}`
    );
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
    const res = await fetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(productIdOrModel)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(updates),
      }
    );

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
    const res = await fetch(`${API_BASE_URL}/admin/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
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
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
