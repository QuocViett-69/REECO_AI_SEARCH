import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { Lock, User, Shield, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export function LoginPage({ onNavigate, returnTo = 'account' }) {
  const { login, isAuthenticated, user, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [username, setUsername] = useState(DEMO_CREDENTIALS.customer.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.customer.password);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'customer') {
      setUsername(DEMO_CREDENTIALS.customer.username);
      setPassword(DEMO_CREDENTIALS.customer.password);
    } else {
      setUsername(DEMO_CREDENTIALS.admin.username);
      setPassword(DEMO_CREDENTIALS.admin.password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(selectedRole, username, password);
    setIsLoading(false);

    if (result.success) {
      if (onNavigate) {
        onNavigate(returnTo || 'account');
      }
    } else {
      setError(result.message || 'Authentication failed');
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="login-container" style={{ maxWidth: 460, margin: '60px auto', padding: 32 }}>
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(0, 200, 115, 0.1)', color: '#00c873', marginBottom: 16 }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-1, #fff)', marginBottom: 8 }}>
            Logged in as {user.name}
          </h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 24 }}>
            Role: <span style={{ textTransform: 'uppercase', color: 'var(--accent, #00d2ff)', fontWeight: 600 }}>{user.role}</span> ({user.username})
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate('products')}
            >
              Browse Products
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={logout}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" style={{ maxWidth: 460, margin: '50px auto', padding: '0 20px' }}>
      <button
        type="button"
        onClick={() => onNavigate && onNavigate('search')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: 'var(--text-3, #888)',
          cursor: 'pointer',
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} /> Back to Search
      </button>

      <div className="glass-card" style={{ padding: 36, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 12,
              borderRadius: 12,
              background: 'rgba(0, 210, 255, 0.1)',
              color: 'var(--accent, #00d2ff)',
              marginBottom: 12,
            }}
          >
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1, #fff)', margin: '0 0 8px' }}>
            Sign In to REECO
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3, #888)', margin: 0 }}>
            Commercial Customer & Technical Partner Access
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 8,
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid rgba(255, 68, 68, 0.25)',
              color: '#ff6b6b',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2, #ccc)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Select Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: selectedRole === 'customer' ? '1px solid var(--accent, #00d2ff)' : '1px solid rgba(255,255,255,0.08)',
                  background: selectedRole === 'customer' ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  color: selectedRole === 'customer' ? '#fff' : 'var(--text-3, #888)',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={selectedRole === 'customer'}
                  onChange={() => handleRoleChange('customer')}
                  style={{ accentColor: 'var(--accent, #00d2ff)' }}
                />
                <User size={16} />
                <span>Customer</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: selectedRole === 'admin' ? '1px solid var(--accent, #00d2ff)' : '1px solid rgba(255,255,255,0.08)',
                  background: selectedRole === 'admin' ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  color: selectedRole === 'admin' ? '#fff' : 'var(--text-3, #888)',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={() => handleRoleChange('admin')}
                  style={{ accentColor: 'var(--accent, #00d2ff)' }}
                />
                <Shield size={16} />
                <span>Admin</span>
              </label>
            </div>
          </div>

          {/* Username Input */}
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="username"
              style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2, #ccc)', marginBottom: 6 }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              className="search-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password Input (Masked type="password") */}
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2, #ccc)', marginBottom: 6 }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="search-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 8,
              cursor: isLoading ? 'wait' : 'pointer',
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div
          style={{
            marginTop: 24,
            padding: '12px 14px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            fontSize: 12,
            color: 'var(--text-3, #777)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-2, #aaa)', marginBottom: 4 }}>
            Demo Access Credentials:
          </div>
          <div>• <strong>Customer:</strong> <code>haitran</code> / <code>ilovereeco</code></div>
          <div>• <strong>Admin:</strong> <code>reeco</code> / <code>ilovereeco</code></div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
