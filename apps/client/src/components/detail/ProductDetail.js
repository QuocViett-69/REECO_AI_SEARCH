import React, { useState, useEffect } from 'react';
import {
  CheckDisc,
  IconArrowLeft,
  IconArrowUpRight,
  IconCheck,
  IconCompare,
  IconHeart,
  IconMinus,
  IconPlus,
  Seal,
} from '../common/SkyIcons';
import { getProductDetailApi } from '../../services/api';
import { RecommendationRow } from '../commerce/RecommendationRow';
import { useCart } from '../../context/CartContext';
import { useFavorite } from '../../context/FavoriteContext';
import { groupSpecifications } from '../../services/specifications';
import { sizedImage } from '../../services/images';
import '../../styles/studio/discovery.css';
import '../../styles/studio/detail-sky.css';

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
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();

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
      <section className="page active st-page sd-page" id="page-detail">
        <div className="sd-loading" role="status">
          <span className="sd-spinner" aria-hidden="true" /> Loading {model}
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="page active st-page sd-page" id="page-detail">
        <div className="sd-empty" role="alert">
          <Seal glyph="alert" tone="coral" size={48} />
          <h1>{error || 'Product not found'}</h1>
          <button type="button" className="sd-btn sd-btn--primary" onClick={onBack}>
            <IconArrowLeft size={16} /> Go back
          </button>
        </div>
      </section>
    );
  }

  const inCompare = isInCompare(product.model);
  const favorite = isFavorite(product.product_id || product.id);
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
    { glyph: 'doc', tone: 'iris', title: 'Datasheet and specifications', desc: 'Official Campbell Scientific product page', href: productUrl, action: 'Open datasheet' },
    {
      glyph: 'book',
      tone: 'leaf',
      title: 'User manual',
      desc: 'Wiring, programming and calibration',
      href: `https://s.campbellsci.com/documents/us/manuals/${product.model.toLowerCase().replace(/[^a-z0-9]/g, '')}.pdf`,
      action: 'Open manual',
    },
    { glyph: 'plus', tone: 'coral', title: 'Installation guide', desc: 'Field installation and station setup', href: productUrl, action: 'Open guide' },
    ...(product.media || [])
      .filter((m) => m.product_url && m.product_url !== productUrl)
      .map((m) => ({
        glyph: 'down',
        tone: 'blue',
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

  const measurements = product.measurements || [];
  const assurances = [
    'Direct manufacturer warranty included',
    'Import customs & logistics handled by REECO',
    'Pay with VNPay or cash on delivery',
  ];

  return (
    <section className="page active st-page sd-page" id="page-detail">
      <div className="sd-top">
        <button type="button" className="sd-back" onClick={onBack}>
          <IconArrowLeft size={16} />
          {previousPage === 'search' ? 'Back to search results' : 'Back to products'}
        </button>
        <p className="sd-crumbs">
          <span>{product.category}</span>
          <span>{product.subcategory}</span>
        </p>
      </div>

      {/* Stage: the photo on a stack of paper sheets, the product summary as an invoice */}
      <section className="sd-stage" aria-labelledby="sd-model">
        <div className="sd-gallery">
          <span className="sd-sheet sd-sheet--far" aria-hidden="true" />
          <span className="sd-sheet sd-sheet--near" aria-hidden="true" />
          <figure className="sd-photo">
            <figcaption>
              <span className="sd-eyebrow">Product no</span>
              {product.model}
            </figcaption>
            <div className="sd-photo__plate">
              {product.image ? (
                <img
                  src={sizedImage(product.image, 1400)}
                  alt={`${product.model} ${product.name}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const placeholder = e.target.parentElement.querySelector('.sd-photo__fallback');
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="sd-photo__fallback" style={{ display: product.image ? 'none' : 'flex' }}>
                {product.model}
              </div>
            </div>
          </figure>
        </div>

        <div className="sd-invoice">
          <header className="sd-invoice__head">
            <div>
              <span className="sd-eyebrow">Model no</span>
              <h1 className="sd-model" id="sd-model">{product.model}</h1>
            </div>
            <span className="sd-status">
              <span className="sd-status__dot" aria-hidden="true" /> Available for order
            </span>
          </header>

          <p className="sd-name">{product.name}</p>

          <dl className="sd-parties">
            <div>
              <dt className="sd-eyebrow">Category</dt>
              <dd>
                <Seal glyph="bolt" tone="iris" size={36} />
                <strong>{product.category}</strong>
                <span>{product.subcategory}</span>
              </dd>
            </div>
            <div>
              <dt className="sd-eyebrow">Made by</dt>
              <dd>
                <Seal glyph="plus" tone="leaf" size={36} />
                <strong>Campbell Scientific</strong>
                <span>{product.deviceType}</span>
              </dd>
            </div>
          </dl>

          {(measurements.length > 0 || protocols.length > 0) && (
            <dl className="sd-lines">
              {measurements.length > 0 && (
                <div>
                  <dt>Measures</dt>
                  <dd>
                    {measurements.map((m) => (
                      <span key={m.key} className="sd-tag">{m.label_en}</span>
                    ))}
                  </dd>
                </div>
              )}
              {protocols.length > 0 && (
                <div>
                  <dt>Protocols</dt>
                  <dd>
                    {protocols.map((protocol) => (
                      <span key={protocol} className="sd-tag">{protocol}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="sd-buy">
            <div className="sd-qty" role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><IconMinus size={14} /></button>
              <span aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity"><IconPlus size={14} /></button>
            </div>
            <button
              type="button"
              className={`sd-btn sd-btn--primary ${justAdded ? 'is-added' : ''}`}
              onClick={() => {
                addToCart(cartItem, qty);
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 1500);
              }}
            >
              {justAdded ? <><IconCheck size={16} /> Added</> : 'Add to cart'}
            </button>
            <button
              type="button"
              className="sd-btn"
              onClick={() => {
                addToCart(cartItem, qty);
                if (onNavigate) onNavigate('checkout');
              }}
            >
              Buy now
            </button>
          </div>

          <div className="sd-secondary">
            <button
              type="button"
              className={`sd-chip-btn ${inCompare ? 'is-on' : ''}`}
              onClick={() => onToggleCompare(product.model)}
              aria-pressed={inCompare}
            >
              {inCompare ? <IconCheck size={15} /> : <IconCompare size={15} />}
              {inCompare ? 'In compare' : 'Compare'}
            </button>
            <button
              type="button"
              className={`sd-chip-btn sd-chip-btn--fav ${favorite ? 'is-on' : ''}`}
              onClick={() => toggleFavorite(cartItem)}
              aria-pressed={favorite}
            >
              <IconHeart size={15} filled={favorite} />
              {favorite ? 'Saved' : 'Save'}
            </button>
            <a href={productUrl} target="_blank" rel="noreferrer" className="sd-link">
              campbellsci.com <IconArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <ul className="sd-assure">
        {assurances.map((text) => (
          <li key={text}>
            <CheckDisc size={20} /> {text}
          </li>
        ))}
      </ul>

      <section className="sd-info" aria-label="Product information">
        <div className="sd-tabs" role="tablist" aria-label="Product information" onKeyDown={handleTabKey}>
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`pd-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={currentTab === tab}
              aria-controls="pd-panel"
              tabIndex={currentTab === tab ? 0 : -1}
              className="sd-tab"
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div id="pd-panel" className="sd-panel" role="tabpanel" aria-labelledby={`pd-tab-${currentTab}`} tabIndex={0}>
          {currentTab === 'overview' && (
            <div className="sd-overview">
              <div>
                <p className="sd-lead">
                  The <strong>{product.model}</strong> is a{' '}
                  {product.deviceType.toLowerCase()} from Campbell Scientific, designed for{' '}
                  {product.subcategory.toLowerCase()} applications.
                  {protocols.length > 0 && <> It supports {protocols.join(', ')} communication.</>}
                </p>
                {(product.applications || []).length > 0 && (
                  <div className="sd-apps">
                    <h3 className="sd-eyebrow">Applications</h3>
                    <ul>
                      {product.applications.map((a) => (
                        <li key={a.key} className="sd-tag">{a.label_en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <dl className="sd-facts">
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
                <p className="sd-note">Supported protocols: {protocols.join(', ')}</p>
              )}
              {(product.specifications || []).length > 0 ? (
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th scope="col">Specification</th>
                      <th scope="col">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupSpecifications(product.specifications).map((spec) => (
                      <tr key={spec.canonical_key}>
                        <th scope="row">{sentenceCase(spec.canonical_key)}</th>
                        <td>{spec.values.map((value, index) => <div key={index}>{value}</div>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="sd-note">No specifications are listed for this product yet.</p>
              )}
            </>
          )}

          {currentTab === 'capabilities' && (
            <ul className="sd-caps">
              {measurements.map((m) => (
                <li key={m.key}>
                  <Seal glyph="wave" tone="blue" size={32} />
                  <span>Measures {m.label_en.toLowerCase()}</span>
                </li>
              ))}
              {(product.capabilities || []).map((c) => (
                <li key={c.key}>
                  <Seal glyph="bolt" tone="iris" size={32} />
                  <span>{c.label_en || c.key}</span>
                </li>
              ))}
            </ul>
          )}

          {currentTab === 'variants' && (
            <table className="sd-table">
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
                      {variant.model}
                      {variant.is_representative ? <span className="sd-hint">Shown on this page</span> : null}
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
          )}

          {currentTab === 'resources' && (
            <ul className="sd-docs">
              {resources.map(({ glyph, tone, title, desc, href, action }) => (
                <li key={title}>
                  <Seal glyph={glyph} tone={tone} size={40} />
                  <div>
                    <div className="sd-docs__title">{title}</div>
                    <div className="sd-docs__desc">{desc}</div>
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="sd-link">
                    {action} <IconArrowUpRight size={14} />
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
