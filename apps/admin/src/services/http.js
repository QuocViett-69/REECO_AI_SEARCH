export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const port = window.location.port;
    const hostname = window.location.hostname || '127.0.0.1';
    if (port === '4173' || port === '4174') {
      return `http://${hostname}:3100/api/v1`;
    }
    if (port === '5173' || port === '5174') {
      return `http://${hostname}:3000/api/v1`;
    }
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

export function getAuthToken() {
  try {
    const sessionToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('reeco_auth_token') : null;
    if (sessionToken) return sessionToken;

    if (typeof localStorage !== 'undefined') {
      const directToken = localStorage.getItem('reeco_auth_token');
      if (directToken) return directToken;

      const adminToken = localStorage.getItem('admin_access_token');
      if (adminToken) return adminToken;
    }
    return null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.data = data;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.auth !== false) {
    const token = getAuthToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let body = options.body;
  if (body && (options.method === 'GET' || options.method === 'HEAD')) {
    body = undefined;
  }

  const config = {
    ...options,
    headers,
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  };

  const response = await fetch(url, config);

  if (response.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reeco:unauthorized'));
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const errorMsg =
      (typeof data === 'object' && (data?.message || data?.error)) ||
      `Yêu cầu thất bại (HTTP ${response.status})`;
    throw new ApiError(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
      response.status,
      data
    );
  }

  return data;
}

export default apiFetch;
