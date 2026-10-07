import { apiFetch, ApiError, clearSession, getSession, saveSession } from './http';

export { getApiBaseUrl } from './http';

const ERROR_CODES = {
  0: 'network_error',
  400: 'validation',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  503: 'unavailable',
};

// The views below expect `{ error, message }` instead of a thrown error.
export function toErrorResult(err) {
  if (!(err instanceof ApiError)) {
    return { error: 'network_error', statusCode: 0, message: 'Không thể kết nối đến server.', fieldErrors: {} };
  }
  return {
    error: ERROR_CODES[err.status] || 'server_error',
    statusCode: err.status,
    message: err.message,
    fieldErrors: err.fieldErrors,
    data: err.data,
  };
}

async function call(endpoint, options) {
  try {
    return await apiFetch(endpoint, options);
  } catch (err) {
    return toErrorResult(err);
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function getStoredUser() {
  return getSession()?.user || null;
}

export async function loginAdminApi(email, password) {
  let session;
  try {
    session = await apiFetch('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  } catch (err) {
    if (err.status === 401) return { success: false, message: 'Email hoặc mật khẩu không hợp lệ.' };
    if (err.status === 400) return { success: false, message: 'Email không đúng định dạng.' };
    if (err.status === 0) {
      return { success: false, message: 'Không kết nối được tới máy chủ API. Kiểm tra API đã chạy chưa.' };
    }
    return { success: false, message: err.message || 'Đăng nhập thất bại.' };
  }

  // Only admins get a stored session; anyone else is turned away without leaving a token behind.
  if (session?.user?.role !== 'admin') {
    return { success: false, message: 'Tài khoản không có quyền quản trị' };
  }
  saveSession(session);
  return { success: true, user: session.user };
}

export function logoutAdminApi() {
  clearSession();
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getAdminProductsApi(params = {}) {
  const query = new URLSearchParams();
  for (const key of ['page', 'limit', 'q', 'category', 'subcategory', 'device_type']) {
    if (params[key]) query.set(key, params[key]);
  }
  const data = await call(`/admin/products?${query.toString()}`);
  if (data?.error) return data;
  return { items: data?.items || [], pagination: data?.pagination || {} };
}

export function getAdminProductDetailApi(productIdOrModel) {
  return call(`/admin/products/${encodeURIComponent(productIdOrModel)}`);
}

export function updateAdminProductApi(productIdOrModel, updates) {
  return call(`/admin/products/${encodeURIComponent(productIdOrModel)}`, { method: 'PATCH', body: updates });
}

export function setAdminProductPriceApi(productIdOrModel, priceVnd) {
  return call(`/admin/products/${encodeURIComponent(productIdOrModel)}/price`, {
    method: 'PUT',
    body: { price_vnd: priceVnd },
  });
}

// ─── Import ───────────────────────────────────────────────────────────────────
export async function triggerAdminImport() {
  const data = await call('/admin/import', { method: 'POST' });
  if (data?.error === 'conflict') {
    return { ...data, message: 'Một tiến trình import đang chạy. Vui lòng thử lại sau.' };
  }
  if (data?.error) return data;
  return { success: true, report: data?.report ?? data };
}

// ─── Health ───────────────────────────────────────────────────────────────────
export async function checkApiHealth() {
  const data = await call('/health', { auth: false });
  return data?.status === 'ok';
}
