import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  formatApiError,
  formatNormalizedValue,
  getProduct,
  listProducts,
} from '../api/client';
import { LoadingPanel, StatePanel } from '../components/StatePanel';

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const left = params.get('left') ?? '';
  const right = params.get('right') ?? '';
  const [draft, setDraft] = useState({ left, right });
  const [scope, setScope] = useState<'important' | 'all'>('important');

  useEffect(() => setDraft({ left, right }), [left, right]);

  const catalog = useQuery({
    queryKey: ['compare-catalog'],
    queryFn: ({ signal }) => listProducts({ page: 1, limit: 100 }, signal),
    staleTime: 60_000,
  });
  const comparison = useQuery({
    queryKey: ['compare', left, right],
    queryFn: async ({ signal }) =>
      Promise.all([getProduct(left, signal), getProduct(right, signal)]),
    enabled: Boolean(left && right && left !== right),
    retry: false,
  });

  const rows = useMemo(() => {
    if (!comparison.data) return [];
    const [leftDetail, rightDetail] = comparison.data;
    const leftSource =
      scope === 'important'
        ? leftDetail.important_specifications
        : leftDetail.specifications;
    const rightSource =
      scope === 'important'
        ? rightDetail.important_specifications
        : rightDetail.specifications;
    const leftSpecs = new Map(
      leftSource.map((specification) => [
        specification.canonical_key,
        specification,
      ]),
    );
    const rightSpecs = new Map(
      rightSource.map((specification) => [
        specification.canonical_key,
        specification,
      ]),
    );
    return [...new Set([...leftSpecs.keys(), ...rightSpecs.keys()])]
      .sort()
      .map((key) => ({
        key,
        left: leftSpecs.get(key),
        right: rightSpecs.get(key),
      }));
  }, [comparison.data, scope]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (draft.left.trim()) next.set('left', draft.left.trim());
    if (draft.right.trim()) next.set('right', draft.right.trim());
    setParams(next);
  }

  const sameProduct = Boolean(left && right && left === right);

  return (
    <div className="page-container">
      <header className="page-heading">
        <span className="eyebrow">Side by side</span>
        <h1>Compare products</h1>
        <p>Technical values come from two live product-detail responses.</p>
      </header>
      <form className="compare-selector panel" onSubmit={submit}>
        <label>
          <span>Product A</span>
          <input
            list="product-options"
            onChange={(event) =>
              setDraft((current) => ({ ...current, left: event.target.value }))
            }
            placeholder="Product ID or exact model"
            value={draft.left}
          />
        </label>
        <div className="versus">VS</div>
        <label>
          <span>Product B</span>
          <input
            list="product-options"
            onChange={(event) =>
              setDraft((current) => ({ ...current, right: event.target.value }))
            }
            placeholder="Product ID or exact model"
            value={draft.right}
          />
        </label>
        <button className="button button-primary" type="submit">
          Compare
        </button>
        <datalist id="product-options">
          {catalog.data?.items.map((product) => (
            <option key={product.product_id} value={product.product_id}>
              {product.model} — {product.name_en}
            </option>
          ))}
        </datalist>
      </form>

      {sameProduct ? (
        <StatePanel
          description="Choose two different product IDs or exact models."
          title="Select a different second product"
        />
      ) : null}
      {!left || !right ? (
        <StatePanel
          description="Choose Product A and Product B above. Your choices remain in the URL for sharing."
          title="Two products are required"
        />
      ) : null}
      {comparison.isLoading ? (
        <LoadingPanel label="Building comparison…" />
      ) : null}
      {comparison.isError ? (
        <StatePanel
          action={
            <button
              className="button button-primary"
              onClick={() => void comparison.refetch()}
              type="button"
            >
              Retry
            </button>
          }
          description={formatApiError(comparison.error)}
          title="Comparison unavailable"
          tone="error"
        />
      ) : null}

      {comparison.data ? (
        <section className="panel compare-table">
          <div className="compare-products">
            {comparison.data.map((detail) => (
              <div key={detail.product.product_id}>
                <span className="eyebrow">{detail.product.category}</span>
                <h2>{detail.product.model}</h2>
                <p>{detail.product.name_en}</p>
                <Link
                  to={`/products/${encodeURIComponent(detail.product.product_id)}`}
                >
                  Open detail →
                </Link>
              </div>
            ))}
          </div>
          <div className="comparison-controls" aria-label="Comparison scope">
            <button
              className={scope === 'important' ? 'active' : ''}
              onClick={() => setScope('important')}
              type="button"
            >
              Key specifications
            </button>
            <button
              className={scope === 'all' ? 'active' : ''}
              onClick={() => setScope('all')}
              type="button"
            >
              All specifications
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>{comparison.data[0].product.model}</th>
                  <th>{comparison.data[1].product.model}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Category</td>
                  <td>
                    {comparison.data[0].product.category ?? 'Unavailable'}
                  </td>
                  <td>
                    {comparison.data[1].product.category ?? 'Unavailable'}
                  </td>
                </tr>
                <tr>
                  <td>Device type</td>
                  <td>
                    {comparison.data[0].product.device_type ?? 'Unavailable'}
                  </td>
                  <td>
                    {comparison.data[1].product.device_type ?? 'Unavailable'}
                  </td>
                </tr>
                <tr>
                  <td>Supported protocols</td>
                  <td>
                    {comparison.data[0].supported_protocols.join(', ') ||
                      'Unavailable'}
                  </td>
                  <td>
                    {comparison.data[1].supported_protocols.join(', ') ||
                      'Unavailable'}
                  </td>
                </tr>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.key.replaceAll('_', ' ')}</td>
                    <td className={!row.left ? 'missing' : ''}>
                      {row.left
                        ? formatNormalizedValue(row.left.normalized_value)
                        : 'Unavailable'}
                    </td>
                    <td className={!row.right ? 'missing' : ''}>
                      {row.right
                        ? formatNormalizedValue(row.right.normalized_value)
                        : 'Unavailable'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
