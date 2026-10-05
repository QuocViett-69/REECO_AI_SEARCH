import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { loginAdminApi } from '../../services/api';

// Demo admin for the quick-login button. CRA inlines NODE_ENV, so this is empty in production.
const DEV_LOGIN = {
  email: 'admin@reeco.vn',
  password: process.env.NODE_ENV === 'development' ? 'ilovereeco' : '',
};

export function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await loginAdminApi(email, password);
    setLoading(false);

    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setError(
        res.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      );
    }
  };

  const handleQuickDevLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await loginAdminApi(DEV_LOGIN.email, DEV_LOGIN.password);
    setLoading(false);

    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-body, #f4f5f7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          padding: '40px 32px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-main, #4D4D4D)',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: 'var(--primary, #F9C908)',
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />
            Campbell Admin
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-light, #777777)',
              margin: 0,
            }}
          >
            Đăng nhập hệ thống quản lý sản phẩm
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '6px',
              backgroundColor: '#ffefef',
              border: '1px solid #ffcccc',
              color: 'var(--danger, #ff4d4f)',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main, #4D4D4D)',
                marginBottom: '6px',
              }}
            >
              Email Admin
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light, #777777)',
                }}
              />
              <input
                type="email"
                required
                placeholder="admin@reeco.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '6px',
                  border: '1px solid #dddddd',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-main, #4D4D4D)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main, #4D4D4D)',
                marginBottom: '6px',
              }}
            >
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light, #777777)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '6px',
                  border: '1px solid #dddddd',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-main, #4D4D4D)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light, #777777)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: '6px',
              backgroundColor: 'var(--primary, #F9C908)',
              color: 'var(--text-main, #4D4D4D)',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(249, 201, 8, 0.3)',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" /> Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập Admin <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Dev Login: development builds only; production bundles carry no password */}
        {DEV_LOGIN.password && (
          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--bg-gray, #eeeeee)',
              textAlign: 'center',
            }}
          >
            <button
              type="button"
              onClick={handleQuickDevLogin}
              disabled={loading}
              style={{
                background: 'var(--bg-body, #f4f5f7)',
                border: '1px solid #dddddd',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'var(--text-light, #777777)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ⚡ Đăng nhập nhanh (Chế độ Dev)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
