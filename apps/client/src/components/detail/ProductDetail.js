import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Folder,
  Tag,
  Radio,
  GitCompare,
  Check,
  ExternalLink,
  Loader,
  Activity,
  Globe,
  Zap,
} from 'lucide-react';
import { getProductDetailApi } from '../../services/api';

// ─── Format normalized spec value for display ─────────────────────────────────
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
  if (val.type === 'boolean') {
    return val.value ? 'Yes' : 'No';
  }
  return String(val.value ?? '—');
}

export function ProductDetail({
  model,
  previousPage,
  onBack,
  onToggleCompare,
  isInCompare,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setProduct(null);
    setActiveTab('overview');

    getProductDetailApi(model)
      .then((data) => {
        if (data) {
          setProduct(data);
        } else {
          setError('Không tìm thấy sản phẩm này.');
        }
      })
      .catch(() => setError('Lỗi kết nối API.'))
      .finally(() => setIsLoading(false));
  }, [model]);

  if (isLoading) {
    return (
      <section className="page active">
        <div className="state-empty" style={{ margin: '80px auto' }}>
          <div className="state-icon">
            <Loader size={36} className="spin" />
          </div>
          <div className="state-title">Đang tải sản phẩm...</div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="page active">
        <div className="state-empty" style={{ margin: '60px auto' }}>
          <div className="state-title">{error || 'Product not found'}</div>
          <button type="button" className="btn btn-primary" onClick={onBack} style={{ marginTop: 16 }}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </section>
    );
  }

  const inCompare = isInCompare(product.model);

  // ── Protocols: supported_protocols is a string array ─────────────────────────
  const protocols = product.supported_protocols || [];

  // ── Tabs: only show tabs that have real data ──────────────────────────────────
  const hasOverview = true;
  const hasTechnical = (product.important_specifications || []).length > 0 || protocols.length > 0;
  const hasCapabilities = (product.measurements || []).length > 0 || (product.capabilities || []).length > 0;
  const hasSpecs = (product.specifications || []).length > 0;
  const hasResources = (product.media || []).filter((m) => m.product_url).length > 0;

  const tabs = [
    hasOverview && 'overview',
    hasTechnical && 'technical',
    hasCapabilities && 'capabilities',
    hasSpecs && 'specs',
    hasResources && 'resources',
  ].filter(Boolean);

  // Ensure activeTab is valid after product loads
  const currentTab = tabs.includes(activeTab) ? activeTab : tabs[0] || 'overview';

  // Product URL from media (if available)
  const productUrl = (product.media || []).find((m) => m.product_url)?.product_url
    || `https://www.campbellsci.com/${product.model.toLowerCase()}`;

  return (
    <section className="page active" id="page-detail">
      <div className="detail-back" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>{previousPage === 'search' ? 'Back to search' : 'Back to products'}</span>
      </div>

      <div className="detail-header">
        <div className="detail-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.model}
              style={{
                maxWidth: '100%',
                maxHeight: '320px',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const placeholder = e.target.parentElement.querySelector('.img-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="img-placeholder"
            style={{ fontSize: '36px', display: product.image ? 'none' : 'flex' }}
          >
            {product.model}
          </div>
        </div>

        <div className="detail-info">
          <div>
            <div className="detail-breadcrumb">
              <span>{product.category}</span>
              <ChevronRight size={14} />
              <span>{product.subcategory}</span>
            </div>
            <div className="detail-model">{product.model}</div>
            <div className="detail-name">{product.name}</div>
          </div>

          <div className="detail-badges">
            <span className="badge badge-category">
              <Folder size={14} /> {product.category}
            </span>
            <span className="badge badge-subcategory">
              <Tag size={14} /> {product.subcategory}
            </span>
            {protocols.map((pr) => (
              <span key={pr} className="badge badge-protocol">
                <Radio size={14} /> {pr}
              </span>
            ))}
            {(product.measurements || []).map((m) => (
              <span key={m.key} className="badge badge-measurement">
                <Activity size={14} /> {m.label_en}
              </span>
            ))}
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className={`btn ${inCompare ? 'btn-added' : 'btn-primary'}`}
              onClick={() => onToggleCompare(product.model)}
            >
              {inCompare ? <Check size={16} /> : <GitCompare size={16} />}
              <span>{inCompare ? 'In Compare' : 'Add to Compare'}</span>
            </button>
            <a
              href={productUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> View on Website
            </a>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="detail-tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`detail-tab ${currentTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────────── */}
      {currentTab === 'overview' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Overview</h3>
            <p>
              The <strong>{product.model}</strong> is a{' '}
              <strong>{product.deviceType.toLowerCase()}</strong> from Campbell Scientific,
              designed for <strong>{product.subcategory.toLowerCase()}</strong> applications.
              {protocols.length > 0 && (
                <> It supports <strong>{protocols.join(', ')}</strong> communication interface(s).</>
              )}
            </p>
            {(product.applications || []).length > 0 && (
              <>
                <h4 style={{ marginTop: 20, marginBottom: 10, fontSize: 14, fontWeight: 600 }}>Applications</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.applications.map((a) => (
                    <span key={a.key} className="badge badge-application">
                      <Globe size={13} /> {a.label_en}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Technical ─────────────────────────────────────────────────────────── */}
      {currentTab === 'technical' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Technical Specifications</h3>
            {protocols.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Supported Protocols:</strong>{' '}
                {protocols.join(', ')}
              </div>
            )}
            {(product.important_specifications || []).length > 0 ? (
              <table className="spec-table">
                <tbody>
                  {product.important_specifications.map((spec) => (
                    <tr key={spec.canonical_key}>
                      <td>{spec.canonical_key.replace(/_/g, ' ')}</td>
                      <td>{formatSpecValue(spec.normalized_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
                No key specifications available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Capabilities ─────────────────────────────────────────────────────── */}
      {currentTab === 'capabilities' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Capabilities &amp; Measurements</h3>
            <div className="benefits-list">
              {(product.measurements || []).map((m) => (
                <div key={m.key} className="benefit-item">
                  <Activity size={16} />
                  <span>Measures {m.label_en}</span>
                </div>
              ))}
              {(product.capabilities || []).map((c) => (
                <div key={c.key} className="benefit-item">
                  <Zap size={16} />
                  <span>{c.label_en || c.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Full Specs ───────────────────────────────────────────────────────── */}
      {currentTab === 'specs' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Specifications</h3>
            {(product.specifications || []).length > 0 ? (
              <table className="spec-table">
                <tbody>
                  {product.specifications.map((spec) => (
                    <tr key={spec.specification_id || spec.canonical_key}>
                      <td>{spec.canonical_key.replace(/_/g, ' ')}</td>
                      <td>{formatSpecValue(spec.normalized_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
                Thông số kỹ thuật chưa có trong cơ sở dữ liệu.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Resources ────────────────────────────────────────────────────────── */}
      {currentTab === 'resources' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Resources</h3>
            <ul>
              {(product.media || [])
                .filter((m) => m.product_url)
                .map((m, i) => (
                  <li key={i}>
                    <a href={m.product_url} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--primary-accent)', fontWeight: 600 }}>
                      {m.metadata?.title || `Resource ${i + 1}`}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
