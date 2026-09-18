import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatApiError, listAdminProducts } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import { LoadingPanel, StatePanel } from '../components/StatePanel';

export function AdminDashboardPage() {
  const { session } = useAuth();
  const catalog = useQuery({
    queryKey: ['admin-dashboard-products', session?.access_token],
    queryFn: ({ signal }) =>
      listAdminProducts({ page: 1, limit: 100 }, session!.access_token, signal),
    enabled: Boolean(session?.access_token),
    retry: false,
  });
  const active =
    catalog.data?.items.filter((product) => product.status === 'active')
      .length ?? 0;
  const review =
    catalog.data?.items.filter((product) => product.status === 'review')
      .length ?? 0;

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <span className="eyebrow">Operations</span>
          <h1>Admin overview</h1>
          <p>Manage the backend capabilities available in the frozen MVP.</p>
        </div>
      </header>
      {catalog.isLoading ? (
        <LoadingPanel label="Loading catalog overview…" />
      ) : null}
      {catalog.isError ? (
        <StatePanel
          description={formatApiError(catalog.error)}
          title="Catalog overview unavailable"
          tone="error"
        />
      ) : null}
      {catalog.data ? (
        <div className="dashboard-stats">
          <div>
            <span>Total products</span>
            <strong>{catalog.data.pagination.total}</strong>
          </div>
          <div>
            <span>Active products</span>
            <strong>{active}</strong>
          </div>
          <div>
            <span>Review products</span>
            <strong>{review}</strong>
          </div>
          <div>
            <span>Search analytics</span>
            <strong className="unavailable-value">Unavailable</strong>
          </div>
        </div>
      ) : null}
      <div className="admin-card-grid">
        <Link className="admin-action-card" to="/admin/products">
          <span>01</span>
          <h2>Inspect products</h2>
          <p>
            Browse active and review records through authenticated admin
            endpoints.
          </p>
          <strong>Open products →</strong>
        </Link>
        <Link className="admin-action-card" to="/admin/import">
          <span>02</span>
          <h2>Run data import</h2>
          <p>
            Trigger the server-side transactional import and inspect its report.
          </p>
          <strong>Open import →</strong>
        </Link>
        <section className="admin-action-card unavailable">
          <span>—</span>
          <h2>Analytics</h2>
          <p>
            No dashboard statistics or search analytics endpoint exists in this
            MVP.
          </p>
          <strong>Unavailable</strong>
        </section>
      </div>
      <div className="notice warning">
        <strong>Security boundary:</strong> the backend currently validates
        Supabase users but does not yet enforce a separate admin role.
        Production authorization remains a backend TODO.
      </div>
    </div>
  );
}
