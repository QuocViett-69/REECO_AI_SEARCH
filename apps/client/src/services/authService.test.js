import { loginUser, registerUser, getMe } from './authService';
import { apiFetch } from './apiFetch';

jest.mock('./apiFetch', () => ({
  apiFetch: jest.fn(),
}));

describe('AuthService Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loginUser correctly calls API and returns data', async () => {
    apiFetch.mockResolvedValueOnce({
      access_token: 'verified-token',
      user: { id: 'customer', role: 'customer' }
    });

    const result = await loginUser('test@example.com', 'password123');
    expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123' }
    });
    expect(result.access_token).toBe('verified-token');
    expect(result.user.role).toBe('customer');
  });

  test('registerUser correctly calls API', async () => {
    apiFetch.mockResolvedValueOnce({
      access_token: 'new-token',
      user: { id: 'new', role: 'customer' }
    });

    const data = { email: 'test@new.com', password: 'pwd', full_name: 'Test' };
    const result = await registerUser(data);

    expect(apiFetch).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: data
    });
    expect(result.access_token).toBe('new-token');
  });

  test('getMe correctly calls API', async () => {
    apiFetch.mockResolvedValueOnce({
      user: { id: 'me', role: 'customer' }
    });

    const result = await getMe();

    expect(apiFetch).toHaveBeenCalledWith('/auth/me', { method: 'GET' });
    expect(result.user.id).toBe('me');
  });
});
