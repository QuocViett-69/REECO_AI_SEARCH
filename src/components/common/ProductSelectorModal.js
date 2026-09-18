import React, { useState, useEffect } from 'react';
import { X, Check, Loader } from 'lucide-react';
import { getProductsApi } from '../../services/api';

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

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    getProductsApi({ limit: 100 })
      .then((result) => {
        if (result && result.items) {
          setProducts(result.items);
        } else {
          setError('Không thể tải danh sách sản phẩm.');
        }
      })
      .catch(() => setError('Lỗi kết nối API.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const otherModel = compareList[1 - modalSlot];

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
      className="modal-overlay open"
      id="productModal"
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Select a product</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Search box */}
        <div style={{ padding: '0 16px 12px' }}>
          <input
            type="text"
            placeholder="Search by model or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border, #ccc)',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
            autoFocus
          />
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
              <Loader size={24} className="spin" />
              <div style={{ marginTop: 8 }}>Loading products...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--danger, red)' }}>
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>
              No products found.
            </div>
          ) : (
            filtered.map((p) => {
              const selected = compareList[modalSlot] === p.model;
              const disabled = otherModel && otherModel === p.model;

              return (
                <div
                  key={p.model}
                  className={`modal-product-item ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!disabled) {
                      onSelectProduct(p.model);
                    }
                  }}
                >
                  <div className="img">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.model}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{p.model.slice(0, 4)}</span>
                    )}
                  </div>
                  <div className="info">
                    <div className="model">{p.model}</div>
                    <div className="name">{p.name}</div>
                  </div>
                  <div className="check">
                    {selected && <Check size={18} />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
