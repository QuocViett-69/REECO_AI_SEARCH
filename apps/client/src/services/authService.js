import { apiFetch } from './apiFetch';

export async function loginUser(email, password) {
  return await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function registerUser(data) {
  return await apiFetch('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export async function refreshSession(refresh_token) {
  return await apiFetch('/auth/refresh', {
    method: 'POST',
    body: { refresh_token },
  });
}

export async function getMe() {
  return await apiFetch('/auth/me', {
    method: 'GET',
  });
}

export async function updateMe(data) {
  return await apiFetch('/auth/me', {
    method: 'PATCH',
    body: data,
  });
}
