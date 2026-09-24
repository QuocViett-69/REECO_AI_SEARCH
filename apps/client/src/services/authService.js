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
