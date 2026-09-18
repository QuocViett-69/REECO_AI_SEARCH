import React from 'react';
import {
  GitCompare,
  Search,
  Plus,
  RefreshCw,
  X,
  Trash2,
} from 'lucide-react';
import { products } from '../../data/products';

export function ProductCompare({
  compareList,
  onOpenAddModal,
  onOpenReplaceModal,
  onRemoveFromCompare,
  onClearCompare,
  onNavigate,
}) {
  if (compareList.length === 0) {
    return (
      <section className="page active" id="page-compare">
        <div className="compare-header">
          <h1>Compare Products</h1>
          <p>
            Compare technical specifications and identify the key differences between two Campbell
            Scientific products.
          </p>
        </div>

        <div className="compare-empty">
          <div className="compare-empty-icon">
            <GitCompare size={36} />
          </div>
          <h3>No products selected</h3>
          <p>Add products from Search or Products to compare their specifications side by side.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate('search')}
          >
            <Search size={16} /> Start Searching
          </button>
        </div>
      </section>
    );
  }

  const productA = products.find((p) => p.model === compareList[0]) || null;
  const productB = compareList.length > 1 ? products.find((p) => p.model === compareList[1]) : null;

  // Compute comparison tables if both products exist
  let allGroups = [];
  let allKeys = {};
  let basicRows = [];

  if (productA && productB) {
    allGroups = Array.from(
      new Set([...Object.keys(productA.specs), ...Object.keys(productB.specs)])
    );

    allGroups.forEach((g) => {
      const keys = new Set([
        ...Object.keys(productA.specs[g] || {}),
        ...Object.keys(productB.specs[g] || {}),
      ]);
      allKeys[g] = Array.from(keys);
    });

    basicRows = [
      { label: 'Category', a: productA.category, b: productB.category },
      { label: 'Subcategory', a: productA.subcategory, b: productB.subcategory },
      { label: 'Device Type', a: productA.deviceType, b: productB.deviceType },
      { label: 'Protocol', a: productA.protocol, b: productB.protocol },
    ];
  }

  return (
    <section className="page active" id="page-compare">
      <div className="compare-header">
        <h1>Compare Products</h1>
        <p>
          Compare technical specifications and identify the key differences between two Campbell
          Scientific products.
        </p>
      </div>

      <div id="compareContent">
        <div className="compare-selector">
          {/* Slot A */}
          <div className={`compare-slot ${productA ? 'filled' : ''}`}>
            <div className="compare-slot-label">Product A</div>
            {productA ? (
              <div className="compare-slot-product">
                <div className="compare-slot-img">
                  {productA.image ? (
                    <img
                      src={productA.image}
                      alt={productA.model}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="img-placeholder">{productA.model}</div>
                  )}
                </div>
                <div className="compare-slot-info">
                  <div className="model">{productA.model}</div>
                  <div className="name">{productA.name}</div>
                </div>
                <div className="compare-slot-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onOpenReplaceModal(0)}
                  >
                    <RefreshCw size={14} /> Replace
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => onRemoveFromCompare(productA.model)}
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="compare-slot-empty" onClick={() => onOpenAddModal(0)}>
                <Plus size={20} />
                <span>Select a product</span>
              </div>
            )}
          </div>

          <div className="compare-vs">
            <div className="compare-vs-badge">VS</div>
          </div>

          {/* Slot B */}
          <div className={`compare-slot ${productB ? 'filled' : ''}`}>
            <div className="compare-slot-label">Product B</div>
            {productB ? (
              <div className="compare-slot-product">
                <div className="compare-slot-img">
                  {productB.image ? (
                    <img
                      src={productB.image}
                      alt={productB.model}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="img-placeholder">{productB.model}</div>
                  )}
                </div>
                <div className="compare-slot-info">
                  <div className="model">{productB.model}</div>
                  <div className="name">{productB.name}</div>
                </div>
                <div className="compare-slot-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onOpenReplaceModal(1)}
                  >
                    <RefreshCw size={14} /> Replace
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => onRemoveFromCompare(productB.model)}
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="compare-slot-empty" onClick={() => onOpenAddModal(1)}>
                <Plus size={20} />
                <span>Select a product</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Comparison Table */}
        {productA && productB && (
          <>
            <div className="compare-table">
              <div className="compare-table-title">Basic Information</div>
              {basicRows.map((r) => {
                const diff = r.a !== r.b;
                return (
                  <div key={r.label} className={`compare-row ${diff ? 'highlight-diff' : ''}`}>
                    <div className="label">{r.label}</div>
                    <div className="val-a">{r.a}</div>
                    <div className="val-b">{r.b}</div>
                  </div>
                );
              })}
            </div>

            {allGroups.map((group) => {
              const keys = allKeys[group] || [];
              return (
                <div key={group} className="compare-table">
                  <div className="compare-table-title">{group}</div>
                  {keys.map((key) => {
                    const valA = productA.specs[group]?.[key];
                    const valB = productB.specs[group]?.[key];
                    const diff = valA !== valB;
                    return (
                      <div key={key} className={`compare-row ${diff ? 'highlight-diff' : ''}`}>
                        <div className="label">{key}</div>
                        <div className={`val-a ${!valA ? 'val-missing' : ''}`}>{valA || '—'}</div>
                        <div className={`val-b ${!valB ? 'val-missing' : ''}`}>{valB || '—'}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}

        {compareList.length > 0 && (
          <div className="compare-actions-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearCompare}
            >
              <Trash2 size={16} /> Clear Compare
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
