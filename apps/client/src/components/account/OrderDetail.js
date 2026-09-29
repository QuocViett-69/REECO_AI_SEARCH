import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, ORDER_STATUSES, SHIPPING_METHODS } from '../../services/orderService';
import { BANK_TRANSFER_INFO } from '../../services/paymentService';
import { formatPrice } from '../../services/commercialService';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
  AlertCircle,
  Calendar,
  MapPin,
  User,
} from 'lucide-react';

const TRACKING_STEPS = [
  { key: 'PENDING_PAYMENT', label: 'Order Placed', desc: 'Order registered in REECO system' },
  { key: 'PAID', label: 'Payment Confirmed', desc: 'Payment verified & authorized' },
  { key: 'PROCESSING', label: 'Processing at REECO', desc: 'Technical specs & import order prepared' },
  { key: 'FORWARDED_TO_MANUFACTURER', label: 'Forwarded to Manufacturer', desc: 'Submitted to Campbell Scientific factory' },
  { key: 'SHIPPED', label: 'Shipped from Factory', desc: 'In international transit / customs' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Received at customer destination' },
];

function getStepProgress(currentStatus) {
  if (currentStatus === 'CANCELLED' || currentStatus === 'PAYMENT_FAILED') {
    return -1;
  }
  const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === currentStatus);
  return currentIndex >= 0 ? currentIndex : 0;
}

export function OrderDetail({ orderId, onBack }) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !user) {
      setLoading(false);
      return;
    }

    const res = orderService.getOrderById(orderId, user);
    if (res.error) {
      setError(res.message);
    } else {
      setOrder(res.order);
    }
    setLoading(false);
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 860, margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, color: '#6b7280' }}>
          Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <AlertCircle size={40} color="#d93025" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Order Not Available</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            {error || 'The requested order could not be retrieved.'}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer', padding: '8px 16px' }}
          >
            <ArrowLeft size={14} /> Back to Order List
          </button>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepProgress(order.status);
  const statusConfig = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: '#6b7280',
  };

  const createdDateStr = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const shippingInfo = SHIPPING_METHODS[order.shipping_method] || SHIPPING_METHODS.standard;

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
        <ArrowLeft size={14} /> Back to My Orders
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
              Order #{order.order_id}
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
            Placed on {createdDateStr} • Tracking Ref: <code>{order.order_code}</code>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Estimated Delivery</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0069e0' }}>
            {order.estimated_delivery?.display || 'Pending schedule'}
          </div>
        </div>
      </div>

      {/* Visual Read-Only Tracking Timeline */}
      <div className="glass-card" style={{ padding: 28, borderRadius: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck size={18} color="#0069e0" />
          <span>Fulfillment &amp; Import Timeline (Read-Only)</span>
        </h2>

        {order.status === 'CANCELLED' ? (
          <div style={{ padding: 16, borderRadius: 8, background: 'rgba(217, 48, 37, 0.08)', color: '#d93025', fontSize: 14 }}>
            This order has been cancelled.
          </div>
        ) : (
          <div style={{ position: 'relative', padding: '10px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    {/* Circle Node */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isPassed
                          ? isCurrent
                            ? '#0069e0'
                            : '#0f9554'
                          : '#f9fafb',
                        color: isPassed ? '#fff' : '#93979f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                        boxShadow: isCurrent ? '0 0 0 4px rgba(0, 105, 224, 0.2)' : 'none',
                        border: isPassed ? 'none' : '1px solid #e5e7eb',
                      }}
                    >
                      {isPassed ? (isCurrent ? '●' : '✓') : '○'}
                    </div>

                    {/* Step details */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: isCurrent ? 700 : 600,
                          color: isPassed ? '#111827' : '#6b7280',
                          marginBottom: 2,
                        }}
                      >
                        {step.label} {isCurrent && <span style={{ fontSize: 11, color: '#0069e0', fontWeight: 600 }}>(Current Status)</span>}
                      </div>
                      <div style={{ fontSize: 12, color: isPassed ? '#535862' : '#93979f' }}>
                        {step.desc}
                      </div>
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
            <span>Ordered Products ({order.items?.length || 0})</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
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
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.model}
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'contain', background: '#ffffff', padding: 4, border: '1px solid #e5e7eb' }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0069e0' }}>
                      {item.model}
                    </div>
                    <div style={{ fontSize: 12, color: '#535862', maxWidth: 360 }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      Snapshot Price: {formatPrice(item.unit_price, order.currency)} × {item.quantity}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', textAlign: 'right' }}>
                  {formatPrice(item.line_total, order.currency)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#6b7280' }}>
              <span>Subtotal</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatPrice(order.subtotal, order.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
              <span>Shipping ({shippingInfo.name})</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatPrice(order.shipping_fee, order.currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#111827', paddingTop: 10, borderTop: '1px dashed #e5e7eb' }}>
              <span>Order Total</span>
              <span style={{ color: '#0069e0' }}>{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>
        </div>

        {/* Right: Customer & Logistics info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Shipping Details */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} color="#0069e0" />
              <span>Shipping Destination</span>
            </h3>
            <div style={{ fontSize: 13, color: '#535862', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, color: '#111827' }}>{order.customer_name}</div>
              <div>{order.customer_phone}</div>
              <div style={{ marginTop: 4 }}>{order.shipping_address}</div>
              <div>{order.city}, {order.province} {order.postal_code}</div>
              <div>{order.country}</div>
              {order.notes && (
                <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {order.payment_method === 'mastercard' ? <CreditCard size={16} color="#0069e0" /> : <Building2 size={16} color="#0069e0" />}
              <span>Payment Details</span>
            </h3>

            <div style={{ fontSize: 13, color: '#535862', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Method:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {order.payment_method === 'mastercard' ? 'Mastercard / VNPay' : 'Bank Transfer'}
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

              {order.payment_method === 'bank_transfer' && order.payment_status !== 'PAID' && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 12, lineHeight: 1.5 }}>
                  <div style={{ color: '#0069e0', fontWeight: 600, marginBottom: 4 }}>Bank Transfer Instructions:</div>
                  <div>Bank: {BANK_TRANSFER_INFO.bankName}</div>
                  <div>Account: {BANK_TRANSFER_INFO.accountNumber}</div>
                  <div>Ref: <code>{order.order_code}</code></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
