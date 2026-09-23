import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Building, Shield, ArrowLeft } from 'lucide-react';

export function ProfilePage({ onNavigate }) {
  const { user } = useAuth();
  return (
    <div className="page-container" style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      <button
        type="button"
        onClick={() => onNavigate && onNavigate('account')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--text-3, #888)',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Back to Account
      </button>

      <div className="glass-card" style={{ padding: 32, borderRadius: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Account Profile</h1>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2, #ccc)' }}>
              <User size={18} color="var(--accent, #00d2ff)" />
              <span><strong>Name:</strong> {user.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2, #ccc)' }}>
              <Mail size={18} color="var(--accent, #00d2ff)" />
              <span><strong>Email:</strong> {user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2, #ccc)' }}>
              <Building size={18} color="var(--accent, #00d2ff)" />
              <span><strong>Organization:</strong> {user.company || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2, #ccc)' }}>
              <Shield size={18} color="var(--accent, #00d2ff)" />
              <span><strong>Role:</strong> {user.role}</span>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-3, #888)' }}>Please sign in to view your profile.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
