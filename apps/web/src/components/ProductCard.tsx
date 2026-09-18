import type { ProductSummary, SearchResult } from '@reeco/shared';
import { Link } from 'react-router-dom';

type CardProduct = ProductSummary | SearchResult;

export function ProductCard({ product }: { product: CardProduct }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.image_url ? (
          <img alt="" loading="lazy" src={product.image_url} />
        ) : (
          <span>{product.model}</span>
        )}
      </div>
      <div className="product-card-copy">
        <div className="eyebrow">{product.category ?? 'Product'}</div>
        <h3>{product.model}</h3>
        <p>{product.name_en}</p>
        <span className="muted">
          {product.device_type ?? 'Device type unavailable'}
        </span>
      </div>
      <div className="card-actions">
        <Link
          className="button button-primary"
          to={`/products/${encodeURIComponent(product.product_id)}`}
        >
          View details
        </Link>
        <Link
          className="button button-ghost"
          to={`/compare?left=${encodeURIComponent(product.product_id)}`}
        >
          Compare
        </Link>
      </div>
    </article>
  );
}
