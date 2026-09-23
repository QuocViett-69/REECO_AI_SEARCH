import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/commercialService';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

export function CartPage({ onNavigate }) {
  const { items, cartCount, cartSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '60px 20px', borderRadius: 16 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 20,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--text-3, #777)',
              marginBottom: 20,
            }}
          >
            <ShoppingCart size={48} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-1, #fff)', marginBottom: 8 }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, maxWidth: 420, margin: '0 auto 28px' }}>
            Explore our curated catalog of Campbell Scientific measurement sensors and dataloggers.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1080, margin: '40px auto', padding: '0 20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1, #fff)', margin: '0 0 6px' }}>
            Shopping Cart
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3, #888)', margin: 0 }}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for ordering from authorized manufacturers
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-3, #888)',
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;
            return (
              <div
                key={item.product_id}
                className="glass-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr auto',
                  gap: 20,
                  padding: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.model}
                      style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--text-3, #666)' }}>No Image</div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--accent, #00d2ff)',
                        letterSpacing: 0.5,
                      }}
                    >
                      {item.model}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(0, 200, 115, 0.08)',
                        color: '#00c873',
                        border: '1px solid rgba(0, 200, 115, 0.2)',
                      }}
                    >
                      {item.availability_label || 'Available for order'}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--text-1, #fff)',
                      margin: '0 0 8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => onNavigate && onNavigate(`detail:${item.model}`)}
                  >
                    {item.name}
                  </h3>
                  <div style={{ fontSize: 14, color: 'var(--text-2, #ccc)', fontWeight: 500 }}>
                    Unit Price: {formatPrice(item.price, item.currency)}
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1, #fff)' }}>
                    {formatPrice(lineTotal, item.currency)}
                  </div>

                  {/* Quantity Selector */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: 2,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-2, #ccc)',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      style={{
                        minWidth: 32,
                        textAlign: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#fff',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-2, #ccc)',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product_id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-3, #777)',
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff6b6b')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3, #777)')}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div
          className="glass-card"
          style={{
            padding: 24,
            borderRadius: 16,
            position: 'sticky',
            top: 90,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1, #fff)', margin: '0 0 16px' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: 'var(--text-3, #888)' }}>
            <span>Subtotal ({cartCount} items)</span>
            <span style={{ color: 'var(--text-1, #fff)', fontWeight: 600 }}>{formatPrice(cartSubtotal)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14, color: 'var(--text-3, #888)' }}>
            <span>Fulfillment</span>
            <span style={{ color: '#00c873', fontWeight: 500 }}>Official Manufacturer Import</span>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontSize: 18, fontWeight: 700, color: 'var(--text-1, #fff)' }}>
            <span>Estimated Total</span>
            <span style={{ color: 'var(--accent, #00d2ff)' }}>{formatPrice(cartSubtotal)}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('checkout')}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 8,
            }}
          >
            <ArrowLeft size={14} /> Continue Shopping
          </button>

          {/* Guarantees */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: 'var(--text-3, #777)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#00c873" />
              <span>Direct manufacturer warranty included</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={16} color="var(--accent, #00d2ff)" />
              <span>Full import customs & logistics handled by REECO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
