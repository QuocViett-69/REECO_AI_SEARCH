import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../services/ordersApi';

const cellLabel = { padding: '6px 12px 6px 0', color: 'var(--text-light)', width: 220 };
const cellValue = { padding: '6px 0', fontWeight: 500 };

function KeyValueTable({ title, rows }) {
  if (rows.length === 0) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>{title}</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={cellLabel}>{label}</td>
              <td style={cellValue}>{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Renders the JSON report that POST /admin/import returns (scripts/supabase/import-data-foundation.mjs).
export function ImportReport({ report }) {
  const validation = report.validation || {};
  const passed = validation.status === 'passed';
  const failedChecks = Object.entries(validation.assertions || {})
    .filter(([, ok]) => !ok)
    .map(([name]) => name);
  return (
    <div
      style={{
        background: passed ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)',
        border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.3)'}`,
        borderRadius: 12,
        padding: 24,
        marginTop: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {passed ? (
          <CheckCircle2 size={22} style={{ color: 'var(--success, #22c55e)' }} />
        ) : (
          <AlertCircle size={22} style={{ color: '#d97706' }} />
        )}
        <strong style={{ fontSize: 16 }}>{passed ? 'Import hoàn tất' : 'Import xong nhưng kiểm tra dữ liệu chưa đạt'}</strong>
      </div>
      <KeyValueTable
        title="Tổng quan"
        rows={[
          ['Thời điểm', report.generated_at ? formatDateTime(report.generated_at) : null],
          ['Chế độ', report.mode],
          ['Import', report.import_status],
          ['Dữ liệu nguồn', report.source_status],
          ['Kiểm tra database', validation.status],
          ['Index version', report.index_version],
        ].filter(([, value]) => value)}
      />
      <KeyValueTable title="Thay đổi" rows={Object.entries(report.import_stats || {})} />
      <KeyValueTable title="Số dòng theo bảng" rows={Object.entries(validation.rows_per_table || {})} />
      {failedChecks.length > 0 && (
        <div role="alert" style={{ marginTop: 16, fontSize: 14, color: '#b45309' }}>
          Kiểm tra không đạt: {failedChecks.join(', ')}
        </div>
      )}
      {report.output && (
        <pre style={{ marginTop: 16, fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto' }}>{report.output}</pre>
      )}
    </div>
  );
}

export function ProductImportView() {
  return <div className="main-content"><div className="detail-card">
    <h2>Product import</h2>
    <p role="note">Catalog is read-only for this demo. Import product data and backfill embeddings through the data pipeline before the demo.</p>
  </div></div>;
}
