import React from 'react';
import { X, Check } from 'lucide-react';
import { products } from '../../data/products';

export function ProductSelectorModal({
  isOpen,
  modalSlot,
  compareList,
  onClose,
  onSelectProduct,
}) {
  if (!isOpen) return null;

  const otherModel = compareList[1 - modalSlot];

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

        <div className="modal-body">
          {products.map((p) => {
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
                <div className="img">{p.model}</div>
                <div className="info">
                  <div className="model">{p.model}</div>
                  <div className="name">{p.name}</div>
                </div>
                <div className="check">
                  {selected && <Check size={18} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
