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
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { getProductDetailApi } from '../../services/api';
import { FavoriteButton } from '../commerce/FavoriteButton';
import { RecommendationRow } from '../commerce/RecommendationRow';
import { useCart } from '../../context/CartContext';

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
  onSelectProduct,
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setProduct(null);
    setActiveTab('overview');
    setQty(1);

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
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
            style={{ marginTop: 16 }}
          >
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
  const hasTechnical =
    (product.important_specifications || []).length > 0 || protocols.length > 0;
  const hasCapabilities =
    (product.measurements || []).length > 0 ||
    (product.capabilities || []).length > 0;
  const hasSpecs = (product.specifications || []).length > 0;
  const hasVariants = (product.variants || []).length > 1;
  const hasResources =
    (product.media || []).filter((m) => m.product_url).length > 0;

  const tabs = [
    hasOverview && 'overview',
    hasTechnical && 'technical',
    hasCapabilities && 'capabilities',
    hasVariants && 'variants',
    hasSpecs && 'specs',
    hasResources && 'resources',
  ].filter(Boolean);

  // Ensure activeTab is valid after product loads
  const currentTab = tabs.includes(activeTab)
    ? activeTab
    : tabs[0] || 'overview';

  // Product URL from media (if available)
  const productUrl =
    (product.media || []).find((m) => m.product_url)?.product_url ||
    `https://www.campbellsci.com/${product.model.toLowerCase()}`;

  return (
    <section className="page active" id="page-detail">
      <div className="detail-back" onClick={onBack}>
        <ArrowLeft size={16} />
        <span>
          {previousPage === 'search' ? 'Back to search' : 'Back to products'}
        </span>
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
                const placeholder =
                  e.target.parentElement.querySelector('.img-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="img-placeholder"
            style={{
              fontSize: '36px',
              display: product.image ? 'none' : 'flex',
            }}
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
            <span className="badge badge-primary">
              <Folder size={14} /> {product.category}
            </span>
            <span className="badge badge-success">
              <Tag size={14} /> {product.subcategory}
            </span>
            {protocols.map((pr) => (
              <span key={pr} className="badge badge-neutral">
                <Radio size={14} /> {pr}
              </span>
            ))}
            {(product.measurements || []).map((m) => (
              <span
                key={m.key}
                className="badge badge-neutral"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
              >
                <Activity size={14} /> {m.label_en}
              </span>
            ))}
          </div>

          {/* ── B. Commerce Purchase Panel ──────────────────────────────────── */}
          <div className="commerce-panel">
            <div className="commerce-panel__price-row">
              {product.price != null ? (
                <div className="commerce-panel__price">
                  ${product.price.toLocaleString()}
                  <span className="commerce-panel__currency">{product.currency || 'USD'}</span>
                </div>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Price available on order</div>
              )}
              <div className="availability-badge availability-badge--lg">
                <Tag size={12} /> Available for order
              </div>
            </div>

            <div className="commerce-panel__qty">
              <span style={{ fontSize: 13, color: 'var(--text-2)', marginRight: 8 }}>Qty:</span>
              <div className="qty-selector">
                <button type="button" className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease"><Minus size={14} /></button>
                <span className="qty-display" aria-live="polite">{qty}</span>
                <button type="button" className="qty-btn" onClick={() => setQty(q => q + 1)} aria-label="Increase"><Plus size={14} /></button>
              </div>
            </div>

            <div className="commerce-panel__actions">
              <button type="button" className="btn btn-cart" onClick={() => addToCart({ product_id: product.product_id, model: product.model, name: product.name, image: product.image, price: product.price, currency: product.currency }, qty)}>
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button type="button" className="btn btn-primary" onClick={() => { addToCart({ product_id: product.product_id, model: product.model, name: product.name, image: product.image, price: product.price, currency: product.currency }, qty); if (onNavigate) onNavigate('checkout'); }}>
                Buy Now
              </button>
              <FavoriteButton product={{ product_id: product.product_id, model: product.model, name: product.name, image: product.image, price: product.price, currency: product.currency }} size="lg" />
            </div>

            <button type="button" className={`btn ${inCompare ? 'btn-added' : 'btn-secondary'}`} onClick={() => onToggleCompare(product.model)} style={{ marginTop: 8 }}>
              {inCompare ? <Check size={16} /> : <GitCompare size={16} />}
              <span>{inCompare ? 'In Compare' : 'Add to Compare'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <a href={productUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: 13 }}>
              <ExternalLink size={15} /> View on Website
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
              <strong>{product.deviceType.toLowerCase()}</strong> from Campbell
              Scientific, designed for{' '}
              <strong>{product.subcategory.toLowerCase()}</strong> applications.
              {protocols.length > 0 && (
                <>
                  {' '}
                  It supports <strong>{protocols.join(', ')}</strong>{' '}
                  communication interface(s).
                </>
              )}
            </p>
            {(product.applications || []).length > 0 && (
              <>
                <h4
                  style={{
                    marginTop: 20,
                    marginBottom: 10,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Applications
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.applications.map((a) => (
                    <span
                      key={a.key}
                      className="badge badge-neutral"
                      style={{ padding: '4px 12px' }}
                    >
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
                <strong>Supported Protocols:</strong> {protocols.join(', ')}
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
      {currentTab === 'variants' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Available Variants</h3>
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Name</th>
                  <th>Configuration differences</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant.product_id}>
                    <td>
                      <strong>{variant.model}</strong>
                      {variant.is_representative ? ' (Representative)' : ''}
                    </td>
                    <td>{variant.product_name_en || '—'}</td>
                    <td>
                      {(variant.distinguishing_specifications || []).length > 0
                        ? variant.distinguishing_specifications
                            .map(
                              (specification) =>
                                `${specification.name_en}: ${specification.value_raw}`,
                            )
                            .join('; ')
                        : 'Same core specifications'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* ── Resources / Official Resources ───────────────────────────────────── */}
      {currentTab === 'resources' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3 style={{ marginBottom: 16 }}>Official Resources</h3>
            <p style={{ color: 'var(--text-3, #888)', fontSize: 13, marginBottom: 20 }}>
              Authorized technical documentation, brochures, and calibration manuals for {product.model}.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {/* Product Webpage / Datasheet */}
              {productUrl && (
                <div className="glass-card" style={{ padding: 18, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>📄</div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 4 }}>Product Datasheet &amp; Specs</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 16 }}>Official Campbell Scientific specification sheet</div>
                  </div>
                  <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                  >
                    <span>Open Datasheet</span> <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {/* User Manual */}
              <div className="glass-card" style={{ padding: 18, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>📘</div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 4 }}>User &amp; Operation Manual</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 16 }}>Comprehensive wiring, SDI-12 programming, and calibration guide</div>
                </div>
                <a
                  href={`https://s.campbellsci.com/documents/us/manuals/${product.model.toLowerCase().replace(/[^a-z0-9]/g, '')}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <span>Open Manual</span> <ExternalLink size={13} />
                </a>
              </div>

              {/* Installation & Mounting Guide */}
              <div className="glass-card" style={{ padding: 18, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>🛠</div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 4 }}>Installation Guide</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 16 }}>Field installation, sensor depth alignment &amp; station setup</div>
                </div>
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <span>Open Guide</span> <ExternalLink size={13} />
                </a>
              </div>

              {/* Media links if any */}
              {(product.media || [])
                .filter((m) => m.product_url && m.product_url !== productUrl)
                .map((m, i) => (
                  <div key={i} className="glass-card" style={{ padding: 18, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>💻</div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 4 }}>{m.metadata?.title || 'Firmware / Software'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 16 }}>Authorized support download</div>
                    </div>
                    <a
                      href={m.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
                    >
                      <span>Open Resource</span> <ExternalLink size={13} />
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── E. You May Also Need (AI Recommendations) ─────────────────────────── */}
      <div className="detail-recommendations">
        <RecommendationRow
          productId={product.product_id || product.id}
          model={product.model}
          onViewDetail={onSelectProduct}
        />
      </div>
    </section>
  );
}
