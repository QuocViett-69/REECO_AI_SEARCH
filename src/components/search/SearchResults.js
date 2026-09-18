import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  Sparkles,
  Check,
  Eye,
  GitCompare,
  Layers,
  Package,
  Cpu,
} from 'lucide-react';
import { generateExplanation } from '../../data/searchEngine';

export function SearchResults({
  query,
  results,
  isLoading,
  onEditSearch,
  onViewDetail,
  onToggleCompare,
  isInCompare,
}) {
  const [filterCategory, setFilterCategory] = useState('All');

  // Lấy danh sách category động từ kết quả tìm kiếm
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

        {!isLoading && (
          <div className="results-meta">
            <h2>
              <strong>{filteredResults.length}</strong> matching products
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
        ) : filteredResults.length === 0 ? (
          <div className="state-empty" style={{ margin: '40px auto', textAlign: 'center' }}>
            <div className="state-title">No products found</div>
            <div className="state-desc">Try choosing "All" category or editing your search query.</div>
          </div>
        ) : (
          filteredResults.map((p) => {
            const circumference = 2 * Math.PI * 28;
            const score = p.score || 70;
            const offset = circumference - (score / 100) * circumference;
            // Hỗ trợ cả format API (không có specs) và format cũ (có specs)
            const specsObj = p.specs || {};
            const allSpecs = Object.values(specsObj).flatMap((s) => Object.entries(s));
            const topSpecs = allSpecs.slice(0, 4);
            const inCompare = isInCompare(p.model);

            return (
              <article key={p.model} className="product-result-card" data-model={p.model}>
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
                    <div className="product-result-breadcrumb">
                      <span>{p.category}</span>
                      <ChevronRight size={14} />
                      <span>{p.subcategory}</span>
                    </div>
                    <div className="product-result-model">{p.model}</div>
                    <div className="product-result-name">{p.name}</div>
                    <div className="product-result-tags">
                      <span className="product-result-tag">{p.deviceType}</span>
                      <span className="product-result-tag protocol">{p.protocol}</span>
                    </div>
                  </div>

                  <div className="match-badge">
                    <div className="match-circle">
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle className="bg" cx="32" cy="32" r="28" fill="none" strokeWidth="5" />
                        <circle
                          className="fg"
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          strokeWidth="5"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                        />
                      </svg>
                      <div className="match-value">{score}%</div>
                    </div>
                    <div className="match-label">Match</div>
                  </div>
                </div>

                <div className="ai-explanation">
                  <div className="label">
                    <Sparkles size={16} />
                    Why this matches
                  </div>
                  <div className="text">{generateExplanation(p, p.requirements || [])}</div>
                  <div className="matched-specs">
                    {(p.requirements || []).slice(0, 3).map((r) => (
                      <div key={r} className="matched-spec">
                        <Check size={14} />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="product-result-specs">
                  {topSpecs.map(([k, v]) => (
                    <div key={k} className="spec-item">
                      <div className="spec-label">{k}</div>
                      <div className="spec-value">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="product-result-actions">
                  <button
                    type="button"
                    className="btn btn-primary view-detail-btn"
                    onClick={() => onViewDetail(p.model)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                  <button
                    type="button"
                    className={`btn btn-secondary compare-btn ${inCompare ? 'btn-added' : ''}`}
                    onClick={() => onToggleCompare(p.model)}
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
