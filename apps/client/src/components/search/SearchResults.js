import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  Check,
  Eye,
  GitCompare,
  Layers,
  Package,
  Cpu,
  AlertTriangle,
  RefreshCw,
  WifiOff,
} from 'lucide-react';

import { FavoriteButton } from '../commerce/FavoriteButton';
import { AddToCartButton } from '../commerce/AddToCartButton';
import { formatPrice, getProductPrice } from '../../services/commercialService';

// ─── Parse a matched_feature string into a human-readable chip ────────────────
function parseFeatureChip(feature) {
  if (!feature) return null;
  const parts = feature.split(':');
  if (parts.length >= 2) {
    const type = parts[0];
    const rest = parts.slice(1).join(':');
    if (type === 'identity') {
      const subParts = rest.split(':');
      return subParts.length >= 2 ? `${capitalize(subParts[0])}: ${subParts.slice(1).join(':')}` : rest;
    }
    if (type === 'protocol') return `Protocol: ${rest}`;
    if (type === 'operating-temperature') return `Op. Temp: ${rest}`;
    if (type === 'measurement-temperature') return `Meas. Temp: ${rest}`;
    return `${capitalize(type)}: ${rest}`;
  }
  return feature;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ─── Mode label: only show when NOT hybrid (degraded state) ──────────────────
function ModeLabel({ mode }) {
  if (!mode || mode === 'hybrid') return null;
  const label = mode === 'keyword'
    ? 'Keyword search only (semantic unavailable)'
    : 'Semantic search only (keyword unavailable)';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--text-3, #888)',
        background: 'rgba(255,200,0,0.08)',
        border: '1px solid rgba(255,200,0,0.2)',
        borderRadius: 6,
        padding: '3px 10px',
        marginLeft: 8,
      }}
    >
      <AlertTriangle size={12} />
      {label}
    </div>
  );
}

export function SearchResults({
  query,
  results,
  mode,
  searchError,
  isLoading,
  onEditSearch,
  onViewDetail,
  onToggleCompare,
  isInCompare,
}) {
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = Array.from(new Set(results.map((p) => p.category).filter(Boolean)));

  const filteredResults = results.filter((p) => {
    if (filterCategory === 'All') return true;
    return p.category === filterCategory;
  });

  return (
    <div id="searchResults" style={{ display: 'block' }}>
      <div className="results-header">
        <div className="results-query-bar">
          <Search size={18} />
          <input type="text" value={query} readOnly />
          <button type="button" className="edit-btn" onClick={onEditSearch}>
            Edit
          </button>
        </div>

        {!isLoading && !searchError && (
          <div className="results-meta">
            <h2>
              <strong>{filteredResults.length}</strong> matching products
              <ModeLabel mode={mode} />
            </h2>
            <div className="results-filters">
              <button
                type="button"
                className={`filter-chip ${filterCategory === 'All' ? 'active' : ''}`}
                onClick={() => setFilterCategory('All')}
              >
                <Layers size={14} /> All ({results.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat === 'Sensors' ? <Package size={14} /> : <Cpu size={14} />} {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="results-list">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-line title" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line short" />
              <div className="skeleton-line" style={{ marginTop: '16px' }} />
              <div className="skeleton-line medium" />
            </div>
          ))
        ) : searchError ? (
          <div className="state-empty" style={{ margin: '40px auto', textAlign: 'center' }}>
            <div className="state-icon">
              {searchError.error === 'unavailable' ? (
                <WifiOff size={32} />
              ) : (
                <AlertTriangle size={32} />
              )}
            </div>
            <div className="state-title">
              {searchError.error === 'invalid_input' ? 'Invalid search query' : 'Search unavailable'}
            </div>
            <div className="state-desc">{searchError.message}</div>
            {searchError.error !== 'invalid_input' && (
              <button type="button" className="btn btn-primary" onClick={onEditSearch} style={{ marginTop: 16 }}>
                <RefreshCw size={16} /> Try again
              </button>
            )}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="state-empty" style={{ margin: '40px auto', textAlign: 'center' }}>
            <div className="state-title">No products found</div>
            <div className="state-desc">Try choosing "All" category or editing your search query.</div>
          </div>
        ) : (
          filteredResults.map((p) => {
            const inCompare = isInCompare(p.model);
            const features = p.matched_features || [];
            const price = p.price ?? getProductPrice(p.product_id, p.model);

            return (
              <article
                key={p.model}
                className="product-result-card"
                data-model={p.model}
                onClick={() => onViewDetail(p.model)}
                style={{ cursor: 'pointer' }}
                title={`Bấm để xem chi tiết ${p.model}`}
              >
                <div className="product-result-top">
                  <div className="product-result-img">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.model}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('.img-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="img-placeholder" style={{ display: p.image ? 'none' : 'flex' }}>
                      {p.model}
                    </div>
                  </div>

                  <div className="product-result-main">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="product-result-breadcrumb">
                        <span>{p.category}</span>
                        <ChevronRight size={14} />
                        <span>{p.subcategory}</span>
                      </div>
                      <FavoriteButton product={p} />
                    </div>
                    <div className="product-result-model">{p.model}</div>
                    <div className="product-result-name">{p.name}</div>
                    <div className="product-result-tags">
                      <span className="product-result-tag">{p.deviceType}</span>
                    </div>

                    {/* Commercial Price & Availability */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1, #fff)' }}>
                        {formatPrice(price, p.currency || 'USD')}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(0, 200, 115, 0.08)',
                          color: '#00c873',
                          border: '1px solid rgba(0, 200, 115, 0.2)',
                          fontWeight: 500,
                        }}
                      >
                        Available for order
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Matched Features (only when backend returns evidence) ── */}
                {features.length > 0 && (
                  <div className="ai-explanation">
                    <div className="label">
                      <Check size={14} />
                      Matched features
                    </div>
                    <div className="matched-specs">
                      {features.slice(0, 5).map((f) => (
                        <div key={f} className="matched-spec">
                          <Check size={13} />
                          {parseFeatureChip(f)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="product-result-actions" onClick={(e) => e.stopPropagation()}>
                  <AddToCartButton product={p} />
                  <button
                    type="button"
                    className="btn btn-secondary view-detail-btn"
                    onClick={() => onViewDetail(p.model)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                  <button
                    type="button"
                    className={`btn btn-secondary compare-btn ${inCompare ? 'btn-added' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare(p.model);
                    }}
                  >
                    {inCompare ? <Check size={16} /> : <GitCompare size={16} />}
                    {inCompare ? 'In Compare' : 'Add to Compare'}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
