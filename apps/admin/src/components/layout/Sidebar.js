import React from 'react';
import { LayoutDashboard, FileUp, Package, ExternalLink } from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab }) {
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
        className={`nav-item ${currentTab === 'import' ? 'active' : ''}`}
        onClick={() => onSelectTab('import')}
      >
        <FileUp size={18} />
        Import Products
      </button>

      <button
        type="button"
        className={`nav-item ${currentTab === 'products' || currentTab === 'detail' ? 'active' : ''}`}
        onClick={() => onSelectTab('products')}
      >
        <Package size={18} />
        Product Management
      </button>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--bg-gray)' }}>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="nav-item"
          style={{ textDecoration: 'none', fontSize: '13px', color: 'var(--text-light)' }}
        >
          <ExternalLink size={16} />
          Customer Search UI
        </a>
      </div>
    </aside>
  );
}
