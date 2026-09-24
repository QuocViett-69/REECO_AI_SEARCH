import React, { useState, useEffect } from 'react';
import { ServerCog, AlertCircle, CheckCircle2, Activity, RefreshCw } from 'lucide-react';
import { checkApiHealth } from '../../services/api';

export function DashboardView({ stats, lastImportReport }) {
  const [apiOnline, setApiOnline] = useState(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);

  const verifyHealth = async () => {
    setHealthChecking(true);
    const isOk = await checkApiHealth();
    setApiOnline(isOk);
    setHealthChecking(false);
    setLastCheckedTime(new Date().toLocaleTimeString('vi-VN'));
  };

  useEffect(() => {
    verifyHealth();
    const timer = setInterval(verifyHealth, 30000); // Poll health every 30s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="main-content">
      {/* ── Page Header with Health Badge ───────────────────────────────────── */}
      <div
        className="page-title"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <span>Dashboard</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: apiOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.15)',
              border: `1px solid ${apiOnline ? '#bbf7d0' : '#fef08a'}`,
              color: apiOnline ? '#166534' : '#854d0e',
            }}
          >
            <Activity size={14} className={healthChecking ? 'spin' : ''} />
            <span>{apiOnline === null ? 'Đang kiểm tra...' : apiOnline ? 'API Server: Online 🟢' : 'API Server: Offline / Local Dev 🟡'}</span>
            {lastCheckedTime && <span style={{ opacity: 0.7, fontSize: '11px', marginLeft: 4 }}>({lastCheckedTime})</span>}
          </div>

          <button
            type="button"
            className="btn"
            onClick={verifyHealth}
            disabled={healthChecking}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={13} className={healthChecking ? 'spin' : ''} /> Kiểm tra
          </button>
        </div>
      </div>

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
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ServerCog size={18} /> Last Import Result
          </div>
          {lastImportReport && (
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 400 }}>
              (Đã lưu trữ trong phiên làm việc)
            </span>
          )}
        </div>

        {!lastImportReport ? (
          <div style={{ padding: '20px 0', color: 'var(--text-light)', fontSize: 14 }}>
            Chưa có import nào được thực hiện. Đi đến <strong>Import Products</strong> để kích hoạt import dữ liệu mới.
          </div>
        ) : lastImportReport.success ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
            <CheckCircle2 size={22} style={{ color: 'var(--success, #22c55e)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: '15px' }}>Import thành công</div>
              <table style={{ fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Status', lastImportReport.report?.status || lastImportReport.report?.import_status || 'Success'],
                    ['Source', lastImportReport.report?.source_status || 'valid'],
                    ['Validation', lastImportReport.report?.validation?.status || 'passed'],
                    ['Timestamp', lastImportReport.report?.timestamp || new Date().toLocaleString('vi-VN')],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ color: 'var(--text-light)', paddingRight: 16, paddingBottom: 6, width: 120 }}>{label}</td>
                        <td style={{ fontWeight: 500, paddingBottom: 6 }}>{value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0' }}>
            <AlertCircle size={22} style={{ color: 'var(--danger, red)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--danger, red)', fontSize: '15px' }}>Import thất bại</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{lastImportReport.message}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Additional Status Sections ───────────────────────────────────────── */}
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
