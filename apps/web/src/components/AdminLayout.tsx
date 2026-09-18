import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="brand brand-admin" to="/admin">
          <span className="brand-mark">R</span>
          <span>
            <strong>REECO</strong>
            <small>Administration</small>
          </span>
        </NavLink>
        <nav aria-label="Admin navigation" className="admin-nav">
          <NavLink end to="/admin">
            Overview
          </NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/import">Import</NavLink>
          <NavLink to="/">Public search</NavLink>
        </nav>
        <div className="admin-account">
          <span title={user?.email}>{user?.email ?? 'Authenticated user'}</span>
          <button
            className="button button-ghost"
            onClick={() => void handleSignOut()}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
