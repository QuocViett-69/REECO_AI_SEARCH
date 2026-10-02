import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService, SHIPPING_METHODS, formatCurrency } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import {
  Lock,
  ArrowLeft,
  Truck,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PackageCheck,
  Banknote,
} from 'lucide-react';

/* ── Shared inline style helpers ─────────────────────────────────── */
const inputStyle = (hasError) => ({
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  background: '#f9fafb',
  border: hasError ? '1px solid #d93025' : '1px solid #e5e7eb',
  color: '#111827',
  fontSize: 14,
  boxSizing: 'border-box',
  outline: 'none',
});

const CHECKOUT_DRAFT_KEY = 'reeco_checkout_draft';
const ACTIVE_PAYMENT_KEY = 'reeco_active_payment';

export function CheckoutPage({ onNavigate }) {
  const { items, cartCount, cartSubtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form State with session persistence
  const [formData, setFormData] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '+84 908 123 456',
      address: '128 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1',
      city: 'Hồ Chí Minh',
      province: 'Hồ Chí Minh',
      country: 'Vietnam',
      postalCode: '700000',
      notes: '',
    };
  });

  const [shippingMethod, setShippingMethod] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem('reeco_shipping_method');
        if (saved) return saved;
      }
    } catch {}
    return 'standard';
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem('reeco_payment_method');
        if (saved) return saved;
      }
    } catch {}
    return 'vnpay';
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Sync user defaults when auth loads if not already in session draft
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Persist form inputs, shipping, and payment method in session storage
  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(formData));
        sessionStorage.setItem('reeco_shipping_method', shippingMethod);
        sessionStorage.setItem('reeco_payment_method', paymentMethod);
      }
    } catch {}
  }, [formData, shippingMethod, paymentMethod]);

  // If unauthenticated, redirect to login
  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ maxWidth: 540, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ padding: 40, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 16,
              borderRadius: '50%',
              background: 'rgba(0, 105, 224, 0.08)',
              color: '#0069e0',
              marginBottom: 20,
            }}
          >
            <Lock size={36} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Sign In Required for Checkout
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            Please sign in to your account to complete your commercial order. Your shopping cart will be preserved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate && onNavigate('cart')}
              style={{ padding: '12px 20px', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
            >
              Back to Cart
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate('login')}
              style={{ padding: '12px 24px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cart empty guard
  if (!items || items.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: 540, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ padding: 40, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <AlertCircle size={40} color="#d93025" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            You do not have any items in your shopping cart to proceed to checkout.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '12px 24px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const selectedShipping = SHIPPING_METHODS[shippingMethod] || SHIPPING_METHODS.standard;
  const shippingFee = selectedShipping.fee;
  const totalAmount = cartSubtotal + shippingFee;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Please enter your full name';
    if (!formData.email.trim()) errors.email = 'Please enter your email address';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address format';
    }
    if (!formData.phone.trim()) errors.phone = 'Please enter your phone number';
    if (!formData.address.trim()) errors.address = 'Please enter your delivery address';
    if (!formData.city.trim()) errors.city = 'Please enter city / province';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product_id: item.product_id || item.id,
          quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        })),
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        customer_name: formData.fullName.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        shipping_address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province?.trim() || formData.city.trim(),
        country: formData.country?.trim() || 'Vietnam',
        postal_code: formData.postalCode?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      const order = await orderService.createOrder(orderPayload);

      // Save active order session for payment return & order success
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(
            ACTIVE_PAYMENT_KEY,
            JSON.stringify({
              orderId: order.id,
              orderCode: order.order_code || order.order_number,
              totalAmount: order.total_amount,
              paymentMethod,
              createdAt: new Date().toISOString(),
            })
          );
          sessionStorage.setItem('reeco_last_order_id', order.id);
          sessionStorage.setItem('reeco_order_success_id', order.id);
          sessionStorage.setItem('reeco_current_order_id', order.id);
        }
      } catch {}

      // VNPay flow: create order -> create vnpay payment url -> redirect
      if (paymentMethod === 'vnpay') {
        const vnpayRes = await paymentService.createVnpayPaymentUrl(order.id);
        clearCart();
        try {
          if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
        } catch {}
        if (vnpayRes && vnpayRes.payment_url) {
          window.location.href = vnpayRes.payment_url;
          return;
        }
        throw new Error('Failed to obtain payment URL from VNPay');
      } else {
        clearCart();
        try {
          if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
        } catch {}
        setIsSubmitting(false);
        if (onNavigate) {
          onNavigate(`order-success:${order.id || order.order_code}`);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setServerError(err.message || 'Unable to place order. Please review your details.');
    }
  };

  /* ── Step badge ─────────────────────────────────────────────────── */
  const StepBadge = ({ n }) => (
    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#0069e0', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{n}</span>
  );

  /* ── Shipping radio card ────────────────────────────────────────── */
  const shippingCardStyle = (isSelected) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    borderRadius: 10,
    border: isSelected ? '1.5px solid #0069e0' : '1px solid #e5e7eb',
    background: isSelected ? 'rgba(0, 105, 224, 0.04)' : '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  /* ── Payment radio card ─────────────────────────────────────────── */
  const paymentCardStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 10,
    border: isSelected ? '1.5px solid #0069e0' : '1px solid #e5e7eb',
    background: isSelected ? 'rgba(0, 105, 224, 0.04)' : '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div className="page-container" style={{ maxWidth: 1120, margin: '40px auto', padding: '0 20px' }}>
      <button
        type="button"
        onClick={() => onNavigate && onNavigate('cart')}
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
        <ArrowLeft size={14} /> Back to Cart
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
          Checkout
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          Enter shipping details and choose a secure payment method
        </p>
      </div>

      {/* Server / Validation Error Banner */}
      {serverError && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 10,
            background: 'rgba(217, 48, 37, 0.08)',
            border: '1px solid #d93025',
            color: '#d93025',
            fontSize: 14,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertCircle size={20} flexShrink={0} />
          <div style={{ flex: 1 }}>{serverError}</div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Left Column: Checkout Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Step 1: Customer & Shipping Information */}
            <div style={{ padding: 24, borderRadius: 14, background: '#ffffff', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <StepBadge n={1} />
                Recipient &amp; Shipping Address
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6, fontWeight: 600 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Doe"
                    style={inputStyle(formErrors.fullName)}
                  />
                  {formErrors.fullName && <div style={{ color: '#d93025', fontSize: 12, marginTop: 4 }}>{formErrors.fullName}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6, fontWeight: 600 }}>
                    Notification Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="name@example.com"
                    style={inputStyle(formErrors.email)}
                  />
                  {formErrors.email && <div style={{ color: '#d93025', fontSize: 12, marginTop: 4 }}>{formErrors.email}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6, fontWeight: 600 }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+84 908..."
                    style={inputStyle(formErrors.phone)}
                  />
                  {formErrors.phone && <div style={{ color: '#d93025', fontSize: 12, marginTop: 4 }}>{formErrors.phone}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6, fontWeight: 600 }}>
                    City / Province *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Ho Chi Minh City"
                    style={inputStyle(formErrors.city)}
                  />
                  {formErrors.city && <div style={{ color: '#d93025', fontSize: 12, marginTop: 4 }}>{formErrors.city}</div>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6, fontWeight: 600 }}>
                  Detailed Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street number, street name, ward, district"
                  style={inputStyle(formErrors.address)}
                />
                {formErrors.address && <div style={{ color: '#d93025', fontSize: 12, marginTop: 4 }}>{formErrors.address}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6 }}>District</label>
                  <input type="text" value={formData.province} onChange={(e) => handleInputChange('province', e.target.value)} style={inputStyle(false)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6 }}>Country</label>
                  <input type="text" value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} style={inputStyle(false)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6 }}>Postal Code</label>
                  <input type="text" value={formData.postalCode} onChange={(e) => handleInputChange('postalCode', e.target.value)} style={inputStyle(false)} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6 }}>
                  Order &amp; Calibration Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Calibration certificate requests, custom cable lengths, or delivery instructions"
                  style={{ ...inputStyle(false), resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div style={{ padding: 24, borderRadius: 14, background: '#ffffff', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <StepBadge n={2} />
                Shipping Method
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {Object.values(SHIPPING_METHODS).map((method) => {
                  const isSelected = shippingMethod === method.id;
                  return (
                    <label key={method.id} style={shippingCardStyle(isSelected)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => setShippingMethod(method.id)}
                            style={{ accentColor: '#0069e0' }}
                          />
                          <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{method.name}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0069e0', fontSize: 15 }}>
                          {formatCurrency(method.fee)}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: '#6b7280', paddingLeft: 24 }}>
                        {method.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div style={{ padding: 24, borderRadius: 14, background: '#ffffff', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <StepBadge n={3} />
                Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {/* VNPay */}
                <label style={paymentCardStyle(paymentMethod === 'vnpay')}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={() => setPaymentMethod('vnpay')}
                    style={{ marginTop: 4, accentColor: '#0069e0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                      <CreditCard size={18} color="#0069e0" />
                      <span>Online Payment via VNPAY Sandbox</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                      Supports domestic ATM cards, VNPAY-QR code scanning, and international Visa/Mastercard via VNPay Sandbox gateway.
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label style={paymentCardStyle(paymentMethod === 'cod')}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ marginTop: 4, accentColor: '#0069e0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                      <Banknote size={18} color="#0f9554" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                      Pay directly in cash to the courier upon delivery at the registered shipping address.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              position: 'sticky',
              top: 90,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>
              Order Summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {items.map((item) => (
                <div key={item.product_id || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span style={{ fontWeight: 700, color: '#0069e0', fontSize: 12 }}>{item.model || item.product_name}</span>
                    <span style={{ color: '#93979f', whiteSpace: 'nowrap' }}>×{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: '#e5e7eb', margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#6b7280' }}>
              <span>Subtotal</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatCurrency(cartSubtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#6b7280' }}>
              <span>Shipping ({selectedShipping.name})</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatCurrency(shippingFee)}</span>
            </div>

            <div style={{ height: 1, background: '#e5e7eb', margin: '14px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 18, fontWeight: 700, color: '#111827' }}>
              <span>Total Amount</span>
              <span style={{ color: '#0069e0' }}>{formatCurrency(totalAmount)}</span>
            </div>

            {/* Note required by spec */}
            <div
              style={{
                fontSize: 12,
                color: '#6b7280',
                fontStyle: 'italic',
                marginBottom: 18,
                textAlign: 'center',
                padding: '6px 8px',
                borderRadius: 6,
                background: '#f9fafb',
              }}
            >
              * Final total verified by server
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                background: '#111827',
                color: '#fff',
                border: 'none',
              }}
            >
              <PackageCheck size={18} />
              <span>{isSubmitting ? 'Processing Order...' : 'Place Order'}</span>
            </button>

            {/* Trust Assurances */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#0f9554" />
                <span>Authorized commercial distributor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={14} color="#0069e0" />
                <span>Full transit insurance &amp; official import</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
