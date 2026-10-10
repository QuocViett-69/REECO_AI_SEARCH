import '../../styles/studio/compare-login-admin.css';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PaperCutStation } from '../common/PaperCutStation';
import { ArrowLeft, Key, User, WarningCircle } from '../common/SkyIconSet';
import { Link } from 'react-router-dom';

export function LoginPage({ onNavigate, returnTo = 'account' }) {
  const { login, isAuthenticated, user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (result.isAdminRedirect) {
        alert('Tài khoản admin, chuyển hướng sang admin app.');
        window.location.href = process.env.REACT_APP_ADMIN_URL || 'http://localhost:5174';
      } else {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        // Same-origin paths only: '//host' and '/\\host' are protocol-relative off-site URLs.
        if (redirect && /^\/(?![/\\])/.test(redirect)) {
          window.location.href = redirect;
        } else if (onNavigate) {
          onNavigate(returnTo || 'account');
        }
      }
    } else {
      setError(result.message || 'Authentication failed');
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

  if (isAuthenticated && user) {
    return (
      <section className="page active st-page lg-page">
        <div className="lg-split">
          {aside}
          <div className="lg-main">
            <div className="lg-form-wrap">
              <h1 className="st-heading lg-title">Signed in as {user.full_name || user.email}</h1>
              <p className="lg-desc">
                <span className="st-tag">
                  {user.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
                <span className="st-mono">{user.email}</span>
              </p>
              <div className="lg-done__actions">
                <button
                  type="button"
                  className="st-btn st-btn--primary st-btn--lg"
                  onClick={() => onNavigate && onNavigate('products')}
                >
                  Browse products
                </button>
                <button
                  type="button"
                  className="st-btn st-btn--lg"
                  onClick={logout}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page active st-page lg-page">
      <div className="lg-split">
        {aside}

        <div className="lg-main">
          <button
            type="button"
            className="st-back lg-back"
            onClick={() => onNavigate && onNavigate('search')}
          >
            <ArrowLeft size={16} /> Back to search
          </button>

          <div className="lg-form-wrap">
            <h1 className="st-heading lg-title">Sign in to REECO</h1>
            <p className="lg-desc">
              For commercial customers and technical partners.
            </p>

            <form className="lg-form" onSubmit={handleSubmit}>
              {error && (
                <div className="st-note st-note--error" role="alert">
                  <WarningCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

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
                    placeholder="Enter password"
                    autoComplete="current-password"
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
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span className="st-desc">Don't have an account? </span>
                <Link to="/register" style={{ color: '#0066cc', textDecoration: 'underline' }}>
                  Register here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
