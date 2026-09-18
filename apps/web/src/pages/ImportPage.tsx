import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatApiError, runAdminImport } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

export function ImportPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const importMutation = useMutation({
    mutationFn: () => runAdminImport(session!.access_token),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
        queryClient.invalidateQueries({
          queryKey: ['admin-dashboard-products'],
        }),
      ]);
    },
  });

  return (
    <div className="admin-page narrow-page">
      <header className="admin-heading">
        <div>
          <span className="eyebrow">Data foundation</span>
          <h1>Import products</h1>
          <p>Trigger the repository-backed, transactional Supabase import.</p>
        </div>
      </header>
      <section className="panel import-panel">
        <div className="import-icon" aria-hidden="true">
          ⇧
        </div>
        <h2>Run server import</h2>
        <p>
          This action does not upload browser files. The API validates and
          imports the versioned product data already deployed with the backend.
        </p>
        <div className="notice warning">
          <strong>Before running:</strong> confirm the intended backend
          environment and database connection. A concurrent run returns conflict
          without starting another import.
        </div>
        <button
          className="button button-primary"
          disabled={importMutation.isPending}
          onClick={() => importMutation.mutate()}
          type="button"
        >
          {importMutation.isPending ? 'Import running…' : 'Run product import'}
        </button>
        {importMutation.isError ? (
          <p className="inline-error" role="alert">
            {formatApiError(importMutation.error)}
          </p>
        ) : null}
      </section>
      {importMutation.data ? (
        <section className="panel report-panel">
          <span className="status status-active">completed</span>
          <h2>Import report</h2>
          <pre>{JSON.stringify(importMutation.data.report, null, 2)}</pre>
        </section>
      ) : null}
    </div>
  );
}
