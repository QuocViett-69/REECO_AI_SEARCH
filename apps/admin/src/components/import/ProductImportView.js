import React, { useState } from 'react';
import { ServerCog, CheckCircle2, AlertCircle, RefreshCw, Clock, WifiOff } from 'lucide-react';
import { triggerAdminImport } from '../../services/api';

export function ProductImportView({ onImportComplete }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { success, report } | { error, message }

  const handleTriggerImport = async () => {
    if (importing) return;
    setImporting(true);
    setResult(null);

    const response = await triggerAdminImport();
    setResult(response);
    setImporting(false);

    if (onImportComplete) {
      onImportComplete(response);
    }
  };

  // ── Render result section ────────────────────────────────────────────────────
  const renderResult = () => {
    if (!result) return null;

    if (result.success) {
      const report = result.report || {};
      return (
        <div
          style={{
            background: 'rgba(34,197,94,0.06)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 12,
            padding: 24,
            marginTop: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <CheckCircle2 size={22} style={{ color: 'var(--success, #22c55e)' }} />
            <strong style={{ fontSize: 16 }}>Import hoàn tất</strong>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {[
                ['Status', report.status || report.import_status],
                ['Source Status', report.source_status],
                ['Validation', report.validation?.status],
                ['Mode', report.mode],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: '6px 0', color: 'var(--text-light)', width: 160 }}>{label}</td>
                    <td style={{ padding: '6px 0', fontWeight: 500 }}>{value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {report.validation?.status === 'passed' && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-light)' }}>
              Validation passed. Dữ liệu đã được import thành công vào database.
            </div>
          )}
        </div>
      );
    }

    // Error state
    const iconMap = {
      conflict: <Clock size={22} style={{ color: '#f59e0b' }} />,
      unauthorized: <AlertCircle size={22} style={{ color: 'var(--danger, red)' }} />,
      unavailable: <WifiOff size={22} style={{ color: 'var(--danger, red)' }} />,
      network_error: <WifiOff size={22} style={{ color: 'var(--danger, red)' }} />,
      server_error: <AlertCircle size={22} style={{ color: 'var(--danger, red)' }} />,
    };

    return (
      <div
        style={{
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {iconMap[result.error] || <AlertCircle size={22} style={{ color: 'var(--danger, red)' }} />}
          <strong style={{ fontSize: 15 }}>
            {result.error === 'conflict' ? 'Import đang chạy' : 'Import thất bại'}
          </strong>
        </div>
        <p style={{ marginTop: 10, fontSize: 14, color: 'var(--text-light)' }}>
          {result.message}
        </p>
        {result.error !== 'unauthorized' && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={handleTriggerImport}
            disabled={importing}
          >
            <RefreshCw size={15} /> Thử lại
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="page-title">Import Products</div>

      {/* ── Info box ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface, #f8f9fa)',
          border: '1px solid var(--bg-gray, #e5e7eb)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <ServerCog size={36} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Server-side Import</h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6 }}>
              Import được thực thi trực tiếp trên server từ thư mục <code>data/</code> đã có sẵn.
              Không cần upload file — nhấn nút bên dưới để kích hoạt tiến trình import.
            </p>
            <ul style={{ margin: '12px 0 0', paddingLeft: 20, fontSize: 13, color: 'var(--text-light)', lineHeight: 1.8 }}>
              <li>Import sẽ chạy đồng bộ và trả về kết quả khi hoàn tất.</li>
              <li>Nếu import đang chạy (<code>409</code>), hãy thử lại sau ít phút.</li>
              <li>Kết quả <code>201</code> = thành công; <code>503</code> = server chưa được cấu hình đúng.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Trigger button ───────────────────────────────────────────────────── */}
      <div className="actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={importing}
          onClick={handleTriggerImport}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 200 }}
        >
          {importing ? (
            <>
              <RefreshCw size={16} className="spin" />
              Đang import...
            </>
          ) : (
            <>
              <ServerCog size={16} />
              Trigger Server Import
            </>
          )}
        </button>
        {importing && (
          <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-light)' }}>
            Đang xử lý, vui lòng không đóng trang...
          </span>
        )}
      </div>

      {/* ── Result ──────────────────────────────────────────────────────────── */}
      {renderResult()}
    </div>
  );
}
