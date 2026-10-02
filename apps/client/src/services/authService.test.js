import { signInUser } from './authService';

test('login stores only a verified token with the requested role', async () => {
  process.env.REACT_APP_SUPABASE_URL = 'https://example.test';
  process.env.REACT_APP_SUPABASE_ANON_KEY = 'public-key';
  const originalFetch = global.fetch;
  try {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ access_token: 'verified-token', user: { id: 'customer', app_metadata: { role: 'customer' } } }) });
    const result = await signInUser('customer', 'haitran', 'ilovereeco');
    expect(result.user.token).toBe('verified-token');
    expect(result.user.id).toBe('customer');
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ access_token: 'token', user: { app_metadata: { role: 'admin' } } }) });
    expect((await signInUser('customer', 'haitran', 'ilovereeco')).success).toBe(false);
    global.fetch.mockResolvedValue({ ok: false, json: async () => ({}) });
    expect((await signInUser('customer', 'haitran', 'ilovereeco')).success).toBe(false);
  } finally {
    global.fetch = originalFetch;
    delete process.env.REACT_APP_SUPABASE_URL;
    delete process.env.REACT_APP_SUPABASE_ANON_KEY;
  }
});
