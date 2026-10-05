import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Buildings,
  EnvelopeSimple,
  Shield,
  User,
} from '@phosphor-icons/react';
import '../../styles/studio/account.css';

export function ProfilePage({ onNavigate }) {
  const { user } = useAuth();
  const roleLabel = user && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const initials = ((user && user.name) || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const rows = user
    ? [
        { key: 'name', icon: User, label: 'Name', value: user.name },
        { key: 'email', icon: EnvelopeSimple, label: 'Email', value: user.email },
        { key: 'company', icon: Buildings, label: 'Organization', value: user.company, empty: 'Not specified' },
        { key: 'role', icon: Shield, label: 'Role', value: roleLabel },
      ]
    : [];

  return (
    <div className="st-page st-page--mid ac-page">
      <button type="button" className="st-back" onClick={() => onNavigate && onNavigate('account')}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to account
      </button>

      <header className="st-header">
        <div className="st-header__title">
          <h1>Profile</h1>
        </div>
        <div className="st-header__aside">
          <p>The details attached to your account. REECO uses them for quotes, invoices and delivery.</p>
        </div>
      </header>

      {user ? (
        <div className="ac-profile">
          <aside className="st-panel ac-id">
            <div className="st-orb" aria-hidden="true">
              <span className="ac-id__initials">{initials || <User size={28} />}</span>
            </div>
            <div>
              <p className="ac-id__name">{user.name || user.username}</p>
              <p className="st-caption">Signed in as {user.username}</p>
            </div>
            {roleLabel && (
              <span className="st-tag st-tag--outline">
                {user.role === 'admin' && <Shield size={13} aria-hidden="true" />}
                {roleLabel} account
              </span>
            )}
          </aside>

          <dl className="ac-rows">
            {rows.map(({ key, icon: Icon, label, value, empty }) => (
              <div key={key}>
                <span className="ac-icon" aria-hidden="true"><Icon size={18} /></span>
                <dt>{label}</dt>
                <dd className={value ? undefined : 'is-empty'}>{value || empty}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="st-state">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><User size={20} /></span>
          </div>
          <h2 className="st-state__title">Sign in to view your profile</h2>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => onNavigate && onNavigate('login')}>
              Sign in
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
