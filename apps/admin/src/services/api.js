const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// ─── Get the Supabase access token from localStorage ──────────────────────────
// Supabase stores the session under a key like "sb-<ref>-auth-token".
function getAuthToken() {
  try {
    // Try to find a Supabase session key
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

// ─── GET /admin/products ──────────────────────────────────────────────────────
export async function getAdminProductsApi(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.q) queryParams.set('q', params.q);
    if (params.category) queryParams.set('category', params.category);
    if (params.subcategory) queryParams.set('subcategory', params.subcategory);
    if (params.device_type) queryParams.set('device_type', params.device_type);

    const url = `${API_BASE_URL}/admin/products?${queryParams.toString()}`;
    const res = await fetch(url, {
      headers: { ...authHeaders() },
    });

    if (!res.ok) return handleAdminError(res.status);
    const data = await res.json();
    return { items: data.items || [], pagination: data.pagination || {} };
  } catch (error) {
    console.warn('API getAdminProducts failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── GET /admin/products/:productId ───────────────────────────────────────────
export async function getAdminProductDetailApi(productIdOrModel) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(productIdOrModel)}`,
      { headers: { ...authHeaders() } }
    );

    if (!res.ok) return handleAdminError(res.status);
    return await res.json();
  } catch (error) {
    console.warn('API getAdminProductDetail failed:', error.message);
    return { error: 'network_error', message: 'Không thể kết nối đến server.' };
  }
}

// ─── POST /admin/import ───────────────────────────────────────────────────────
// No request body. Returns { status, report } on 201.
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
