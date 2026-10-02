// ─── Centralized Auth & Role Configuration Service ───────────────────────────
// Exactly 2 roles: customer and admin.
// Credentials for demo and client validation.

export const DEMO_CREDENTIALS = {
  customer: {
    username: 'haitran',
    password: 'ilovereeco',
    role: 'customer',
    name: 'Hai Tran',
    email: 'haitran@example.com',
    company: 'Vietnam Meteorological Station',
  },
  admin: {
    username: 'reeco',
    password: 'ilovereeco',
    role: 'admin',
    name: 'REECO Administrator',
    email: 'admin@reeco.vn',
    company: 'REECO Science & Technology',
  },
};

export function authenticateUser(role, username, password) {
  const target = DEMO_CREDENTIALS[role];
  if (!target) {
    return { success: false, message: 'Invalid role selected.' };
  }
  if (!username || !password) {
    return { success: false, message: 'Username and password are required.' };
  }
  if (username.trim() !== target.username || password !== target.password) {
    return { success: false, message: 'Invalid username or password for the selected role.' };
  }
  return {
    success: true,
    user: {
      username: target.username,
      role: target.role,
      name: target.name,
      email: target.email,
      company: target.company,
      token: `demo-token-${target.role}-${Date.now()}`,
    },
  };
}

export async function signInUser(role, username, password) {
  const result = authenticateUser(role, username, password);
  if (!result.success) return result;
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return { success: false, message: 'Supabase login is not configured.' };
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: result.user.email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token || data.user?.app_metadata?.role !== role) {
      return { success: false, message: 'Invalid credentials or role.' };
    }
    return { success: true, user: { ...result.user, id: data.user.id, token: data.access_token } };
  } catch {
    return { success: false, message: 'Unable to connect to login service.' };
  }
}
