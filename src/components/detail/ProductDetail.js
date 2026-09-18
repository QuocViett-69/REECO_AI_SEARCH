import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Folder,
  Tag,
  Radio,
  User,
  ShoppingCart,
  GitCompare,
  Check,
  ExternalLink,
  Loader,
  Activity,
  Zap,
  Globe,
} from 'lucide-react';
import { getProductDetailApi } from '../../services/api';

export function ProductDetail({
  model,
  previousPage,
  onBack,
  onToggleCompare,
  isInCompare,
  onSelectProduct,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [quantity, setQuantity] = useState(1);
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
  const specRows = Object.values(product.specs).flatMap((s) => Object.entries(s));

  // Build benefits dynamically from API data
  const benefits = [
    ...(product.measurements?.map((m) => `Measures ${m.label_en}`) || []),
    ...(product.capabilities?.map((c) => c.label_en || c.key) || []),
    `${product.deviceType} designed for ${product.subcategory} applications`,
    product.protocol && `Supports ${product.protocol} communication interface`,
    'Low power consumption for remote deployments',
    'Rugged construction for harsh environments',
  ].filter(Boolean).slice(0, 6);

  const tabs = ['overview', 'technical', 'benefits', 'specs', 'accessories', 'resources'];

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
            <span className="badge badge-primary">
              <Folder size={14} /> {product.category}
            </span>
            <span className="badge badge-success">
              <Tag size={14} /> {product.subcategory}
            </span>
            {product.protocol && (
              <span className="badge badge-neutral">
                <Radio size={14} /> {product.protocol}
              </span>
            )}
            {product.measurements?.map((m) => (
              <span key={m.key} className="badge badge-neutral" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <Activity size={14} /> {m.label_en}
              </span>
            ))}
          </div>

          <div className="pricing-box">
            <div className="pricing-label">PRICING</div>
            <div className="pricing-signin">
              <User size={15} />
              Sign in for pricing
            </div>
            <div className="pricing-row">
              <input
                type="number"
                className="qty-input"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
              <button
                type="button"
                className="add-to-quote-btn"
                onClick={() => alert(`Added ${quantity} x ${product.model} to quote request!`)}
              >
                <ShoppingCart size={15} />
                ADD TO QUOTE
              </button>
            </div>
            <div className="pricing-meta">
              <div>
                <strong>Model:</strong> <span>{product.model}</span>
              </div>
              <div>
                <strong>Category:</strong> <span>{product.category}</span>
              </div>
              <div>
                <strong>Device Type:</strong> <span>{product.deviceType}</span>
              </div>
            </div>
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
              href={`https://www.campbellscientific.com/${product.model.toLowerCase()}`}
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
            className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Overview</h3>
            <p>
              The <strong>{product.model}</strong> is a{' '}
              <strong>{product.deviceType.toLowerCase()}</strong> from Campbell Scientific,
              designed for <strong>{product.subcategory.toLowerCase()}</strong> applications.
              {product.protocol && (
                <> It communicates via <strong>{product.protocol}</strong> and is built for reliable, long-term environmental monitoring deployments.</>
              )}
            </p>
            {product.applications?.length > 0 && (
              <>
                <h4 style={{ marginTop: 20, marginBottom: 10, fontSize: 14, fontWeight: 600 }}>Applications</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.applications.map((a) => (
                    <span key={a.key} className="badge badge-neutral" style={{ padding: '4px 12px' }}>
                      <Globe size={13} /> {a.label_en}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Technical Description</h3>
            {product.supported_protocols?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Supported Protocols:</strong>{' '}
                {product.supported_protocols.map((p) => p.key || p).join(', ')}
              </div>
            )}
            <p>
              Technical specifications include:{' '}
              {specRows.slice(0, 4).map(([k, v]) => `${k}: ${v}`).join('. ')}.
              The {product.model} is engineered for precise, repeatable measurements with low
              power consumption, making it ideal for remote, battery-operated installations.
            </p>
            {product.important_specifications?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 10, fontSize: 14, fontWeight: 600 }}>Key Specifications</h4>
                <table className="spec-table">
                  <tbody>
                    {product.important_specifications.map((spec) => (
                      <tr key={spec.canonical_key}>
                        <td>{spec.canonical_key}</td>
                        <td>{JSON.stringify(spec.normalized_value?.value ?? spec.normalized_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Benefits</h3>
            <div className="benefits-list">
              {benefits.map((b, i) => (
                <div key={i} className="benefit-item">
                  <Zap size={16} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'specs' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Specifications</h3>
            {specRows.length > 0 ? (
              <table className="spec-table">
                <tbody>
                  {specRows.map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v}</td>
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

      {activeTab === 'accessories' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Accessories</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
              Danh sách phụ kiện đang được cập nhật từ hệ thống.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="tab-content active">
          <div className="content-section">
            <h3>Resources</h3>
            {product.media?.filter((m) => m.product_url).length > 0 ? (
              <ul>
                {product.media
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
            ) : (
              <p>
                Manuals, datasheets, and technical notes available on the{' '}
                <a
                  href={`https://www.campbellscientific.com/${product.model.toLowerCase()}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary-accent)', fontWeight: 600 }}
                >
                  Campbell Scientific website
                </a>
                .
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
