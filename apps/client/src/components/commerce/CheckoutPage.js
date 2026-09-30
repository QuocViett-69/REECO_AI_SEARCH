import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService, SHIPPING_METHODS } from '../../services/orderService';
import { paymentService, PAYMENT_METHODS } from '../../services/paymentService';
import { formatPrice } from '../../services/commercialService';
import {
  Lock,
  ArrowLeft,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PackageCheck,
  ExternalLink,
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

export function CheckoutPage({ onNavigate }) {
  const { items, cartCount, cartSubtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '+84 908 123 456',
    address: '128 Nguyen Van Thu, Da Kao Ward, District 1',
    city: 'Ho Chi Minh City',
    province: 'Ho Chi Minh',
    country: 'Vietnam',
    postalCode: '700000',
    notes: '',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Sync user defaults when auth loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // If unauthenticated, redirect to login with returnTo="checkout"
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
            Login Required for Checkout
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            Please sign in to your customer account to complete your commercial order. Your cart items will be preserved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate && onNavigate('cart')}
              style={{ padding: '12px 20px', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
            >
              Return to Cart
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate('login')}
              style={{ padding: '12px 28px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
            >
              Sign In to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ padding: 40, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            There are no items to checkout.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '12px 28px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
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
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email format';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const order = orderService.createOrder({
        customer: user,
        items,
        shippingInfo: formData,
        shippingMethod,
        paymentMethod,
      });

      if (paymentMethod === 'vnpay') {
        // The cart is cleared only after VNPay confirms payment (see VnpayReturnPage)
        const { payment_url } = await paymentService.createVnpayPaymentUrl(order);
        window.location.assign(payment_url);
        return;
      }

      clearCart();
      setIsSubmitting(false);
      if (onNavigate) {
        onNavigate(`account-order:${order.order_id}`);
      }
    } catch (err) {
      setIsSubmitting(false);
      setServerError(err.message || 'Failed to place order. Please try again.');
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
          Checkout &amp; Order Placement
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Direct import and commercial order processing for authorized Campbell Scientific products
        </p>
      </div>

      {serverError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderRadius: 8,
            background: 'rgba(217, 48, 37, 0.06)',
            border: '1px solid rgba(217, 48, 37, 0.2)',
            color: '#d93025',
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          <AlertCircle size={18} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>
          {/* Left Column: Information Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Step 1: Customer Information */}
            <div style={{ padding: 24, borderRadius: 14, background: '#ffffff', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <StepBadge n={1} />
                Customer &amp; Delivery Information
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
                    placeholder="e.g. Hai Tran"
                    style={inputStyle(formErrors.fullName)}
                  />
                  {formErrors.fullName && <div style={{ color: '#d93025', fontSize: 12, marginTop: 4 }}>{formErrors.fullName}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6, fontWeight: 600 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g. haitran@example.com"
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
                    City *
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
                  Street Address &amp; Delivery Destination *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address, building, station location"
                  style={inputStyle(formErrors.address)}
                />
                {formErrors.address && <div style={{ color: '#d93025', fontSize: 12, marginTop: 4 }}>{formErrors.address}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#535862', marginBottom: 6 }}>Province / State</label>
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
                  Order &amp; Technical Calibration Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Specify calibration certificate, custom cable length, or station deployment details"
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
                          {formatPrice(method.fee)}
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
                {Object.values(PAYMENT_METHODS).map((method) => {
                  const Icon = method.id === 'cod' ? Banknote : CreditCard;
                  return (
                    <label key={method.id} style={paymentCardStyle(paymentMethod === method.id)}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        style={{ marginTop: 4, accentColor: '#0069e0' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                          <Icon size={16} color="#0069e0" />
                          <span>{method.name}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                          {method.description}
                        </div>
                        {method.id === 'vnpay' && paymentMethod === 'vnpay' && (
                          <div style={{ marginTop: 10, fontSize: 12, color: '#535862' }}>
                            You will be redirected to VNPay to complete payment. The amount is charged in VND.
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
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
              Order Breakdown ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {items.map((item) => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span style={{ fontWeight: 700, color: '#0069e0', fontSize: 12 }}>{item.model}</span>
                    <span style={{ color: '#93979f', whiteSpace: 'nowrap' }}>×{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: '#e5e7eb', margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#6b7280' }}>
              <span>Products Subtotal</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatPrice(cartSubtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#6b7280' }}>
              <span>Shipping ({selectedShipping.name})</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{formatPrice(shippingFee)}</span>
            </div>

            <div style={{ height: 1, background: '#e5e7eb', margin: '14px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 18, fontWeight: 700, color: '#111827' }}>
              <span>Final Total</span>
              <span style={{ color: '#0069e0' }}>{formatPrice(totalAmount)}</span>
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
                cursor: isSubmitting ? 'wait' : 'pointer',
                background: '#111827',
                color: '#fff',
                border: 'none',
              }}
            >
              <PackageCheck size={18} />
              <span>{isSubmitting ? (paymentMethod === 'vnpay' ? 'Redirecting to VNPay...' : 'Processing Order...') : (paymentMethod === 'vnpay' ? 'Pay with VNPay' : 'Place Order (COD)')}</span>
            </button>

            {/* Trust Assurances */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#0f9554" />
                <span>Authorized Campbell Scientific Reseller</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={14} color="#0069e0" />
                <span>Customs and factory import fully insured</span>
              </div>
            </div>
          </div>
        </div>
      </form>

    </div>
  );
}

export default CheckoutPage;
