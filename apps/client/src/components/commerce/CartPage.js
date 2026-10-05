import React from 'react';
import '../../styles/studio/commerce.css';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/commercialService';
import { sizedImage } from '../../services/images';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash,
  Truck,
} from '@phosphor-icons/react';

export function CartPage({ onNavigate }) {
  const { items, cartCount, cartSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="st-page st-page--narrow">
        <div className="cm-moment cm-moment--quiet">
          <span className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><ShoppingCart size={20} /></span>
          </span>
          <h1 className="cm-moment__title">Your cart is empty</h1>
          <p className="cm-moment__desc">
            Browse Campbell Scientific sensors and dataloggers, then add what your station needs.
          </p>
          <div className="cm-moment__actions">
            <button
              type="button"
              className="st-btn st-btn--primary st-btn--lg"
              onClick={() => onNavigate && onNavigate('products')}
            >
              Browse products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openDetail = (model) => onNavigate && onNavigate(`detail:${model}`);

  return (
    <div className="st-page">
      <header className="st-header">
        <div className="st-header__title">
          <h1>Cart</h1>
          <span className="cm-count" aria-hidden="true">{cartCount}</span>
        </div>
        <div className="st-header__aside">
          <p>
            {cartCount} {cartCount === 1 ? 'item' : 'items'} ready to order, imported directly from Campbell Scientific.
          </p>
          <button type="button" className="st-btn st-btn--ghost st-btn--sm" onClick={clearCart}>
            <Trash size={14} aria-hidden="true" /> Clear cart
          </button>
        </div>
      </header>

      <div className="cm-split">
        <ul className="cm-lines" aria-label="Cart items">
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;
            return (
              <li key={item.product_id} className="cm-line">
                <button
                  type="button"
                  className="cm-line__thumb"
                  onClick={() => openDetail(item.model)}
                  aria-label={`View ${item.model} details`}
                >
                  {item.image ? (
                    <img src={sizedImage(item.image, 320)} alt={item.model} />
                  ) : (
                    <span className="st-plate__fallback">{item.model}</span>
                  )}
                </button>

                <div className="cm-line__info">
                  <h2 className="cm-line__heading">
                    <button type="button" className="cm-line__model" onClick={() => openDetail(item.model)}>
                      {item.model}
                    </button>
                  </h2>
                  <p className="cm-line__name">{item.name}</p>
                  <p className="cm-line__unit">Unit price {formatPrice(item.price, item.currency)}</p>
                </div>

                <div className="cm-line__total">{formatPrice(lineTotal, item.currency)}</div>

                <div className="cm-line__controls">
                  <span className="st-status st-status--green">
                    {item.availability_label || 'Available for order'}
                  </span>
                  <div className="cm-line__actions">
                    <div className="st-qty st-qty--sm" role="group" aria-label={`Quantity for ${item.model}`}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="st-btn st-btn--ghost st-btn--sm"
                      onClick={() => removeFromCart(item.product_id)}
                      aria-label={`Remove ${item.model} from cart`}
                    >
                      <Trash size={14} aria-hidden="true" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="cm-aside">
          <div className="st-panel cm-summary">
            <h2 className="st-subheading">Order summary</h2>

            <div className="st-sum cm-summary__sum">
              <div className="st-sum__row">
                <span>Subtotal ({cartCount} items)</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="st-sum__row">
                <span>Fulfillment</span>
                <span>Official manufacturer import</span>
              </div>
              <div className="st-sum__total">
                <span>Estimated total</span>
                <strong>{formatPrice(cartSubtotal)}</strong>
              </div>
            </div>

            <div className="cm-summary__actions">
              <button
                type="button"
                className="st-btn st-btn--primary st-btn--lg st-btn--block"
                onClick={() => onNavigate && onNavigate('checkout')}
              >
                Proceed to checkout
              </button>
              <button
                type="button"
                className="st-btn st-btn--lg st-btn--block"
                onClick={() => onNavigate && onNavigate('products')}
              >
                <ArrowLeft size={15} aria-hidden="true" /> Continue shopping
              </button>
            </div>

            <ul className="cm-assurances">
              <li>
                <ShieldCheck size={16} aria-hidden="true" />
                <span>Direct manufacturer warranty included</span>
              </li>
              <li>
                <Truck size={16} aria-hidden="true" />
                <span>Full import customs &amp; logistics handled by REECO</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
