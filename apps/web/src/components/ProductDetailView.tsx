import type { ProductDetail } from '@reeco/shared';
import { Link } from 'react-router-dom';
import { formatNormalizedValue } from '../api/client';

export function ProductDetailView({
  detail,
  admin = false,
}: {
  detail: ProductDetail;
  admin?: boolean;
}) {
  const { product } = detail;

  return (
    <div className="detail-stack">
      <section className="detail-hero panel">
        <div className="detail-image">
          {product.image_url ? (
            <img alt="" src={product.image_url} />
          ) : (
            <span>{product.model}</span>
          )}
        </div>
        <div className="detail-intro">
          <div className="eyebrow">{product.category ?? 'Product'}</div>
          <h1>{product.model}</h1>
          <p className="lead">{product.name_en}</p>
          {product.name_vi ? <p className="muted">{product.name_vi}</p> : null}
          <div className="chip-row">
            {product.subcategory ? (
              <span className="chip">{product.subcategory}</span>
            ) : null}
            {product.device_type ? (
              <span className="chip">{product.device_type}</span>
            ) : null}
            {admin ? (
              <span className={`status status-${product.status}`}>
                {product.status}
              </span>
            ) : null}
          </div>
          {!admin ? (
            <Link
              className="button button-primary"
              to={`/compare?left=${encodeURIComponent(product.product_id)}`}
            >
              Compare this product
            </Link>
          ) : null}
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Capabilities</span>
              <h2>What it measures and supports</h2>
            </div>
          </div>
          <DetailItems
            title="Measurements"
            items={detail.measurements.map((item) => item.label_en)}
          />
          <DetailItems
            title="Applications"
            items={detail.applications.map((item) => item.label_en)}
          />
          <DetailItems
            title="Capabilities"
            items={detail.capabilities.map((item) => item.label_en)}
          />
          <DetailItems
            title="Supported protocols"
            items={detail.supported_protocols}
          />
          {detail.unsupported_protocols.length ? (
            <DetailItems
              title="Unsupported protocols"
              items={detail.unsupported_protocols}
            />
          ) : null}
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Identity</span>
              <h2>Taxonomy and aliases</h2>
            </div>
          </div>
          <dl className="definition-list">
            <div>
              <dt>Product ID</dt>
              <dd>{product.product_id}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{detail.taxonomy?.category ?? 'Unavailable'}</dd>
            </div>
            <div>
              <dt>Subcategory</dt>
              <dd>{detail.taxonomy?.subcategory ?? 'Unavailable'}</dd>
            </div>
            <div>
              <dt>Device type</dt>
              <dd>{detail.taxonomy?.device_type ?? 'Unavailable'}</dd>
            </div>
            <div>
              <dt>Aliases</dt>
              <dd>{detail.aliases.join(', ') || 'None'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Technical data</span>
            <h2>Specifications</h2>
          </div>
          <span className="muted">
            {detail.specifications.length} structured values
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Specification</th>
                <th>Value</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {detail.specifications.map((specification) => (
                <tr key={specification.specification_id}>
                  <td>{specification.canonical_key.replaceAll('_', ' ')}</td>
                  <td>
                    {formatNormalizedValue(specification.normalized_value)}
                  </td>
                  <td>{specification.quantity_kind ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {detail.media.length ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Resources</h2>
          </div>
          <div className="resource-list">
            {detail.media.map((media) =>
              media.product_url ? (
                <a
                  key={media.media_id}
                  href={media.product_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Official product resource ↗
                </a>
              ) : null,
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DetailItems({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="detail-list">
      <h3>{title}</h3>
      <div className="chip-row">
        {items.map((item) => (
          <span className="chip" key={item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
