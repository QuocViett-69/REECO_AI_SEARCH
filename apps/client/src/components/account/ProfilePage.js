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
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Back to Account
      </button>

      <div className="glass-card" style={{ padding: 32, borderRadius: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Account Profile</h1>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#535862' }}>
              <User size={18} color="#0069e0" />
              <span><strong style={{ color: '#111827' }}>Name:</strong> {user.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#535862' }}>
              <Mail size={18} color="#0069e0" />
              <span><strong style={{ color: '#111827' }}>Email:</strong> {user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#535862' }}>
              <Building size={18} color="#0069e0" />
              <span><strong style={{ color: '#111827' }}>Organization:</strong> {user.company || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#535862' }}>
              <Shield size={18} color="#0069e0" />
              <span><strong style={{ color: '#111827' }}>Role:</strong> {user.role}</span>
            </div>
          </div>
        ) : (
          <p style={{ color: '#6b7280' }}>Please sign in to view your profile.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
