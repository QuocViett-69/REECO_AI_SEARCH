import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Search,
  Plus,
  RefreshCw,
  X,
  Trash2,
  Loader,
} from 'lucide-react';
import { getProductDetailApi } from '../../services/api';
import { buildSpecMap } from '../../services/specifications';

export function ProductCompare({
  compareList,
  onOpenAddModal,
  onOpenReplaceModal,
  onRemoveFromCompare,
  onClearCompare,
  onNavigate,
}) {
  const [detailA, setDetailA] = useState(null);
  const [detailB, setDetailB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Fetch detail for slot A whenever compareList[0] changes
  useEffect(() => {
    if (!compareList[0]) { setDetailA(null); return; }
    setLoadingA(true);
    getProductDetailApi(compareList[0])
      .then(setDetailA)
      .catch(() => setDetailA(null))
      .finally(() => setLoadingA(false));
  }, [compareList[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch detail for slot B whenever compareList[1] changes
  useEffect(() => {
    if (!compareList[1]) { setDetailB(null); return; }
    setLoadingB(true);
    getProductDetailApi(compareList[1])
      .then(setDetailB)
      .catch(() => setDetailB(null))
      .finally(() => setLoadingB(false));
  }, [compareList[1]]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Build spec comparison table from API data ─────────────────────────────────
  const specMapA = buildSpecMap(detailA?.specifications);
  const specMapB = buildSpecMap(detailB?.specifications);
  const allCanonicalKeys = Array.from(
    new Set([...Object.keys(specMapA), ...Object.keys(specMapB)])
  ).sort();

  const basicRows = [
    {
      label: 'Category',
      a: detailA?.category,
      b: detailB?.category,
    },
    {
      label: 'Subcategory',
      a: detailA?.subcategory,
      b: detailB?.subcategory,
    },
    {
      label: 'Device Type',
      a: detailA?.deviceType,
      b: detailB?.deviceType,
    },
    {
      label: 'Supported Protocols',
      a: (detailA?.supported_protocols || []).join(', ') || '—',
      b: (detailB?.supported_protocols || []).join(', ') || '—',
    },
  ];

  const renderSlot = (slot, detail, loading, model) => {
    if (loading) {
      return (
        <div className="compare-slot filled">
          <div className="compare-slot-label">{slot === 0 ? 'Product A' : 'Product B'}</div>
          <div className="compare-slot-product" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', gap: 8 }}>
            <Loader size={20} className="spin" /> Loading...
          </div>
        </div>
      );
    }
    if (detail) {
      return (
        <div className="compare-slot filled">
          <div className="compare-slot-label">{slot === 0 ? 'Product A' : 'Product B'}</div>
          <div className="compare-slot-product">
            <div className="compare-slot-img">
              {detail.image ? (
                <img
                  src={detail.image}
                  alt={detail.model}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div className="img-placeholder">{detail.model}</div>
              )}
            </div>
            <div className="compare-slot-info">
              <div className="model">{detail.model}</div>
              <div className="name">{detail.name}</div>
            </div>
            <div className="compare-slot-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onOpenReplaceModal(slot)}
              >
                <RefreshCw size={14} /> Replace
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onRemoveFromCompare(model)}
              >
                <X size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Slot selected but no data loaded yet
    if (model) {
      return (
        <div className="compare-slot filled">
          <div className="compare-slot-label">{slot === 0 ? 'Product A' : 'Product B'}</div>
          <div className="compare-slot-product">
            <div className="compare-slot-info">
              <div className="model">{model}</div>
              <div className="name" style={{ color: 'var(--text-3)', fontSize: 12 }}>Loading...</div>
            </div>
            <div className="compare-slot-actions">
              <button type="button" className="btn btn-ghost" onClick={() => onRemoveFromCompare(model)}>
                <X size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="compare-slot">
        <div className="compare-slot-label">{slot === 0 ? 'Product A' : 'Product B'}</div>
        <div className="compare-slot-empty" onClick={() => onOpenAddModal(slot)}>
          <Plus size={20} />
          <span>Select a product</span>
        </div>
      </div>
    );
  };

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
          {renderSlot(0, detailA, loadingA, compareList[0])}

          <div className="compare-vs">
            <div className="compare-vs-badge">VS</div>
          </div>

          {renderSlot(1, detailB, loadingB, compareList[1])}
        </div>

        {/* Detailed Comparison Table — only when both details are loaded */}
        {detailA && detailB && (
          <>
            <div className="compare-table">
              <div className="compare-table-title">Basic Information</div>
              {basicRows.map((r) => {
                const diff = r.a !== r.b;
                return (
                  <div key={r.label} className={`compare-row ${diff ? 'highlight-diff' : ''}`}>
                    <div className="label">{r.label}</div>
                    <div className="val-a">{r.a || '—'}</div>
                    <div className="val-b">{r.b || '—'}</div>
                  </div>
                );
              })}
            </div>

            {allCanonicalKeys.length > 0 && (
              <div className="compare-table">
                <div className="compare-table-title">Technical Specifications</div>
                {allCanonicalKeys.map((key) => {
                  const valA = specMapA[key];
                  const valB = specMapB[key];
                  const diff = valA !== valB;
                  return (
                    <div key={key} className={`compare-row ${diff ? 'highlight-diff' : ''}`}>
                      <div className="label">{key.replace(/_/g, ' ')}</div>
                      <div className={`val-a ${!valA ? 'val-missing' : ''}`} style={{ whiteSpace: 'pre-line' }}>{valA || '—'}</div>
                      <div className={`val-b ${!valB ? 'val-missing' : ''}`} style={{ whiteSpace: 'pre-line' }}>{valB || '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
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
