// ─── Centralized Auth & Role Configuration Service ───────────────────────────
// Exactly 2 roles: customer and admin. Supabase Auth verifies every password; the
// browser only maps a demo username to its account email.

// The demo password exists only in development and test builds, to prefill the login
// form. CRA inlines NODE_ENV, so production bundles never contain the string.
const DEMO_PASSWORD = process.env.NODE_ENV === 'production' ? '' : 'ilovereeco';

export const DEMO_CREDENTIALS = {
  customer: {
    username: 'haitran',
    password: DEMO_PASSWORD,
    role: 'customer',
    name: 'Hai Tran',
    email: 'haitran@example.com',
    company: 'Vietnam Meteorological Station',
  },
  admin: {
    username: 'reeco',
    password: DEMO_PASSWORD,
    role: 'admin',
    name: 'REECO Administrator',
    email: 'admin@reeco.vn',
    company: 'REECO Science & Technology',
  },
};

// Accepts the demo username for the selected role, or any account email.
export function resolveAccount(role, username) {
  const target = DEMO_CREDENTIALS[role];
  if (!target) return { success: false, message: 'Invalid role selected.' };
  const login = (username || '').trim();
  if (!login) return { success: false, message: 'Username and password are required.' };
  if (login.includes('@')) {
    const known = login.toLowerCase() === target.email ? target : null;
    return {
      success: true,
      account: known || { username: login, role, name: login, email: login.toLowerCase(), company: '' },
    };
  }
  if (login !== target.username) {
    return { success: false, message: 'Invalid username or password for the selected role.' };
  }
  return { success: true, account: target };
}

export async function signInUser(role, username, password) {
  const resolved = resolveAccount(role, username);
  if (!resolved.success) return resolved;
  if (!password) return { success: false, message: 'Username and password are required.' };
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return { success: false, message: 'Supabase login is not configured.' };
  const { account } = resolved;
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token || data.user?.app_metadata?.role !== role) {
      return { success: false, message: 'Invalid credentials or role.' };
    }
    return {
      success: true,
      user: {
        username: account.username,
        role,
        name: account.name,
        email: account.email,
        company: account.company,
        id: data.user.id,
        token: data.access_token,
      },
    };
  } catch {
    return { success: false, message: 'Unable to connect to login service.' };
  }
}
