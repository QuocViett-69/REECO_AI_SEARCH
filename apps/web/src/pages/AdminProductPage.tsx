import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { formatApiError, getAdminProduct } from '../api/client';
import { useAuth } from '../auth/AuthProvider';
import { ProductDetailView } from '../components/ProductDetailView';
import { LoadingPanel, StatePanel } from '../components/StatePanel';

export function AdminProductPage() {
  const { id = '' } = useParams();
  const { session } = useAuth();
  const detail = useQuery({
    queryKey: ['admin-product', id, session?.access_token],
    queryFn: ({ signal }) => getAdminProduct(id, session!.access_token, signal),
    enabled: Boolean(id && session?.access_token),
    retry: false,
  });

  return (
    <div className="admin-page">
      <Link className="back-link" to="/admin/products">
        ← Back to admin products
      </Link>
      <div className="notice">
        Read-only MVP: product editing, deletion, and status mutation are not
        available.
      </div>
      {detail.isLoading ? (
        <LoadingPanel label="Loading admin product…" />
      ) : null}
      {detail.isError ? (
        <StatePanel
          description={formatApiError(detail.error)}
          title="Admin product unavailable"
          tone="error"
        />
      ) : null}
      {detail.data ? <ProductDetailView admin detail={detail.data} /> : null}
    </div>
  );
}
