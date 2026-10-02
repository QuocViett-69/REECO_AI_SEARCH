import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, ORDER_STATUSES, SHIPPING_METHODS, formatCurrency } from '../../services/orderService';
import { createVnpayPaymentUrl } from '../../services/paymentService';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Building2,
  AlertCircle,
  MapPin,
  RefreshCw,
  XCircle,
  RotateCcw,
} from 'lucide-react';

export function OrderDetail({ orderId, onBack }) {
  const { user } = useAuth();
  const effectiveOrderId =
    orderId ||
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('reeco_current_order_id') ||
        sessionStorage.getItem('reeco_last_order_id')
      : null);

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Repay State
  const [isRepaying, setIsRepaying] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!effectiveOrderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(effectiveOrderId);
      const fetched = res?.order || res;
      setOrder(fetched);
      try {
        if (typeof sessionStorage !== 'undefined' && effectiveOrderId) {
          sessionStorage.setItem('reeco_current_order_id', effectiveOrderId);
        }
      } catch {}
    } catch (err) {
      setError(err.message || 'Unable to load order details.');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Cancel order
  const handleConfirmCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await orderService.cancelOrder(order.id, cancelReason);
      setCancelModalOpen(false);
      setCancelReason('');
      await fetchOrderDetail();
    } catch (err) {
      setCancelError(err.message || 'Unable to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Repay unpaid VNPay order
  const handleRepayVNPay = async () => {
    if (!order) return;
    setIsRepaying(true);
    try {
      const res = await createVnpayPaymentUrl(order.id);
      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        alert('Failed to obtain payment URL from VNPay gateway.');
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate VNPay payment retry.');
    } finally {
      setIsRepaying(false);
    }
  };

  const formatTimelineNote = (note) => {
    if (!note) return null;
    if (note.includes('Khởi tạo đơn hàng mới')) return 'New order initialized';
    if (note.includes('Thanh toán thành công qua cổng VNPay')) {
      return note.replace('Thanh toán thành công qua cổng VNPay (Mã giao dịch:', 'Payment successful via VNPay (Txn No:');
    }
    if (note.includes('Thanh toán thất bại')) {
      return note.replace('Thanh toán thất bại qua cổng VNPay', 'Payment failed via VNPay');
    }
    if (note.includes('Cập nhật bởi Quản trị viên lúc')) {
      return note.replace('Cập nhật bởi Quản trị viên lúc', 'Updated by Administrator at');
    }
    return note;
  };

  // 1. Loading state
  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 860, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
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
          <div style={{ color: '#6b7280', fontSize: 14 }}>Loading order details...</div>
        </div>
      </div>
    );
  }

  // 2. Error state
  if (error || !order) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <AlertCircle size={40} color="#d93025" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Order Unavailable
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            {error || 'Order could not be found in the system.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer', padding: '8px 16px' }}
            >
              <ArrowLeft size={14} /> Back to list
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchOrderDetail}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer', padding: '8px 16px' }}
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Data state
  const statusConfig = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: '#6b7280',
  };

  const createdDateStr = new Date(order.created_at).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const shippingInfo = SHIPPING_METHODS[order.shipping_method] || SHIPPING_METHODS.standard;
  const itemsList = order.order_items || order.items || [];
  const statusHistory = Array.isArray(order.order_status_history) ? order.order_status_history : [];

  // Điều kiện được hủy: đơn chưa bàn giao vận chuyển
  const canCancel = ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAID', 'PROCESSING'].includes(order.status);

  // Điều kiện thanh toán lại: phương thức VNPay và chưa PAID
  const canRepay =
    order.payment_method === 'vnpay' &&
    order.payment_status !== 'PAID' &&
    order.status !== 'CANCELLED';

  return (
    <div className="page-container" style={{ maxWidth: 940, margin: '40px auto', padding: '0 20px' }}>
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Back to Orders
      </button>

      {/* Header Bar */}
      <div
        className="glass-card"
        style={{
          padding: 24,
          borderRadius: 16,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
              {order.order_code || `REECO-${order.order_number}` || `#${order.id}`}
            </h1>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 6,
                background: `${statusConfig.color}15`,
                color: statusConfig.color,
                border: `1px solid ${statusConfig.color}30`,
              }}
            >
              {statusConfig.label}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Placed on {createdDateStr} • Tracking code: <code>{order.order_code}</code>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Repay Button */}
          {canRepay && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={isRepaying}
              onClick={handleRepayVNPay}
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#0069e0',
                color: '#fff',
                border: 'none',
                borderRadius: 9999,
                cursor: isRepaying ? 'not-allowed' : 'pointer',
              }}
            >
              <CreditCard size={15} />
              <span>{isRepaying ? 'Initiating payment...' : 'Pay Again'}</span>
            </button>
          )}

          {/* Cancel Order Button */}
          {canCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setCancelError(null);
                setCancelModalOpen(true);
              }}
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#fff',
                color: '#d93025',
                border: '1px solid #d93025',
                borderRadius: 9999,
                cursor: 'pointer',
              }}
            >
              <XCircle size={15} />
              <span>Cancel Order</span>
            </button>
          )}

          {order.estimated_delivery_from && (
            <div style={{ textAlign: 'right', paddingLeft: 8, borderLeft: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Estimated Delivery</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0069e0' }}>
                {order.estimated_delivery_from} → {order.estimated_delivery_to}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline from status_history */}
      <div className="glass-card" style={{ padding: 28, borderRadius: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} color="#0069e0" />
          <span>Order Status Timeline</span>
        </h2>

        {statusHistory.length === 0 ? (
          <div style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
            No status history recorded for this order yet.
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {statusHistory.map((h, idx) => {
                const hConfig = ORDER_STATUSES[h.status] || {
                  label: h.status,
                  color: '#0069e0',
                };
                const timeStr = new Date(h.created_at).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={h.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Node indicator */}
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: hConfig.color,
                        boxShadow: `0 0 0 4px ${hConfig.color}25`,
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    />

                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: 8, borderBottom: idx < statusHistory.length - 1 ? '1px dashed #f0f0f0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                          {hConfig.label}
                        </span>
                        <span style={{ fontSize: 12, color: '#93979f' }}>
                          {timeStr}
                        </span>
                      </div>
                      {(h.note || h.reason) && (
                        <div style={{ fontSize: 13, color: '#535862', marginTop: 2 }}>
                          {formatTimelineNote(h.note || h.reason)}
                        </div>
                      )}
                      {h.changed_by && (
                        <div style={{ fontSize: 11, color: '#93979f', marginTop: 2 }}>
                          Updated by: {h.changed_by}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Order Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left: Product Snapshots */}
        <div className="glass-card" style={{ padding: 24, borderRadius: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={18} color="#0069e0" />
            <span>Ordered Items ({itemsList.length})</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {itemsList.map((item, idx) => {
              const lineTotal = item.line_total || item.unit_price * item.quantity;
              return (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.model || item.product_name}
                        style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'contain', background: '#ffffff', padding: 4, border: '1px solid #e5e7eb' }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0069e0' }}>
                        {item.model || item.product_id}
                      </div>
                      <div style={{ fontSize: 12, color: '#535862', maxWidth: 360 }}>
                        {item.product_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        Unit price: {formatCurrency(item.unit_price)} × {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', textAlign: 'right' }}>
                    {formatCurrency(lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
              <span>Subtotal</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatCurrency(order.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
              <span>Shipping ({shippingInfo.name})</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatCurrency(order.shipping_fee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#111827', paddingTop: 10, borderTop: '1px dashed #e5e7eb' }}>
              <span>Total Amount</span>
              <span style={{ color: '#0069e0' }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Right: Customer & Logistics info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Shipping Destination */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} color="#0069e0" />
              <span>Shipping Address</span>
            </h3>
            <div style={{ fontSize: 13, color: '#535862', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, color: '#111827' }}>{order.customer_name}</div>
              <div>{order.customer_phone}</div>
              <div style={{ marginTop: 4 }}>{order.shipping_address}</div>
              <div>{order.city}{order.province ? `, ${order.province}` : ''}</div>
              <div>{order.country || 'Vietnam'}</div>
              {order.notes && (
                <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>
                  <strong>Note:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={16} color="#0069e0" />
              <span>Payment Details</span>
            </h3>

            <div style={{ fontSize: 13, color: '#535862', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Method:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'VNPay Sandbox'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Status:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: order.payment_status === 'PAID' ? '#0f9554' : '#d93025',
                  }}
                >
                  {order.payment_status}
                </span>
              </div>

              {order.vnpay_transaction_no && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                  <span>VNPay Txn Ref:</span>
                  <span style={{ fontFamily: 'monospace' }}>{order.vnpay_transaction_no}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Cancel Order */}
      {cancelModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div style={{ maxWidth: 480, width: '100%', padding: 28, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(217, 48, 37, 0.08)', color: '#d93025' }}>
                <XCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Confirm Order Cancellation</h3>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Order code: {order.order_code}</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#535862', lineHeight: 1.6, marginBottom: 16 }}>
              Are you sure you want to cancel this order? Once cancelled, this action cannot be undone.
            </p>

            {cancelError && (
              <div style={{ padding: 10, borderRadius: 6, background: 'rgba(217, 48, 37, 0.08)', color: '#d93025', fontSize: 13, marginBottom: 14 }}>
                {cancelError}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#535862', marginBottom: 6 }}>
                Cancellation Reason (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Changed mind, wrong delivery address..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  fontSize: 13,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isCancelling}
                onClick={() => setCancelModalOpen(false)}
                style={{ padding: '10px 18px', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                style={{ padding: '10px 20px', background: '#d93025', color: '#fff', border: 'none', borderRadius: 9999, cursor: isCancelling ? 'not-allowed' : 'pointer' }}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
