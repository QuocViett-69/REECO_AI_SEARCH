import React from 'react';
import { CheckCircle2, ArrowRight, Package, ShoppingBag } from 'lucide-react';

export function OrderSuccessPage({ orderId, onNavigate }) {
  return (
    <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: 40, borderRadius: 16, border: '1px solid rgba(0, 200, 115, 0.25)' }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(0, 200, 115, 0.1)', color: '#00c873', marginBottom: 20 }}>
          <CheckCircle2 size={48} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1, #fff)', marginBottom: 8 }}>
          Official Order Placed Successfully!
        </h1>
        <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 8 }}>
          Thank you for choosing REECO. Your order has been registered for factory processing and import logistics.
        </p>
        {orderId && (
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 6, background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent, #00d2ff)', fontWeight: 700, fontSize: 15, marginBottom: 28 }}>
            Order #{orderId}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {orderId && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate(`account-order:${orderId}`)}
              style={{ padding: '12px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Package size={16} />
              <span>Track Order Details</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '12px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ShoppingBag size={16} />
            <span>Browse Products</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
