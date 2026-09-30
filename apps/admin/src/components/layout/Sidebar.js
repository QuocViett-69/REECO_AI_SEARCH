import React from 'react';
import {
  LayoutDashboard,
  FileUp,
  Package,
  ExternalLink,
  LogOut,
  User,
  Users,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab, currentUser, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="logo" style={{ cursor: 'pointer' }} onClick={() => onSelectTab('dashboard')}>
        <div className="logo-dot" />
        Campbell Admin
      </div>

      <button
        type="button"
        className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </button>

      <button
        type="button"
        className={`nav-item ${currentTab === 'products' || currentTab === 'detail' ? 'active' : ''}`}
        onClick={() => onSelectTab('products')}
      >
        <Package size={18} />
        Product Management
      </button>

      <button
        type="button"
        className={`nav-item ${currentTab === 'import' ? 'active' : ''}`}
        onClick={() => onSelectTab('import')}
      >
        <FileUp size={18} />
        Import Products
      </button>

      <button
        type="button"
        className={`nav-item ${currentTab === 'users' ? 'active' : ''}`}
        onClick={() => onSelectTab('users')}
      >
        <Users size={18} />
        User Management
      </button>

      <button
        type="button"
        className={`nav-item ${currentTab === 'orders' ? 'active' : ''}`}
        onClick={() => onSelectTab('orders')}
      >
        <ShoppingBag size={18} />
        Order Management
      </button>

      <button
        type="button"
        className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`}
        onClick={() => onSelectTab('reports')}
      >
        <BarChart3 size={18} />
        Reports & Analytics
      </button>

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--bg-gray)' }}>
        {currentUser && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <User size={16} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-main)' }}>
              {currentUser.email}
            </div>
          </div>
        )}

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="nav-item"
          style={{ textDecoration: 'none', fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}
        >
          <ExternalLink size={16} />
          Customer Search UI
        </a>

        {onLogout && (
          <button
            type="button"
            className="nav-item"
            onClick={onLogout}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '13px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        )}
      </div>
    </aside>
  );
}

