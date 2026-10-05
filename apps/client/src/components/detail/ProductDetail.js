import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowSquareOut,
  ArrowsLeftRight,
  BookOpen,
  Check,
  CircleNotch,
  CreditCard,
  DownloadSimple,
  FileText,
  Lightning,
  Minus,
  Plus,
  Pulse,
  SealCheck,
  ShoppingCart,
  Truck,
  Warning,
  Wrench,
} from '@phosphor-icons/react';
import { getProductDetailApi } from '../../services/api';
import { FavoriteButton } from '../commerce/FavoriteButton';
import { RecommendationRow } from '../commerce/RecommendationRow';
import { useCart } from '../../context/CartContext';
import { groupSpecifications } from '../../services/specifications';
import { formatPrice } from '../../services/commercialService';
import { sizedImage } from '../../services/images';
import '../../styles/studio/discovery.css';

const TAB_LABELS = {
  overview: 'Overview',
  technical: 'Specifications',
  capabilities: 'Capabilities',
  variants: 'Variants',
  resources: 'Documents',
};

function sentenceCase(key) {
  const text = key.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
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
          setError(`No product with model ${model} was found.`);
        }
      })
      .catch(() => setError('Could not connect to the product API. Try again in a moment.'))
      .finally(() => setIsLoading(false));
  }, [model]);

  if (isLoading) {
    return (
      <section className="page active st-page" id="page-detail">
        <div className="st-loading" role="status">
          <CircleNotch size={20} className="spin" aria-hidden="true" /> Loading {model}
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="page active st-page" id="page-detail">
        <div className="st-state" role="alert">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><Warning size={20} /></span>
          </div>
          <h1 className="st-state__title">{error || 'Product not found'}</h1>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={onBack}>
              <ArrowLeft size={16} /> Go back
            </button>
          </div>
        </div>
      </section>
    );
  }

  const inCompare = isInCompare(product.model);
  const protocols = product.supported_protocols || [];
  // Only show tabs that have real data
  const hasTechnical =
    (product.specifications || []).length > 0 || protocols.length > 0;
  const hasCapabilities =
    (product.measurements || []).length > 0 ||
    (product.capabilities || []).length > 0;
  const hasVariants = (product.variants || []).length > 1;
  const hasResources =
    (product.media || []).filter((m) => m.product_url).length > 0;

  const tabs = [
    'overview',
    hasTechnical && 'technical',
    hasCapabilities && 'capabilities',
    hasVariants && 'variants',
    hasResources && 'resources',
  ].filter(Boolean);

  const currentTab = tabs.includes(activeTab) ? activeTab : tabs[0];

  const productUrl =
    (product.media || []).find((m) => m.product_url)?.product_url ||
    `https://www.campbellsci.com/${product.model.toLowerCase()}`;

  const cartItem = {
    product_id: product.product_id,
    model: product.model,
    name: product.name,
    image: product.image,
    price: product.price,
    currency: product.currency,
  };

  const resources = [
    { icon: FileText, title: 'Datasheet and specifications', desc: 'Official Campbell Scientific product page', href: productUrl, action: 'Open datasheet' },
    {
      icon: BookOpen,
      title: 'User manual',
      desc: 'Wiring, programming and calibration',
      href: `https://s.campbellsci.com/documents/us/manuals/${product.model.toLowerCase().replace(/[^a-z0-9]/g, '')}.pdf`,
      action: 'Open manual',
    },
    { icon: Wrench, title: 'Installation guide', desc: 'Field installation and station setup', href: productUrl, action: 'Open guide' },
    ...(product.media || [])
      .filter((m) => m.product_url && m.product_url !== productUrl)
      .map((m) => ({
        icon: DownloadSimple,
        title: m.metadata?.title || 'Firmware and software',
        desc: 'Support download',
        href: m.product_url,
        action: 'Open download',
      })),
  ];

  const handleTabKey = (e) => {
    const index = tabs.indexOf(currentTab);
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (next) {
      e.preventDefault();
      setActiveTab(next);
      document.getElementById(`pd-tab-${next}`)?.focus();
    }
  };

  return (
    <section className="page active st-page" id="page-detail">
      <div className="pdp-top">
        <button type="button" className="st-back" onClick={onBack}>
          <ArrowLeft size={16} />
          {previousPage === 'search' ? 'Back to search results' : 'Back to products'}
        </button>
      </div>

      <section className="pdp-stage" aria-labelledby="pdp-model">
        <div className="pdp-gallery">
          <div className="st-plate pdp-plate">
            {product.image ? (
              <img
                src={sizedImage(product.image, 1400)}
                alt={`${product.model} ${product.name}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentElement.querySelector('.st-plate__fallback');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="st-plate__fallback" style={{ display: product.image ? 'none' : 'flex' }}>
              {product.model}
            </div>
          </div>
        </div>

        <div className="pdp-summary">
          <p className="pdp-path">
            <span>{product.category}</span>
            <span>{product.subcategory}</span>
          </p>
          <h1 className="pdp-model" id="pdp-model">{product.model}</h1>
          <p className="pdp-name">{product.name}</p>

          {(protocols.length > 0 || (product.measurements || []).length > 0) && (
            <dl className="pdp-chips">
              {(product.measurements || []).length > 0 && (
                <div>
                  <dt>Measures</dt>
                  <dd>
                    {product.measurements.map((m) => (
                      <span key={m.key} className="st-tag">{m.label_en}</span>
                    ))}
                  </dd>
                </div>
              )}
              {protocols.length > 0 && (
                <div>
                  <dt>Protocols</dt>
                  <dd>
                    {protocols.map((protocol) => (
                      <span key={protocol} className="st-tag">{protocol}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="pdp-buy">
            <div className="pdp-buy__head">
              <div className="pdp-buy__price">
                {product.price != null ? formatPrice(product.price, product.currency) : 'Price on request'}
              </div>
              <span className="st-status st-status--green">Available for order</span>
            </div>

            <div className="pdp-buy__row">
              <div className="st-qty" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><Minus size={14} /></button>
                <span aria-live="polite">{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
              </div>
              <button type="button" className="st-btn st-btn--primary" onClick={() => addToCart(cartItem, qty)}>
                <ShoppingCart size={16} /> Add to cart
              </button>
              <button
                type="button"
                className="st-btn pdp-buy__now"
                onClick={() => {
                  addToCart(cartItem, qty);
                  if (onNavigate) onNavigate('checkout');
                }}
              >
                Buy now
              </button>
            </div>

            <div className="pdp-buy__secondary">
              <button
                type="button"
                className={`st-btn st-btn--sm ${inCompare ? 'is-on' : ''}`}
                onClick={() => onToggleCompare(product.model)}
                aria-pressed={inCompare}
              >
                {inCompare ? <Check size={15} /> : <ArrowsLeftRight size={15} />}
                {inCompare ? 'In compare' : 'Add to compare'}
              </button>
              <FavoriteButton product={cartItem} className="st-btn--sm" size={15} showLabel />
              <a href={productUrl} target="_blank" rel="noreferrer" className="st-link">
                campbellsci.com <ArrowSquareOut size={14} />
              </a>
            </div>
          </div>

          <ul className="pdp-assure">
            <li><SealCheck size={18} aria-hidden="true" /> Direct manufacturer warranty included</li>
            <li><Truck size={18} aria-hidden="true" /> Import customs &amp; logistics handled by REECO</li>
            <li><CreditCard size={18} aria-hidden="true" /> Pay with VNPay or cash on delivery</li>
          </ul>
        </div>
      </section>

      <section className="pdp-info-block" aria-label="Product information">
        <div className="st-tabs pdp-tabs" role="tablist" aria-label="Product information" onKeyDown={handleTabKey}>
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`pd-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={currentTab === tab}
              aria-controls="pd-panel"
              tabIndex={currentTab === tab ? 0 : -1}
              className="st-tab"
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div id="pd-panel" className="pdp-panel" role="tabpanel" aria-labelledby={`pd-tab-${currentTab}`} tabIndex={0}>
          {currentTab === 'overview' && (
            <div className="pdp-prose">
              <div>
                <p className="pdp-prose__lead">
                  The <strong>{product.model}</strong> is a{' '}
                  {product.deviceType.toLowerCase()} from Campbell Scientific, designed for{' '}
                  {product.subcategory.toLowerCase()} applications.
                  {protocols.length > 0 && <> It supports {protocols.join(', ')} communication.</>}
                </p>
                {(product.applications || []).length > 0 && (
                  <div className="pdp-prose__apps">
                    <h3>Applications</h3>
                    <ul className="pdp-tags">
                      {product.applications.map((a) => (
                        <li key={a.key} className="st-tag st-tag--outline">{a.label_en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <dl className="st-dl pdp-facts">
                <div>
                  <dt>Model</dt>
                  <dd>{product.model}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{product.category}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{product.deviceType}</dd>
                </div>
                <div>
                  <dt>Manufacturer</dt>
                  <dd>Campbell Scientific</dd>
                </div>
              </dl>
            </div>
          )}

          {currentTab === 'technical' && (
            <>
              {protocols.length > 0 && (
                <p className="pdp-panel__note">
                  Supported protocols: {protocols.join(', ')}
                </p>
              )}
              {(product.specifications || []).length > 0 ? (
                <div className="st-table-wrap">
                  <table className="st-table pdp-specs">
                    <tbody>
                      {groupSpecifications(product.specifications).map((spec) => (
                        <tr key={spec.canonical_key}>
                          <th scope="row">{sentenceCase(spec.canonical_key)}</th>
                          <td>{spec.values.map((value, index) => <div key={index}>{value}</div>)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="pdp-panel__note">No specifications are listed for this product yet.</p>
              )}
            </>
          )}

          {currentTab === 'capabilities' && (
            <ul className="pdp-caps">
              {(product.measurements || []).map((m) => (
                <li key={m.key}>
                  <Pulse size={16} aria-hidden="true" /> Measures {m.label_en.toLowerCase()}
                </li>
              ))}
              {(product.capabilities || []).map((c) => (
                <li key={c.key}>
                  <Lightning size={16} aria-hidden="true" /> {c.label_en || c.key}
                </li>
              ))}
            </ul>
          )}

          {currentTab === 'variants' && (
            <div className="st-table-wrap">
              <table className="st-table pdp-specs">
                <thead>
                  <tr>
                    <th scope="col">Model</th>
                    <th scope="col">Name</th>
                    <th scope="col">Differences</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.product_id}>
                      <th scope="row">
                        <span className="st-mono">{variant.model}</span>
                        {variant.is_representative ? <span className="pdp-specs__hint">Shown on this page</span> : null}
                      </th>
                      <td>{variant.product_name_en || '—'}</td>
                      <td>
                        {(variant.distinguishing_specifications || []).length > 0
                          ? variant.distinguishing_specifications
                              .map((specification) => `${specification.name_en}: ${specification.value_raw}`)
                              .join('; ')
                          : 'Same core specifications'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {currentTab === 'resources' && (
            <ul className="pdp-docs">
              {resources.map(({ icon: Icon, title, desc, href, action }) => (
                <li key={title}>
                  <span className="pdp-docs__icon"><Icon size={20} aria-hidden="true" /></span>
                  <div>
                    <div className="pdp-docs__title">{title}</div>
                    <div className="pdp-docs__desc">{desc}</div>
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="st-link">
                    {action} <ArrowSquareOut size={14} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <RecommendationRow
        productId={product.product_id || product.id}
        model={product.model}
        onViewDetail={onSelectProduct}
      />
    </section>
  );
}
