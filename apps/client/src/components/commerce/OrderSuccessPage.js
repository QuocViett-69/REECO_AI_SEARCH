import React, { useState, useEffect } from 'react';
import { orderService, formatCurrency } from '../../services/orderService';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
} from 'lucide-react';

export function OrderSuccessPage({ orderId, onNavigate }) {
  const effectiveOrderId =
    orderId ||
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('reeco_order_success_id') ||
        sessionStorage.getItem('reeco_last_order_id')
      : null);

  const [order, setOrder] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem('reeco_last_successful_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.id === effectiveOrderId || !effectiveOrderId)) {
            return parsed;
          }
        }
      }
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(Boolean(effectiveOrderId && !order));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!effectiveOrderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    if (!order) setLoading(true);
    setError(null);

    orderService
      .getOrderById(effectiveOrderId)
      .then((res) => {
        if (isMounted) {
          const fetched = res?.order || res;
          setOrder(fetched);
          try {
            if (typeof sessionStorage !== 'undefined' && fetched) {
              sessionStorage.setItem('reeco_last_successful_order', JSON.stringify(fetched));
            }
          } catch {}
        }
      })
      .catch((err) => {
        if (isMounted && !order) {
          setError(err.message || 'Unable to load order details from server.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveOrderId]);

  // 1. Loading state
  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 48, borderRadius: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid #e5e7eb',
              borderTopColor: '#0069e0',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
            Confirming order details...
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Retrieving verified total and status from REECO server.
          </p>
        </div>
      </div>
    );
  }

  // 2. Error state
  if (error) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ padding: 40, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <AlertCircle size={48} color="#d93025" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Unable to load order
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate('account-orders')}
              style={{ padding: '10px 24px', fontSize: 14, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
            >
              View My Orders
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate && onNavigate('products')}
              style={{ padding: '10px 24px', fontSize: 14, background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Data state
  const targetId = order?.id || order?.order_code || orderId;

  return (
    <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ padding: 40, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 16,
            borderRadius: '50%',
            background: 'rgba(15, 149, 84, 0.08)',
            color: '#0f9554',
            marginBottom: 20,
          }}
        >
          <CheckCircle2 size={48} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Order Placed Successfully!
        </h1>

        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Thank you for choosing REECO. Your order has been recorded in the system and is ready for calibration and dispatch.
        </p>

        {order && (
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              marginBottom: 28,
              textAlign: 'left',
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Order Code:</span>
              <span style={{ fontWeight: 700, color: '#0069e0', fontSize: 14 }}>
                {order.order_code || (order.order_number ? `REECO-${order.order_number}` : order.id)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Total (server verified):</span>
              <span style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>
                {formatCurrency(order.total)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Payment Method:</span>
              <span style={{ fontWeight: 600, color: '#111827' }}>
                {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'VNPay Sandbox'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Payment Status:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: order.payment_status === 'PAID' ? '#0f9554' : '#ffb020',
                }}
              >
                {order.payment_status}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {targetId && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate(`account-order:${targetId}`)}
              style={{
                padding: '12px 24px',
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: 9999,
                cursor: 'pointer',
              }}
            >
              <Package size={16} />
              <span>Track Order</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: 9999,
              cursor: 'pointer',
            }}
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
