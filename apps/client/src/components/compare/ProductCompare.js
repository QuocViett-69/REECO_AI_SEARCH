import '../../styles/studio/compare-login-admin.css';
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowClockwise,
  ArrowsLeftRight,
  CircleNotch,
  MagnifyingGlass,
  Plus,
  Trash,
  WarningCircle,
  X,
} from '../common/SkyIconSet';
import { getProductDetailApi } from '../../services/api';
import { buildSpecMap } from '../../services/specifications';
import { sizedImage } from '../../services/images';

function sentenceCase(key) {
  const text = key.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Loads one slot's product detail. Ignores responses for a model that is no longer in the
// slot, and reports a failed load (the API helper resolves null on error) instead of
// leaving the slot on "Loading" forever.
function useProductDetail(model) {
  const [state, setState] = useState({ model: null, detail: null, status: 'idle' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!model) {
      setState({ model: null, detail: null, status: 'idle' });
      return undefined;
    }
    let cancelled = false;
    setState({ model, detail: null, status: 'loading' });
    getProductDetailApi(model)
      .then((data) => {
        if (cancelled) return;
        setState({ model, detail: data || null, status: data ? 'ready' : 'error' });
      })
      .catch(() => {
        if (!cancelled) setState({ model, detail: null, status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [model, attempt]);

  const current = state.model === model ? state : { model, detail: null, status: model ? 'loading' : 'idle' };
  return { ...current, retry: () => setAttempt((n) => n + 1) };
}

export function ProductCompare({
  compareList,
  onOpenAddModal,
  onOpenReplaceModal,
  onRemoveFromCompare,
  onClearCompare,
  onNavigate,
}) {
  const slotA = useProductDetail(compareList[0]);
  const slotB = useProductDetail(compareList[1]);
  const detailA = slotA.detail;
  const detailB = slotB.detail;

  // The product row sticks under the navbar while the specs scroll; once it is stuck it
  // switches to a compact layout so it doesn't cover the table.
  const stickSentinel = useRef(null);
  const [productsStuck, setProductsStuck] = useState(false);
  const hasProducts = compareList.length > 0;

  useEffect(() => {
    const sentinel = stickSentinel.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;
    const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
    const observer = new IntersectionObserver(
      ([entry]) => setProductsStuck(!entry.isIntersecting && entry.boundingClientRect.top < navHeight),
      { rootMargin: `-${navHeight + 1}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasProducts]);

  const header = (
    <header className="st-header">
      <div className="st-header__title">
        <h1>Compare</h1>
      </div>
      <div className="st-header__aside">
        <p>
          Put two Campbell Scientific instruments side by side and see exactly where their
          specifications part ways.
        </p>
        {compareList.length > 0 && (
          <button type="button" className="st-btn st-btn--sm" onClick={onClearCompare}>
            <Trash size={14} aria-hidden="true" /> Clear compare
          </button>
        )}
      </div>
    </header>
  );

  if (compareList.length === 0) {
    return (
      <section className="page active st-page cx-page" id="page-compare">
        {header}
        <div className="st-state cx-empty">
          <div className="cx-empty__orbs" aria-hidden="true">
            <span className="st-orb st-orb--violet" />
            <span className="st-orb st-orb--ember" />
          </div>
          <h2 className="st-state__title">Nothing to compare yet</h2>
          <p className="st-state__desc">
            Add two products from search or the catalog, or pick them here, to line up their
            specifications.
          </p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => onOpenAddModal(0)}>
              <Plus size={16} aria-hidden="true" /> Choose a product
            </button>
            <button type="button" className="st-btn" onClick={() => onNavigate('search')}>
              <MagnifyingGlass size={16} aria-hidden="true" /> Search instruments
            </button>
          </div>
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
    { key: 'category', label: 'Category', a: detailA?.category, b: detailB?.category },
    { key: 'subcategory', label: 'Subcategory', a: detailA?.subcategory, b: detailB?.subcategory },
    { key: 'device_type', label: 'Device type', a: detailA?.deviceType, b: detailB?.deviceType },
    {
      key: 'protocols',
      label: 'Supported protocols',
      a: (detailA?.supported_protocols || []).join(', ') || '—',
      b: (detailB?.supported_protocols || []).join(', ') || '—',
    },
  ];

  const specRows = allCanonicalKeys.map((key) => ({
    key,
    label: sentenceCase(key),
    a: specMapA[key],
    b: specMapB[key],
  }));

  const bothReady = Boolean(detailA && detailB);

  const renderSlot = (slot, state) => {
    const model = compareList[slot];
    const { detail, status, retry } = state;

    if (!model) {
      return (
        <div className="cx-slot">
          <button type="button" className="cx-add" onClick={() => onOpenAddModal(slot)}>
            <span className="cx-add__icon" aria-hidden="true">
              <Plus size={20} />
            </span>
            <span className="cx-add__label">{slot === 0 ? 'Add a product' : 'Add a second product'}</span>
            <span className="cx-add__hint">Pick from the catalog</span>
          </button>
        </div>
      );
    }

    if (status === 'ready' && detail) {
      return (
        <div className="cx-slot">
          <div className="st-plate cx-slot__plate">
            {detail.image ? (
              <img src={sizedImage(detail.image, 640)} alt="" />
            ) : (
              <span className="st-plate__fallback">{detail.model}</span>
            )}
          </div>
          <div className="cx-slot__text">
            <p className="cx-slot__type">{detail.subcategory || detail.deviceType}</p>
            <h2 className="cx-slot__model">{detail.model}</h2>
            <p className="cx-slot__name">{detail.name}</p>
          </div>
          <div className="cx-slot__actions">
            <button
              type="button"
              className="st-btn st-btn--sm"
              onClick={() => onOpenReplaceModal(slot)}
              aria-label={`Replace ${detail.model}`}
            >
              <ArrowClockwise size={14} aria-hidden="true" /> Replace
            </button>
            <button
              type="button"
              className="st-btn st-btn--ghost st-btn--sm"
              onClick={() => onRemoveFromCompare(model)}
              aria-label={`Remove ${detail.model}`}
            >
              <X size={14} aria-hidden="true" /> Remove
            </button>
          </div>
        </div>
      );
    }

    const failed = status === 'error';
    return (
      <div className="cx-slot" aria-busy={!failed}>
        <div className="st-plate cx-slot__plate cx-slot__plate--status">
          <div className={`cx-slot__status ${failed ? 'is-error' : ''}`} role="status">
            {failed ? <WarningCircle size={18} aria-hidden="true" /> : <CircleNotch size={18} className="spin" aria-hidden="true" />}
            {failed ? 'Could not load details' : 'Loading details'}
          </div>
        </div>
        <div className="cx-slot__text">
          <h2 className="cx-slot__model">{model}</h2>
        </div>
        <div className="cx-slot__actions">
          {failed && (
            <button type="button" className="st-btn st-btn--sm" onClick={retry}>
              <ArrowClockwise size={14} aria-hidden="true" /> Try again
            </button>
          )}
          <button
            type="button"
            className="st-btn st-btn--ghost st-btn--sm"
            onClick={() => onRemoveFromCompare(model)}
            aria-label={`Remove ${model}`}
          >
            <X size={14} aria-hidden="true" /> Remove
          </button>
        </div>
      </div>
    );
  };

  const renderRows = (rows) => {
    return (
      <dl className="cx-rows">
        {rows.map((r) => {
          const diff = r.a !== r.b;
          return (
            <div key={r.key} className={`cx-row cx-grid ${diff ? 'is-diff' : ''}`}>
              <dt>
                {diff && <span className="cx-row__mark" aria-hidden="true" />}
                {r.label}
                {diff && <span className="sr-only"> (differs)</span>}
              </dt>
              <dd className={!r.a || r.a === '—' ? 'is-missing' : undefined}>
                <span className="cx-row__who">{detailA.model}</span>
                {r.a || '—'}
              </dd>
              <dd className={!r.b || r.b === '—' ? 'is-missing' : undefined}>
                <span className="cx-row__who">{detailB.model}</span>
                {r.b || '—'}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  };

  return (
    <section className="page active st-page cx-page" id="page-compare">
      {header}

      <div className="cx-board" id="compareContent">
        <div ref={stickSentinel} className="cx-sentinel" aria-hidden="true" />
        <div className={`cx-grid cx-products ${productsStuck ? 'is-stuck' : ''}`}>
          {renderSlot(0, slotA)}
          {renderSlot(1, slotB)}
          <span className="cx-vs" aria-hidden="true">vs</span>
        </div>

        {bothReady ? (
          <>
            <section className="cx-section" aria-labelledby="cx-basic-title">
              <h3 className="st-subheading cx-section__title" id="cx-basic-title">Basic information</h3>
              {renderRows(basicRows)}
            </section>
            {specRows.length > 0 && (
              <section className="cx-section" aria-labelledby="cx-spec-title">
                <h3 className="st-subheading cx-section__title" id="cx-spec-title">Technical specifications</h3>
                {renderRows(specRows)}
              </section>
            )}
          </>
        ) : compareList.length < 2 ? (
          <p className="st-note cx-hint">
            <ArrowsLeftRight size={16} aria-hidden="true" />
            Add one more product to see the specifications side by side.
          </p>
        ) : null}
      </div>
    </section>
  );
}
