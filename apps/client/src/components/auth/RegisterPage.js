import '../../styles/studio/compare-login-admin.css';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PaperCutStation } from '../common/PaperCutStation';
import { ArrowLeft, Key, User, WarningCircle } from '../common/SkyIconSet';
import { Link, Navigate, useNavigate } from 'react-router-dom';

export function RegisterPage({ onNavigate }) {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Mật khẩu phải từ 8 ký tự trở lên');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }
    if (!fullName) {
      setError('Họ tên là bắt buộc');
      return;
    }

    setIsLoading(true);

    const result = await register({ email, password, full_name: fullName });
    setIsLoading(false);

    if (result.success) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      // Same-origin paths only: '//host' and '/\\host' are protocol-relative off-site URLs.
      if (redirect && /^\/(?![/\\])/.test(redirect)) {
        window.location.href = redirect;
      } else if (onNavigate) {
        onNavigate('account-profile');
      } else {
        navigate('/account/profile');
      }
    } else {
      if (result.message && result.message.includes('already exists')) {
        setError('Email đã được sử dụng');
      } else {
        setError(result.message || 'Đăng ký thất bại');
      }
    }
  };

  const aside = (
    <aside className="lg-aside">
      <div className="lg-aside__copy">
        <p className="lg-aside__title">
          Find the instrument your station needs.
        </p>
        <p className="lg-aside__desc">
          Sensors, dataloggers and telemetry from Campbell Scientific, supplied
          in Vietnam by REECO.
        </p>
      </div>
      <PaperCutStation className="lg-aside__art" />
    </aside>
  );

  // Already signed in: redirect declaratively (navigating during render warns in React)
  if (isAuthenticated) {
    return <Navigate to="/account/profile" replace />;
  }

  return (
    <section className="page active st-page lg-page">
      <div className="lg-split">
        {aside}

        <div className="lg-main">
          <button
            type="button"
            className="st-back lg-back"
            onClick={() => (onNavigate ? onNavigate('search') : navigate(-1))}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="lg-form-wrap">
            <h1 className="st-heading lg-title">Register an account</h1>
            <p className="lg-desc">
              Create a new account for commercial customers.
            </p>

            <form className="lg-form" onSubmit={handleSubmit}>
              {error && (
                <div className="st-note st-note--error" role="alert">
                  <WarningCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="st-field">
                <label className="st-label" htmlFor="fullName">
                  Full Name
                </label>
                <div className="st-input-icon">
                  <User size={18} aria-hidden="true" />
                  <input
                    id="fullName"
                    type="text"
                    className="st-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    aria-invalid={error ? 'true' : undefined}
                    required
                  />
                </div>
              </div>

              <div className="st-field">
                <label className="st-label" htmlFor="email">
                  Email
                </label>
                <div className="st-input-icon">
                  <User size={18} aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    className="st-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    autoComplete="email"
                    aria-invalid={error ? 'true' : undefined}
                    required
                  />
                </div>
              </div>

              <div className="st-field">
                <label className="st-label" htmlFor="password">
                  Password
                </label>
                <div className="st-input-icon">
                  <Key size={18} aria-hidden="true" />
                  <input
                    id="password"
                    type="password"
                    className="st-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 8 chars)"
                    autoComplete="new-password"
                    aria-invalid={error ? 'true' : undefined}
                    required
                  />
                </div>
              </div>

              <div className="st-field">
                <label className="st-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="st-input-icon">
                  <Key size={18} aria-hidden="true" />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="st-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    aria-invalid={error ? 'true' : undefined}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="st-btn st-btn--primary st-btn--lg st-btn--block lg-submit"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span className="st-desc">Already have an account? </span>
                <Link to="/login" style={{ color: '#0066cc', textDecoration: 'underline' }}>
                  Sign in here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
