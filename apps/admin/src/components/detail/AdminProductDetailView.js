import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Loader, AlertCircle, Radio, Tag, Folder, Edit3, Save, X, CheckCircle } from 'lucide-react';
import { getAdminProductDetailApi, setAdminProductPriceApi } from '../../services/api';
import { formatVnd } from '../../services/ordersApi';

// Shows the server's validation message for one field (ZodValidationPipe paths, e.g. "specifications.2.value").
function FieldError({ errors, name }) {
  if (!errors?.[name]) return null;
  return (
    <div role="alert" style={{ marginTop: 4, fontSize: 12, color: '#b91c1c' }}>
      {errors[name]}
    </div>
  );
}

const invalidBorder = (errors, name) => (errors?.[name] ? { borderColor: '#ef4444' } : null);

// '' means "no price"; otherwise a whole number of VND
export function parsePriceInput(value) {
  const text = String(value ?? '').replace(/[.,\s]/g, '');
  if (text === '') return { value: null };
  if (!/^\d+$/.test(text)) return { error: 'Giá phải là số nguyên VND (không âm).' };
  return { value: Number(text) };
}

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

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState(null);

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

  const handleOpenEdit = () => {
    if (!detail) return;
    setPriceInput(detail.price_vnd ?? '');
    setUpdateError(null);
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!detail || !detail.product) return;

    const price = parsePriceInput(priceInput);
    if (price.error) {
      setFieldErrors({ price_vnd: price.error });
      setUpdateError('Dữ liệu chưa hợp lệ, kiểm tra các ô được đánh dấu.');
      return;
    }

    setSaving(true);
    setUpdateError(null);
    setFieldErrors({});

    const res = price.value === null || price.value === detail.price_vnd
      ? detail
      : await setAdminProductPriceApi(detail.product.product_id, price.value);

    setSaving(false);

    if (res.error) {
      // supported_protocols.3 → the protocols input (one text box for the whole list)
      const errors = {};
      for (const [field, message] of Object.entries(res.fieldErrors || {})) {
        const key = field.startsWith('supported_protocols.') ? 'supported_protocols' : field;
        if (!errors[key]) errors[key] = message;
      }
      setFieldErrors(errors);
      const unplaced = Object.entries(errors).filter(([field]) => !document.getElementById(`field-${field}`));
      setUpdateError(
        res.error === 'validation'
          ? ['Dữ liệu không hợp lệ:', ...unplaced.map(([field, message]) => `${field === '_' ? '' : `${field}: `}${message}`)].join(' ')
          : res.message || 'Không thể lưu thay đổi.'
      );
    } else if (res.product) {
      setDetail(res);
      setIsEditing(false);
      setSuccessMsg('Đã lưu giá sản phẩm.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setUpdateError('Có lỗi xảy ra khi lưu dữ liệu.');
    }
  };

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

      {successMsg && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <CheckCircle size={18} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

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
            <button
              type="button"
              onClick={handleOpenEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--primary)',
                color: '#1e293b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Edit3 size={15} /> Sửa giá
            </button>

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
            <div className="info-label">Giá (VND)</div>
            <div className="info-value">{detail.price_vnd != null ? formatVnd(detail.price_vnd) : 'Chưa có giá'}</div>
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
            {importantSpecs.map((spec, index) => (
              <div key={`${spec.canonical_key}-${index}`} className="spec-row">
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
            {specifications.map((spec, index) => (
              <div key={spec.specification_id || `${spec.canonical_key}-${index}`} className="spec-row">
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

        {/* ── Edit notice ─────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 20,
            padding: '10px 14px',
            background: 'rgba(249,201,8,0.08)',
            border: '1px solid rgba(249,201,8,0.25)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text-dark)',
          }}
        >
          Nội dung catalog được khóa trong bản demo. Dùng nút <strong>"Sửa giá"</strong> để cập nhật giá sản phẩm.
        </div>
      </div>

      {/* ── Modal Edit Product ────────────────────────────────────────────────── */}
      <section className="content-panel" style={{ padding: 20, marginTop: 20 }}>
        <h2>Lịch sử chỉnh sửa giá sản phẩm</h2>
        <p style={{ fontSize: 12, color: 'var(--text-light)' }}>100 thay đổi gần nhất, ghi nhận từ khi bật lịch sử sửa giá.</p>
        {(detail.price_history || []).length === 0 ? <p>Chưa có thay đổi được ghi nhận.</p> : (
          <div style={{ overflowX: 'auto' }}><table className="data-table">
            <thead><tr><th>Thời gian</th><th>Người sửa</th><th>Giá cũ</th><th>Giá mới</th></tr></thead>
            <tbody>{detail.price_history.map(entry => (
              <tr key={entry.id}>
                <td>{new Date(entry.created_at).toLocaleString('vi-VN')}</td>
                <td>{entry.changed_by_email || entry.changed_by || 'Không ghi nhận người sửa'}</td>
                <td>{entry.old_price_vnd == null ? 'Chưa có giá' : formatVnd(Number(entry.old_price_vnd))}</td>
                <td>{formatVnd(Number(entry.new_price_vnd))}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      {isEditing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="price-dialog-title"
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: 680,
              maxWidth: '100%',
              maxHeight: '90vh',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafafa',
              }}
            >
              <h3 id="price-dialog-title" style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
                Sửa giá sản phẩm
              </h3>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEdit} style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              {updateError && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    color: '#991b1b',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{updateError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p role="note">Nội dung catalog được khóa trong bản demo. Bạn có thể sửa giá sản phẩm.</p>
                <label htmlFor="field-price_vnd">Giá (VND)</label>
                <input id="field-price_vnd" value={priceInput} onChange={(event) => setPriceInput(event.target.value)}
                  inputMode="numeric" style={invalidBorder(fieldErrors, 'price_vnd')} />
                <FieldError errors={fieldErrors} name="price_vnd" />

              </div>

              {/* Modal Footer */}
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 20px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#1e293b',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: saving ? 'wait' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <Loader size={15} className="spin" /> Đang lưu thay đổi...
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Lưu giá
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
