import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatApiError, listAdminProducts } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import { LoadingPanel, StatePanel } from '../components/StatePanel';

export function AdminProductsPage() {
  const { session } = useAuth();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const [draft, setDraft] = useState(q);

  useEffect(() => setDraft(q), [q]);

  const products = useQuery({
    queryKey: ['admin-products', page, q, status, session?.access_token],
    queryFn: ({ signal }) =>
      listAdminProducts(
        { page, limit: 20, q: q || undefined },
        session!.access_token,
        signal,
      ),
    enabled: Boolean(session?.access_token),
    retry: false,
  });

  const visibleItems =
    products.data?.items.filter(
      (product) => !status || product.status === status,
    ) ?? [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draft.trim()) next.set('q', draft.trim());
    if (status) next.set('status', status);
    setParams(next);
  }

  function updateStatus(nextStatus: string) {
    const next = new URLSearchParams(params);
    if (nextStatus) next.set('status', nextStatus);
    else next.delete('status');
    next.delete('page');
    setParams(next);
  }

  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <span className="eyebrow">Catalog operations</span>
          <h1>Products</h1>
          <p>Authenticated read access to active and review records.</p>
        </div>
        <Link className="button button-primary" to="/admin/import">
          Run import
        </Link>
      </header>
      <form className="admin-toolbar panel" onSubmit={submit}>
        <label className="grow">
          <span>Search model or name</span>
          <input
            onChange={(event) => setDraft(event.target.value)}
            placeholder="CS655"
            value={draft}
          />
        </label>
        <label>
          <span>Status</span>
          <select
            onChange={(event) => updateStatus(event.target.value)}
            value={status}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="review">Review</option>
          </select>
        </label>
        <button className="button button-primary" type="submit">
          Search
        </button>
      </form>

      {products.isLoading ? (
        <LoadingPanel label="Loading admin products…" />
      ) : null}
      {products.isError ? (
        <StatePanel
          description={formatApiError(products.error)}
          title="Admin products unavailable"
          tone="error"
        />
      ) : null}
      {products.data ? (
        <section className="panel table-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Device type</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((product) => (
                  <tr key={product.product_id}>
                    <td>
                      <strong>{product.model}</strong>
                      <small>{product.name_en}</small>
                    </td>
                    <td>{product.category ?? '—'}</td>
                    <td>{product.device_type ?? '—'}</td>
                    <td>
                      <span className={`status status-${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/products/${encodeURIComponent(product.product_id)}`}
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visibleItems.length ? (
            <p className="table-empty">
              No products on this page match the selected status.
            </p>
          ) : null}
        </section>
      ) : null}
      {products.data && products.data.pagination.total_pages > 1 ? (
        <nav className="pagination">
          <button
            className="button button-ghost"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set('page', String(page - 1));
              setParams(next);
            }}
            type="button"
          >
            Previous
          </button>
          <span>
            Page {page} of {products.data.pagination.total_pages}
          </span>
          <button
            className="button button-ghost"
            disabled={page >= products.data.pagination.total_pages}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set('page', String(page + 1));
              setParams(next);
            }}
            type="button"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
