import '../../styles/studio/compare-login-admin.css';
import React, { useRef, useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { PaperCutStation } from '../common/PaperCutStation';
import {
  ArrowLeft,
  Key,
  Shield,
  User,
  WarningCircle,
} from '@phosphor-icons/react';

const ROLES = [
  { value: 'customer', label: 'Customer', icon: User },
  { value: 'admin', label: 'Admin', icon: Shield },
];

export function LoginPage({ onNavigate, returnTo = 'account' }) {
  const { login, isAuthenticated, user, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [username, setUsername] = useState(DEMO_CREDENTIALS.customer.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.customer.password);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const roleRefs = useRef({});

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

  // Radio group keyboard pattern: arrows move and select
  const handleRoleKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
      return;
    e.preventDefault();
    const index = ROLES.findIndex((r) => r.value === selectedRole);
    const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    const next = ROLES[(index + step + ROLES.length) % ROLES.length].value;
    handleRoleChange(next);
    roleRefs.current[next]?.focus();
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
              <h1 className="st-heading lg-title">Signed in as {user.name}</h1>
              <p className="lg-desc">
                <span className="st-tag">
                  {user.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
                <span className="st-mono">{user.username}</span>
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
                <span className="st-label" id="lg-role-label">
                  Sign in as
                </span>
                <div
                  className="st-tabs lg-roles"
                  role="radiogroup"
                  aria-labelledby="lg-role-label"
                  onKeyDown={handleRoleKeyDown}
                >
                  {ROLES.map(({ value, label, icon: Icon }) => {
                    const checked = selectedRole === value;
                    return (
                      <button
                        key={value}
                        ref={(el) => {
                          roleRefs.current[value] = el;
                        }}
                        type="button"
                        role="radio"
                        className="st-tab lg-role"
                        aria-checked={checked}
                        tabIndex={checked ? 0 : -1}
                        onClick={() => handleRoleChange(value)}
                      >
                        <Icon size={15} aria-hidden="true" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="st-field">
                <label className="st-label" htmlFor="username">
                  Username
                </label>
                <div className="st-input-icon">
                  <User size={18} aria-hidden="true" />
                  <input
                    id="username"
                    type="text"
                    className="st-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
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
            </form>

            {/* Demo hints exist only in development builds (the password is empty in production) */}
            {DEMO_CREDENTIALS.customer.password && (
              <div className="lg-demo">
                <p className="lg-demo__title">
                  <Shield size={14} aria-hidden="true" /> Demo accounts
                </p>
                <dl className="lg-demo__list">
                  <div>
                    <dt>Customer</dt>
                    <dd className="st-mono">
                      {DEMO_CREDENTIALS.customer.username} /{' '}
                      {DEMO_CREDENTIALS.customer.password}
                    </dd>
                  </div>
                  <div>
                    <dt>Admin</dt>
                    <dd className="st-mono">
                      {DEMO_CREDENTIALS.admin.username} /{' '}
                      {DEMO_CREDENTIALS.admin.password}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
