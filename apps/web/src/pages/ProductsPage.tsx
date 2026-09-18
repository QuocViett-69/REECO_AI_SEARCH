import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatApiError, listProducts } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { LoadingPanel, StatePanel } from '../components/StatePanel';

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const deviceType = params.get('device_type') ?? '';
  const [draft, setDraft] = useState({ q, category, deviceType });

  useEffect(
    () => setDraft({ q, category, deviceType }),
    [q, category, deviceType],
  );

  const products = useQuery({
    queryKey: ['products', page, q, category, deviceType],
    queryFn: ({ signal }) =>
      listProducts(
        {
          page,
          limit: 12,
          q: q || undefined,
          category: category || undefined,
          device_type: deviceType || undefined,
        },
        signal,
      ),
    retry: false,
  });

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draft.q.trim()) next.set('q', draft.q.trim());
    if (draft.category.trim()) next.set('category', draft.category.trim());
    if (draft.deviceType.trim())
      next.set('device_type', draft.deviceType.trim());
    setParams(next);
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="page-container">
      <header className="page-heading">
        <span className="eyebrow">Catalog</span>
        <h1>Explore products</h1>
        <p>
          Browse active products using server-backed filters and pagination.
        </p>
      </header>
      <form className="filter-bar panel" onSubmit={applyFilters}>
        <label>
          <span>Model or name</span>
          <input
            onChange={(event) =>
              setDraft((current) => ({ ...current, q: event.target.value }))
            }
            placeholder="CS655"
            value={draft.q}
          />
        </label>
        <label>
          <span>Category</span>
          <input
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            placeholder="Sensors"
            value={draft.category}
          />
        </label>
        <label>
          <span>Device type</span>
          <input
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                deviceType: event.target.value,
              }))
            }
            placeholder="Soil Moisture…"
            value={draft.deviceType}
          />
        </label>
        <button className="button button-primary" type="submit">
          Apply filters
        </button>
      </form>

      {products.isLoading ? <LoadingPanel label="Loading products…" /> : null}
      {products.isError ? (
        <StatePanel
          action={
            <button
              className="button button-primary"
              onClick={() => void products.refetch()}
              type="button"
            >
              Retry
            </button>
          }
          description={formatApiError(products.error)}
          title="Products are unavailable"
          tone="error"
        />
      ) : null}
      {products.data && products.data.items.length === 0 ? (
        <StatePanel
          description="Clear one or more filters and try again."
          title="No products found"
        />
      ) : null}
      {products.data?.items.length ? (
        <div className="product-grid">
          {products.data.items.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      ) : null}

      {products.data && products.data.pagination.total_pages > 1 ? (
        <nav aria-label="Product pagination" className="pagination">
          <button
            className="button button-ghost"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            type="button"
          >
            Previous
          </button>
          <span>
            Page {page} of {products.data.pagination.total_pages} ·{' '}
            {products.data.pagination.total} products
          </span>
          <button
            className="button button-ghost"
            disabled={page >= products.data.pagination.total_pages}
            onClick={() => goToPage(page + 1)}
            type="button"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
