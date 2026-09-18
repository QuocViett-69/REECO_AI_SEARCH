import { NavLink, Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="REECO search home">
          <span className="brand-mark">R</span>
          <span>
            <strong>REECO</strong>
            <small>AI product intelligence</small>
          </span>
        </NavLink>
        <nav aria-label="Public navigation" className="top-nav">
          <NavLink end to="/">
            Search
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink className="admin-link" to="/admin">
            Admin
          </NavLink>
        </nav>
      </header>
      <main className="public-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>REECO product discovery</span>
        <span>Structured search · verified product data</span>
      </footer>
    </div>
  );
}
