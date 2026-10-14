import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ExternalLink,
  LogOut,
  User,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Users,
} from 'lucide-react';

const GROUP_LABEL_STYLE = {
  padding: '16px 12px 4px',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-light)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const NAV_GROUPS = [
  {
    label: 'CATALOG',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/products', label: 'Products', icon: Package },
      { to: '/quality', label: 'Data Quality', icon: ShieldCheck },
    ],
  },
  {
    label: 'COMMERCE',
    items: [
      { to: '/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/payments', label: 'Payments', icon: CreditCard },
      { to: '/clients', label: 'Clients', icon: Users },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [{ to: '/reports', label: 'Reports', icon: BarChart3 }],
  },
];

// The active item follows the URL, so /products/:id keeps "Products" highlighted.
export function Sidebar({ currentUser, onLogout }) {
  return (
    <aside className="sidebar">
      <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo-dot" />
        REECO Admin Center
      </Link>

      {NAV_GROUPS.map((group, index) => (
        <React.Fragment key={group.label}>
          <div style={index === 0 ? { ...GROUP_LABEL_STYLE, paddingTop: 8 } : GROUP_LABEL_STYLE}>{group.label}</div>
          {group.items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </React.Fragment>
      ))}

      {/* User info & Footer */}
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
              {currentUser.email} (admin)
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
