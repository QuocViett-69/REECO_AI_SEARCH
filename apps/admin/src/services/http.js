// Admin API client: session storage, token refresh and a fetch wrapper that throws ApiError.

const SESSION_KEY = 'reeco_admin_session';
// Refresh a little before the access token expires so requests never go out with a stale token.
const REFRESH_MARGIN_MS = 60_000;

export const UNAUTHORIZED_EVENT = 'reeco:unauthorized';

export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const port = window.location.port;
    const hostname = window.location.hostname || '127.0.0.1';
    // Local staging (Customer UI 4173 / Admin UI 4174) talks to the staging API on 3100
    if (port === '4173' || port === '4174') {
      return `http://${hostname}:3100/api/v1`;
    }
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
}

// ─── Session ({ access_token, refresh_token, expires_at, user }) ────────────────
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.access_token && session?.user ? session : null;
  } catch {
    return null;
  }
}

export function saveSession({ access_token, refresh_token, expires_at, user }) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access_token, refresh_token, expires_at, user }));
  } catch {
    // ignore
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

function isExpiring(session) {
  return typeof session.expires_at === 'number' && session.expires_at * 1000 < Date.now() + REFRESH_MARGIN_MS;
}

function signOut() {
  clearSession();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }
}

// ─── Errors ─────────────────────────────────────────────────────────────────────
const DEFAULT_MESSAGES = {
  0: 'Không thể kết nối đến server.',
  401: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  503: 'Server không khả dụng hoặc thiếu cấu hình. Vui lòng thử lại sau.',
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    // ZodValidationPipe answers 400 with { errors: [{ path, message }] }; keep the first message per field
    this.fieldErrors = {};
    if (Array.isArray(data?.errors)) {
      for (const issue of data.errors) {
        const field = issue?.path || '_';
        if (!this.fieldErrors[field]) this.fieldErrors[field] = issue?.message || 'Giá trị không hợp lệ';
      }
    }
  }
}

function messageFor(status, data) {
  if (DEFAULT_MESSAGES[status] && status !== 0) return DEFAULT_MESSAGES[status];
  const serverMessage = data && typeof data === 'object' ? data.message || data.error : null;
  if (Array.isArray(serverMessage)) return serverMessage.join(', ');
  return serverMessage || `Yêu cầu thất bại (HTTP ${status}).`;
}

// ─── Refresh ────────────────────────────────────────────────────────────────────
let refreshing = null;

// Resolves to the new session, or null when the refresh token is rejected. Concurrent callers share one request.
export function refreshSession() {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function doRefresh() {
  const session = getSession();
  if (!session?.refresh_token) return null;
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!response.ok) return null;
  const next = await response.json().catch(() => null);
  if (!next?.access_token || next.user?.role !== 'admin') return null;
  saveSession(next);
  return getSession();
}

// ─── Fetch ──────────────────────────────────────────────────────────────────────
async function parseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json().catch(() => null);
  return response.text().catch(() => null);
}

/**
 * Calls the REECO API and returns the parsed body; throws ApiError (status 0 for network failures).
 * With `auth` (default) the admin access token is sent, refreshed when it is about to expire and once
 * more after a 401; if the session cannot be renewed it is cleared and UNAUTHORIZED_EVENT is dispatched.
 */
export async function apiFetch(endpoint, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const url = `${getApiBaseUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const send = async (session) => {
    try {
      return await fetch(url, {
        method,
        headers: {
          ...(body !== undefined && { 'Content-Type': 'application/json' }),
          ...(session && { Authorization: `Bearer ${session.access_token}` }),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(DEFAULT_MESSAGES[0], 0, null);
    }
  };

  let session = auth ? getSession() : null;
  if (session && isExpiring(session)) {
    session = await refreshSession().catch(() => session);
    if (!session) {
      signOut();
      throw new ApiError(DEFAULT_MESSAGES[401], 401, null);
    }
  }

  let response = await send(session);
  if (auth && response.status === 401 && session) {
    const renewed = await refreshSession().catch(() => null);
    if (renewed) response = await send(renewed);
  }
  if (auth && response.status === 401) signOut();

  const data = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(messageFor(response.status, data), response.status, data);
  }
  return data;
}

export default apiFetch;
