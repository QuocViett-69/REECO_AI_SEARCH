import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { formatApiError, getProduct } from '../api/client';
import { ProductDetailView } from '../components/ProductDetailView';
import { LoadingPanel, StatePanel } from '../components/StatePanel';

export function ProductPage() {
  const { id = '' } = useParams();
  const detail = useQuery({
    queryKey: ['product', id],
    queryFn: ({ signal }) => getProduct(id, signal),
    enabled: Boolean(id),
    retry: false,
  });

  return (
    <div className="page-container">
      <Link className="back-link" to="/products">
        ← Back to products
      </Link>
      {detail.isLoading ? <LoadingPanel label="Loading product…" /> : null}
      {detail.isError ? (
        <StatePanel
          action={
            <button
              className="button button-primary"
              onClick={() => void detail.refetch()}
              type="button"
            >
              Retry
            </button>
          }
          description={formatApiError(detail.error)}
          title="Product unavailable"
          tone="error"
        />
      ) : null}
      {detail.data ? <ProductDetailView detail={detail.data} /> : null}
    </div>
  );
}
