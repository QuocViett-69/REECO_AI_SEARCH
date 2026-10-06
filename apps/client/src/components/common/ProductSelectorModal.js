import '../../styles/studio/compare-login-admin.css';
import React, { useState, useEffect, useRef } from 'react';
import { Check, CircleNotch, MagnifyingGlass, X } from './SkyIconSet';
import { getProductsApi } from '../../services/api';
import { sizedImage } from '../../services/images';

export function ProductSelectorModal({
  isOpen,
  modalSlot,
  compareList,
  onClose,
  onSelectProduct,
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    getProductsApi({ limit: 100 })
      .then((result) => {
        if (result && result.items) {
          setProducts(result.items);
        } else {
          setError('Could not load the product list.');
        }
      })
      .catch(() => setError('Could not connect to the product API.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  // Escape closes; Tab stays inside the dialog; focus returns to the opener on close
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll(
        'button:not(:disabled), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const otherModel = compareList[1 - modalSlot];
  const currentModel = compareList[modalSlot];

  const filtered = products.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.model.toLowerCase().includes(term) ||
      (p.name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div
      className="st-overlay cx-overlay"
      id="productModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="st-modal cx-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cx-modal-title"
        aria-describedby="cx-modal-sub"
        ref={dialogRef}
      >
        <div className="st-modal__head">
          <div>
            <h2 className="st-modal__title" id="cx-modal-title">
              {currentModel ? `Replace ${currentModel}` : 'Choose a product'}
            </h2>
            <p className="cx-modal__sub" id="cx-modal-sub">
              {otherModel
                ? `It will be compared with ${otherModel}.`
                : 'Pick the instrument to put in this column.'}
            </p>
          </div>
          <button type="button" className="st-btn st-btn--ghost st-btn--icon" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="cx-modal__search">
          <label className="st-search">
            <MagnifyingGlass size={18} aria-hidden="true" />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              placeholder="Model or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </label>
        </div>

        <div className="st-modal__body cx-modal__body">
          {isLoading ? (
            <div className="st-loading" role="status">
              <CircleNotch size={20} className="spin" aria-hidden="true" />
              Loading products
            </div>
          ) : error ? (
            <p className="st-note st-note--error" role="alert">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <p className="cx-modal__none" role="status">
              No products match "{search}". Check the model spelling.
            </p>
          ) : (
            <ul className="cx-options">
              {filtered.map((p) => {
                const selected = compareList[modalSlot] === p.model;
                const disabled = Boolean(otherModel && otherModel === p.model);

                return (
                  <li key={p.model}>
                    <button
                      type="button"
                      className={`cx-option ${selected ? 'is-selected' : ''}`}
                      disabled={disabled}
                      aria-current={selected ? 'true' : undefined}
                      onClick={() => {
                        if (!disabled) {
                          onSelectProduct(p.model);
                        }
                      }}
                    >
                      <span className="st-thumb">
                        {p.image ? (
                          <img
                            src={sizedImage(p.image, 160)}
                            alt=""
                            loading="lazy"
                            onError={(e) => { e.target.hidden = true; }}
                          />
                        ) : (
                          <span className="st-thumb__fallback">{p.model.slice(0, 4)}</span>
                        )}
                      </span>
                      <span className="cx-option__text">
                        <span className="cx-option__model">{p.model}</span>
                        <span className="cx-option__name">{p.name}</span>
                      </span>
                      {selected && <Check size={18} className="cx-option__check" aria-label="Current selection" />}
                      {disabled && <span className="st-tag">In compare</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
