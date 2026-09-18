import React from 'react';
import { ServerCog, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DashboardView({ stats, lastImportReport }) {
  return (
    <div className="main-content">
      <div className="page-title">Dashboard</div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────────── */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Products</div>
          <div className="stat-value">{stats.activeProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI Searches</div>
          <div className="stat-value" style={{ color: 'var(--text-light)', fontSize: 14 }}>
            Unavailable
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failed Imports</div>
          <div className="stat-value" style={{ color: 'var(--text-light)', fontSize: 14 }}>
            Unavailable
          </div>
        </div>
      </div>

      {/* ── Last Import Result ──────────────────────────────────────────────────── */}
      <div className="detail-card" style={{ marginBottom: 16 }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ServerCog size={16} /> Last Import Result
        </div>
        {!lastImportReport ? (
          <div style={{ padding: '20px 0', color: 'var(--text-light)', fontSize: 14 }}>
            Chưa có import nào được thực hiện trong phiên này. Đi đến <strong>Import Products</strong> để kích hoạt import.
          </div>
        ) : lastImportReport.success ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--success, #22c55e)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Import thành công</div>
              <table style={{ fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Status', lastImportReport.report?.status || lastImportReport.report?.import_status],
                    ['Source', lastImportReport.report?.source_status],
                    ['Validation', lastImportReport.report?.validation?.status],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ color: 'var(--text-light)', paddingRight: 16, paddingBottom: 4, width: 120 }}>{label}</td>
                        <td style={{ fontWeight: 500, paddingBottom: 4 }}>{value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger, red)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--danger, red)' }}>Import thất bại</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{lastImportReport.message}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Unavailable sections notice ──────────────────────────────────────── */}
      <div className="dashboard-row">
        <div className="detail-card" style={{ marginBottom: 0 }}>
          <div className="card-header">Recent Search Queries</div>
          <div style={{ padding: '20px 0', color: 'var(--text-light)', fontSize: 13 }}>
            Chức năng này chưa có API endpoint. Sẽ được bổ sung trong phiên bản tiếp theo.
          </div>
        </div>

        <div className="detail-card" style={{ marginBottom: 0 }}>
          <div className="card-header">Top Searched Products</div>
          <div style={{ padding: '20px 0', color: 'var(--text-light)', fontSize: 13 }}>
            Chức năng này chưa có API endpoint. Sẽ được bổ sung trong phiên bản tiếp theo.
          </div>
        </div>
      </div>
    </div>
  );
}
