import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Loader, AlertCircle, Radio, Tag, Folder } from 'lucide-react';
import { getAdminProductDetailApi } from '../../services/api';

// ─── Format normalized spec value ─────────────────────────────────────────────
function formatSpecValue(val) {
  if (!val) return '—';
  if (val.type === 'range') {
    const min = val.min_value ?? '';
    const max = val.max_value ?? '';
    const unit = val.unit || '';
    return `${min} – ${max} ${unit}`.trim();
  }
  if (val.type === 'number' || val.type === 'quantity') {
    return `${val.value ?? ''} ${val.unit || ''}`.trim();
  }
  if (val.type === 'boolean') return val.value ? 'Yes' : 'No';
  return String(val.value ?? '—');
}

export function AdminProductDetailView({ productId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    setDetail(null);

    getAdminProductDetailApi(productId)
      .then((data) => {
        if (data && data.error) {
          setError(data.message || 'Không thể tải sản phẩm.');
        } else if (data && data.product) {
          setDetail(data);
        } else {
          setError('Sản phẩm không tồn tại hoặc không có quyền truy cập.');
        }
      })
      .catch(() => setError('Lỗi kết nối API.'))
      .finally(() => setLoading(false));
  }, [productId]);

  const renderBack = () => (
    <div style={{ marginBottom: '20px' }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-light)',
          fontWeight: 500,
          fontSize: '15px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <ArrowLeft size={16} /> Back to Products
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="main-content">
        {renderBack()}
        <div className="detail-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 }}>
          <Loader size={24} className="spin" />
          <span>Đang tải sản phẩm...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        {renderBack()}
        <div className="detail-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 32, color: 'var(--danger, red)' }}>
          <AlertCircle size={22} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="main-content">
        {renderBack()}
        <div className="detail-card"><p>Chưa có sản phẩm được chọn.</p></div>
      </div>
    );
  }

  const p = detail.product;
  const protocols = detail.supported_protocols || [];
  const specifications = detail.specifications || [];
  const importantSpecs = detail.important_specifications || [];
  const statusClass = p.status === 'active' ? 'status-active' : 'status-draft';
  const productUrl = (detail.media || []).find((m) => m.product_url)?.product_url
    || `https://www.campbellsci.com/${p.model.toLowerCase()}`;

  return (
    <div className="main-content">
      {renderBack()}

      <div className="detail-card">
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="detail-header">
          <div className="detail-title">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span>{p.model} — {p.name_en || p.name_vi || p.model}</span>
              <span className={`status-badge ${statusClass}`}>
                {p.status}
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href={productUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Globe size={15} /> CSI Site
            </a>
          </div>
        </div>

        {/* ── Basic Info Grid ─────────────────────────────────────────────────── */}
        <div className="info-grid">
          <div className="info-group">
            <div className="info-label">Model</div>
            <div className="info-value">{p.model}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Product Name</div>
            <div className="info-value">{p.name_en || '—'}</div>
          </div>
          {p.name_vi && (
            <div className="info-group">
              <div className="info-label">Tên tiếng Việt</div>
              <div className="info-value">{p.name_vi}</div>
            </div>
          )}
          <div className="info-group">
            <div className="info-label"><Folder size={13} style={{ marginRight: 4 }} />Category</div>
            <div className="info-value">{p.category || '—'}</div>
          </div>
          <div className="info-group">
            <div className="info-label"><Tag size={13} style={{ marginRight: 4 }} />Subcategory</div>
            <div className="info-value">{p.subcategory || '—'}</div>
          </div>
          <div className="info-group">
            <div className="info-label">Device Type</div>
            <div className="info-value">{p.device_type || '—'}</div>
          </div>
          <div className="info-group">
            <div className="info-label"><Radio size={13} style={{ marginRight: 4 }} />Protocols</div>
            <div className="info-value">{protocols.length > 0 ? protocols.join(', ') : '—'}</div>
          </div>
        </div>

        {/* ── Key Specifications ──────────────────────────────────────────────── */}
        {importantSpecs.length > 0 && (
          <div className="specs-section">
            <h3>Key Specifications</h3>
            {importantSpecs.map((spec) => (
              <div key={spec.canonical_key} className="spec-row">
                <div className="spec-name">{spec.canonical_key.replace(/_/g, ' ')}</div>
                <div className="spec-value">{formatSpecValue(spec.normalized_value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Full Specifications ─────────────────────────────────────────────── */}
        {specifications.length > 0 && (
          <div className="specs-section">
            <h3>Full Specifications</h3>
            {specifications.map((spec) => (
              <div key={spec.specification_id || spec.canonical_key} className="spec-row">
                <div className="spec-name">{spec.canonical_key.replace(/_/g, ' ')}</div>
                <div className="spec-value">{formatSpecValue(spec.normalized_value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Review note ─────────────────────────────────────────────────────── */}
        {p.status === 'review' && (
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--text-light)',
            }}
          >
            ⚠️ Sản phẩm này đang ở trạng thái <strong>review</strong> — chưa được hiển thị công khai.
            Thông số kỹ thuật có thể chưa đầy đủ.
          </div>
        )}

        {/* ── Read-only notice ─────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 20,
            padding: '10px 14px',
            background: 'rgba(100,116,139,0.06)',
            border: '1px solid rgba(100,116,139,0.15)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text-light)',
          }}
        >
          ℹ️ Trang chi tiết sản phẩm chỉ đọc. Tính năng chỉnh sửa sẽ được bổ sung khi backend có endpoint tương ứng.
        </div>
      </div>
    </div>
  );
}
