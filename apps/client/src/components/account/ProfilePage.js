import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Buildings,
  EnvelopeSimple,
  Shield,
  User,
  Phone,
  CheckCircle,
  WarningCircle
} from '../common/SkyIconSet';
import '../../styles/studio/account.css';

export function ProfilePage({ onNavigate }) {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', company: '' });
  const [status, setStatus] = useState({ type: null, message: '' }); // 'success' | 'error' | 'loading'

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        company: user.company || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });
    const res = await updateProfile(formData);
    if (res.success) {
      setStatus({ type: 'success', message: 'Profile updated successfully' });
      setIsEditing(false);
    } else {
      setStatus({ type: 'error', message: res.message || 'Update failed' });
    }
  };

  const roleLabel = user && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const initials = ((user && user.full_name) || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  if (!user) {
    return (
      <div className="st-page st-page--mid ac-page">
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
      </div>
    );
  }

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

      <div className="ac-profile">
        <aside className="st-panel ac-id">
          <div className="st-orb" aria-hidden="true">
            <span className="ac-id__initials">{initials || <User size={28} />}</span>
          </div>
          <div>
            <p className="ac-id__name">{user.full_name}</p>
            <p className="st-caption">Signed in as {user.email}</p>
          </div>
          {roleLabel && (
            <span className="st-tag st-tag--outline">
              {user.role === 'admin' && <Shield size={13} aria-hidden="true" />}
              {roleLabel} account
            </span>
          )}
        </aside>

        {status.type === 'success' && (
          <div className="st-note st-note--success" style={{ marginBottom: '1rem' }}>
            <CheckCircle size={16} /> {status.message}
          </div>
        )}
        {status.type === 'error' && (
          <div className="st-note st-note--error" style={{ marginBottom: '1rem' }}>
            <WarningCircle size={16} /> {status.message}
          </div>
        )}

        {!isEditing ? (
          <>
            <dl className="ac-rows">
              <div>
                <span className="ac-icon" aria-hidden="true"><User size={18} /></span>
                <dt>Full Name</dt>
                <dd>{user.full_name}</dd>
              </div>
              <div>
                <span className="ac-icon" aria-hidden="true"><EnvelopeSimple size={18} /></span>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <span className="ac-icon" aria-hidden="true"><Phone size={18} /></span>
                <dt>Phone</dt>
                <dd className={user.phone ? undefined : 'is-empty'}>{user.phone || 'Not specified'}</dd>
              </div>
              <div>
                <span className="ac-icon" aria-hidden="true"><Buildings size={18} /></span>
                <dt>Organization</dt>
                <dd className={user.company ? undefined : 'is-empty'}>{user.company || 'Not specified'}</dd>
              </div>
            </dl>
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="st-btn st-btn--outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <form className="st-panel" onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="st-field">
              <label className="st-label" htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                className="st-input"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="st-field">
              <label className="st-label">Email (Read Only)</label>
              <input
                className="st-input"
                type="email"
                disabled
                value={user.email}
              />
            </div>
            <div className="st-field">
              <label className="st-label" htmlFor="phone">Phone</label>
              <input
                id="phone"
                className="st-input"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="st-field">
              <label className="st-label" htmlFor="company">Organization</label>
              <input
                id="company"
                className="st-input"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div className="st-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="st-btn"
                onClick={() => { setIsEditing(false); setStatus({ type: null, message: '' }); }}
                disabled={status.type === 'loading'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="st-btn st-btn--primary"
                disabled={status.type === 'loading'}
              >
                {status.type === 'loading' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
