import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService, SHIPPING_METHODS } from '../../services/orderService';
import { BANK_TRANSFER_INFO } from '../../services/paymentService';
import { formatPrice } from '../../services/commercialService';
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
  ExternalLink,
} from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // VNPay Sandbox Simulation Modal
  const [vnpayModal, setVnpayModal] = useState(null);

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
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 16,
              borderRadius: '50%',
              background: 'rgba(0, 210, 255, 0.1)',
              color: 'var(--accent, #00d2ff)',
              marginBottom: 20,
            }}
          >
            <Lock size={36} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            Login Required for Checkout
          </h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 24 }}>
            Please sign in to your customer account to complete your commercial order. Your cart items will be preserved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate && onNavigate('cart')}
              style={{ padding: '12px 20px' }}
            >
              Return to Cart
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate('login')}
              style={{ padding: '12px 28px' }}
            >
              Sign In to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0 && !vnpayModal) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 24 }}>
            There are no items to checkout.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
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

  const handlePlaceOrder = (e) => {
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

      if (paymentMethod === 'mastercard') {
        // Open VNPay Sandbox Payment Gateway simulator
        setVnpayModal({
          order,
          paymentUrl: order.payment_intent.paymentUrl,
        });
        setIsSubmitting(false);
      } else {
        // Bank transfer order created
        clearCart();
        setIsSubmitting(false);
        if (onNavigate) {
          onNavigate(`account-order:${order.order_id}`);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setServerError(err.message || 'Failed to place order. Please try again.');
    }
  };

  const handleVNPaySimulatePayment = (success = true) => {
    if (!vnpayModal) return;
    const { order } = vnpayModal;

    if (success) {
      orderService.markOrderAsPaid(order.order_id, {
        provider: 'VNPAY_SANDBOX',
        vnp_TransactionNo: `VNP_${Date.now()}`,
        vnp_ResponseCode: '00',
      });
      clearCart();
      setVnpayModal(null);
      if (onNavigate) {
        onNavigate(`account-order:${order.order_id}`);
      }
    } else {
      setVnpayModal(null);
      setServerError('VNPay Sandbox payment was cancelled by user.');
    }
  };

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
          color: 'var(--text-3, #888)',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Back to Cart
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1, #fff)', margin: '0 0 6px' }}>
          Checkout &amp; Order Placement
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3, #888)', margin: 0 }}>
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
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            color: '#ff6b6b',
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
            <div className="glass-card" style={{ padding: 24, borderRadius: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent, #00d2ff)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>1</span>
                Customer &amp; Delivery Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6, fontWeight: 600 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Hai Tran"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: formErrors.fullName ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  />
                  {formErrors.fullName && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{formErrors.fullName}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6, fontWeight: 600 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="e.g. haitran@example.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: formErrors.email ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  />
                  {formErrors.email && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{formErrors.email}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6, fontWeight: 600 }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+84 908..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: formErrors.phone ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  />
                  {formErrors.phone && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{formErrors.phone}</div>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6, fontWeight: 600 }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Ho Chi Minh City"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: formErrors.city ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  />
                  {formErrors.city && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{formErrors.city}</div>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6, fontWeight: 600 }}>
                  Street Address &amp; Delivery Destination *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address, building, station location"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: formErrors.address ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                />
                {formErrors.address && <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{formErrors.address}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6 }}>Province / State</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6 }}>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6 }}>Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-2, #ccc)', marginBottom: 6 }}>
                  Order &amp; Technical Calibration Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Specify calibration certificate, custom cable length, or station deployment details"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent, #00d2ff)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>2</span>
                Shipping Method
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {Object.values(SHIPPING_METHODS).map((method) => {
                  const isSelected = shippingMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 16,
                        borderRadius: 10,
                        border: isSelected ? '1.5px solid var(--accent, #00d2ff)' : '1px solid rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => setShippingMethod(method.id)}
                            style={{ accentColor: 'var(--accent, #00d2ff)' }}
                          />
                          <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{method.name}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--accent, #00d2ff)', fontSize: 15 }}>
                          ${method.fee}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-3, #888)', paddingLeft: 24 }}>
                        {method.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent, #00d2ff)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>3</span>
                Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {/* Bank Transfer */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 16,
                    borderRadius: 10,
                    border: paymentMethod === 'bank_transfer' ? '1.5px solid var(--accent, #00d2ff)' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === 'bank_transfer' ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    style={{ marginTop: 4, accentColor: 'var(--accent, #00d2ff)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                      <Building2 size={16} color="var(--accent, #00d2ff)" />
                      <span>Bank Transfer (Corporate / Wire Transfer)</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3, #888)', lineHeight: 1.5 }}>
                      Transfer directly to REECO corporate account. Order is confirmed upon receipt.
                    </div>

                    {paymentMethod === 'bank_transfer' && (
                      <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'var(--text-2, #ccc)', lineHeight: 1.6 }}>
                        <div>• <strong>Bank:</strong> {BANK_TRANSFER_INFO.bankName}</div>
                        <div>• <strong>Account Name:</strong> {BANK_TRANSFER_INFO.accountName}</div>
                        <div>• <strong>Account Number:</strong> <code style={{ color: 'var(--accent, #00d2ff)' }}>{BANK_TRANSFER_INFO.accountNumber}</code></div>
                        <div>• <strong>Transfer Reference:</strong> <code style={{ color: '#00c873' }}>REECO-[Order ID]</code> (Generated upon placing order)</div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Mastercard / VNPay */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 16,
                    borderRadius: 10,
                    border: paymentMethod === 'mastercard' ? '1.5px solid var(--accent, #00d2ff)' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === 'mastercard' ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mastercard"
                    checked={paymentMethod === 'mastercard'}
                    onChange={() => setPaymentMethod('mastercard')}
                    style={{ marginTop: 4, accentColor: 'var(--accent, #00d2ff)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                      <CreditCard size={16} color="var(--accent, #00d2ff)" />
                      <span>Mastercard / Visa via VNPay Sandbox</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3, #888)' }}>
                      Secure online gateway processing via VNPay Sandbox environment.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
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
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>
              Order Breakdown ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {items.map((item) => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent, #00d2ff)', fontSize: 12 }}>{item.model}</span>
                    <span style={{ color: 'var(--text-3, #888)', whiteSpace: 'nowrap' }}>×{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#fff' }}>
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-3, #888)' }}>
              <span>Products Subtotal</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{formatPrice(cartSubtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-3, #888)' }}>
              <span>Shipping ({selectedShipping.name})</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{formatPrice(shippingFee)}</span>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 18, fontWeight: 700, color: '#fff' }}>
              <span>Final Total</span>
              <span style={{ color: 'var(--accent, #00d2ff)' }}>{formatPrice(totalAmount)}</span>
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
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isSubmitting ? 'wait' : 'pointer',
              }}
            >
              <PackageCheck size={18} />
              <span>{isSubmitting ? 'Processing Order...' : 'Place Official Order'}</span>
            </button>

            {/* Trust Assurances */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-3, #777)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#00c873" />
                <span>Authorized Campbell Scientific Reseller</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={14} color="var(--accent, #00d2ff)" />
                <span>Customs and factory import fully insured</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* VNPay Sandbox Simulator Modal */}
      {vnpayModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div className="glass-card" style={{ maxWidth: 480, width: '100%', padding: 32, borderRadius: 16, border: '1px solid rgba(0, 210, 255, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent, #00d2ff)' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>VNPay Sandbox Gateway</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3, #888)' }}>Order #{vnpayModal.order.order_id}</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-2, #ccc)', lineHeight: 1.6, marginBottom: 20 }}>
              You are testing the <strong>VNPay Sandbox</strong> payment flow. In production, this redirects to VNPay's secure gateway.
            </p>

            <div style={{ padding: 14, borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-3, #888)' }}>Order Total:</span>
                <span style={{ color: 'var(--accent, #00d2ff)', fontWeight: 700 }}>{formatPrice(vnpayModal.order.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3, #888)' }}>Merchant Code:</span>
                <span style={{ color: '#fff' }}>REECO001</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleVNPaySimulatePayment(false)}
                style={{ flex: 1, padding: '10px' }}
              >
                Simulate Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleVNPaySimulatePayment(true)}
                style={{ flex: 1, padding: '10px' }}
              >
                Simulate Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
