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
    // 1. Direct tokens from sessionStorage or localStorage
    const sessionToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('reeco_auth_token') : null;
    if (sessionToken) return sessionToken;

    if (typeof localStorage !== 'undefined') {
      const directToken = localStorage.getItem('reeco_auth_token');
      if (directToken) return directToken;

      const adminToken = localStorage.getItem('admin_access_token');
      if (adminToken) return adminToken;
    }

    // 2. Auth user objects
    if (typeof sessionStorage !== 'undefined') {
      const sessionUser = sessionStorage.getItem('reeco_auth_user');
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser);
        if (parsed?.token) return parsed.token;
        if (parsed?.access_token) return parsed.access_token;
      }
    }

    if (typeof localStorage !== 'undefined') {
      const authUser = localStorage.getItem('reeco_auth_user');
      if (authUser) {
        const parsed = JSON.parse(authUser);
        if (parsed?.token) return parsed.token;
        if (parsed?.access_token) return parsed.access_token;
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            return parsed?.access_token || parsed?.currentSession?.access_token || null;
          }
        }
      }
    }

    // Fallback demo customer token for client so orders & notifications always work
    return null;
  } catch {
    // ignore
  }
  return null;
}

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

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
    const error = new Error(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
    );
    error.status = response.status;
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiFetch;
