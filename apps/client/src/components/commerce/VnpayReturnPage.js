import React, { useState, useEffect } from 'react';
import { verifyVnpayReturn, createVnpayPaymentUrl } from '../../services/paymentService';
import { formatCurrency } from '../../services/orderService';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Package,
  ShoppingBag,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

export function VnpayReturnPage({ search: returnSearch, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const search = returnSearch ?? window.location.search ?? '';
        if (!search) {
          // Check if we have a saved payment result in session
          try {
            const saved = sessionStorage.getItem('reeco_last_payment_result');
            if (saved) {
              setResult(JSON.parse(saved));
              setLoading(false);
              return;
            }
          } catch {}
          setError('No return parameters found from VNPay gateway.');
          setLoading(false);
          return;
        }

        const res = await verifyVnpayReturn(search);
        setResult(res);
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('reeco_last_payment_result', JSON.stringify(res));
            if (res?.order?.id) {
              sessionStorage.setItem('reeco_last_order_id', res.order.id);
              sessionStorage.setItem('reeco_current_order_id', res.order.id);
            }
          }
        } catch {}
      } catch (err) {
        setError(err.message || 'Payment verification failed.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [returnSearch]);

  const handleRetryPayment = async () => {
    let orderId = result?.order?.id;
    if (!orderId && typeof sessionStorage !== 'undefined') {
      try {
        orderId =
          sessionStorage.getItem('reeco_last_order_id') ||
          JSON.parse(sessionStorage.getItem('reeco_active_payment') || '{}')?.orderId;
      } catch {}
    }
    if (!orderId) {
      alert('Order information not found for retry.');
      return;
    }

    try {
      setRetrying(true);
      const res = await createVnpayPaymentUrl(orderId);
      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        alert('Failed to obtain payment URL from VNPay. Please try again later.');
      }
    } catch (err) {
      alert(err.message || 'Unable to re-initiate payment transaction.');
    } finally {
      setRetrying(false);
    }
  };

  // 1. Loading state
  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 48, borderRadius: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid #e5e7eb',
              borderTopColor: '#0069e0',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Verifying VNPay transaction...
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Verifying checksum and updating order status. Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  const order = result?.order;
  const isSuccess = result?.success && (order?.payment_status === 'PAID' || result?.is_already_paid);

  // 2. Error or Payment Failed state
  if (error || !isSuccess) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ padding: 40, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 16,
              borderRadius: '50%',
              background: 'rgba(217, 48, 37, 0.08)',
              color: '#d93025',
              marginBottom: 20,
            }}
          >
            <XCircle size={48} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Payment Failed
          </h1>

          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            {error || result?.message || 'The VNPay transaction was cancelled or could not be completed.'}
          </p>

          {order && (
            <div style={{ padding: 16, borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 28, textAlign: 'left', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>Order Code:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{order.order_code || order.order_number || order.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>Amount:</span>
                <span style={{ fontWeight: 700, color: '#0069e0' }}>{formatCurrency(order.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Payment Status:</span>
                <span style={{ fontWeight: 700, color: '#d93025' }}>{order.payment_status}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {order && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={retrying}
                onClick={handleRetryPayment}
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#0069e0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 9999,
                  cursor: retrying ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
                <span>{retrying ? 'Initiating...' : 'Pay Again'}</span>
              </button>
            )}

            {order && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate && onNavigate(`account-order:${order.id || order.order_code}`)}
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
                <Package size={16} />
                <span>View Order Details</span>
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

  // 3. Success state
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

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Payment Successful!
        </h1>

        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
          {result?.message || 'Your transaction has been successfully confirmed by the VNPay gateway.'}
        </p>

        {order && (
          <div style={{ padding: 20, borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 28, textAlign: 'left', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Order Code:</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{order.order_code || order.order_number}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Total Paid:</span>
              <span style={{ fontWeight: 700, color: '#0f9554', fontSize: 15 }}>{formatCurrency(order.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Order Status:</span>
              <span style={{ fontWeight: 600, color: '#00d2ff' }}>{order.status}</span>
            </div>
            {order.vnpay_transaction_no && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>VNPay Transaction No:</span>
                <span style={{ fontFamily: 'monospace', color: '#535862' }}>{order.vnpay_transaction_no}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {order && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate(`account-order:${order.id || order.order_code}`)}
              style={{
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
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
              <span>View Order Details</span>
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

export default VnpayReturnPage;
