import React, { useState, useEffect } from 'react';
import '../../styles/studio/commerce.css';
import { sizedImage } from '../../services/images';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService, SHIPPING_METHODS, formatCurrency } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import {
  ArrowLeft,
  CreditCard,
  Info,
  Lock,
  Money,
  ShieldCheck,
  ShoppingCart,
  Truck,
  WarningCircle,
} from '@phosphor-icons/react';

const CHECKOUT_DRAFT_KEY = 'reeco_checkout_draft';
const ACTIVE_PAYMENT_KEY = 'reeco_active_payment';

const PAYMENT_OPTIONS = [
  {
    id: 'vnpay',
    name: 'Online payment via VNPay',
    description: 'Domestic ATM cards, VNPAY-QR and international Visa / Mastercard through the VNPay sandbox gateway.',
  },
  {
    id: 'cod',
    name: 'Cash on delivery (COD)',
    description: 'Pay the courier in cash when the order arrives at your shipping address.',
  },
];

function readSession(key) {
  try {
    if (typeof sessionStorage !== 'undefined') return sessionStorage.getItem(key);
  } catch {}
  return null;
}

export function CheckoutPage({ onNavigate }) {
  const { items, cartCount, cartSubtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form, shipping and payment choices survive a reload (and the VNPay round trip)
  const [formData, setFormData] = useState(() => {
    try {
      const saved = readSession(CHECKOUT_DRAFT_KEY);
      if (saved) return JSON.parse(saved);
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

  const [shippingMethod, setShippingMethod] = useState(() => readSession('reeco_shipping_method') || 'standard');
  const [paymentMethod, setPaymentMethod] = useState(() => readSession('reeco_payment_method') || 'vnpay');
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

  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(formData));
        sessionStorage.setItem('reeco_shipping_method', shippingMethod);
        sessionStorage.setItem('reeco_payment_method', paymentMethod);
      }
    } catch {}
  }, [formData, shippingMethod, paymentMethod]);

  // If unauthenticated, redirect to login with returnTo="checkout"
  if (!isAuthenticated || !user) {
    return (
      <div className="st-page st-page--narrow">
        <div className="cm-moment cm-moment--quiet">
          <span className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><Lock size={20} /></span>
          </span>
          <h1 className="cm-moment__title">Sign in to check out</h1>
          <p className="cm-moment__desc">
            Sign in to your account to place this order. Your cart stays as it is.
          </p>
          <div className="cm-moment__actions">
            <button
              type="button"
              className="st-btn st-btn--primary st-btn--lg"
              onClick={() => onNavigate && onNavigate('login')}
            >
              Sign in to checkout
            </button>
            <button
              type="button"
              className="st-btn st-btn--lg"
              onClick={() => onNavigate && onNavigate('cart')}
            >
              Return to cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (!items || items.length === 0) {
    return (
      <div className="st-page st-page--narrow">
        <div className="cm-moment cm-moment--quiet">
          <span className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><ShoppingCart size={20} /></span>
          </span>
          <h1 className="cm-moment__title">Your cart is empty</h1>
          <p className="cm-moment__desc">There is nothing in your cart to check out yet.</p>
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

      // Remember the order for the VNPay return page and the order success page
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

      const clearDraft = () => {
        try {
          if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
        } catch {}
      };

      if (paymentMethod === 'vnpay') {
        // Create the order first, then hand over to VNPay
        const vnpayRes = await paymentService.createVnpayPaymentUrl(order.id);
        clearCart();
        clearDraft();
        if (vnpayRes && vnpayRes.payment_url) {
          window.location.href = vnpayRes.payment_url;
          return;
        }
        throw new Error('Failed to obtain payment URL from VNPay');
      }

      clearCart();
      clearDraft();
      setIsSubmitting(false);
      if (onNavigate) {
        onNavigate(`order-success:${order.id || order.order_code}`);
      }
    } catch (err) {
      setIsSubmitting(false);
      setServerError(err.message || 'Unable to place order. Please review your details.');
    }
  };

  /* ── Text field (plain render helper, not a component, so inputs keep focus) ── */
  const renderField = ({ field, label, type = 'text', placeholder, required = false, autoComplete, full = false }) => {
    const id = `checkout-${field}`;
    const error = required ? formErrors[field] : null;
    return (
      <div className={`st-field${full ? ' cm-full' : ''}`}>
        <label className="st-label" htmlFor={id}>
          {label}
          {required && <span className="cm-req" aria-hidden="true">*</span>}
        </label>
        <input
          id={id}
          className="st-input"
          type={type}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <div className="st-error-text" id={`${id}-error`}>
            {error}
          </div>
        )}
      </div>
    );
  };

  const submitLabel = isSubmitting
    ? paymentMethod === 'vnpay'
      ? 'Redirecting to VNPay...'
      : 'Processing order...'
    : paymentMethod === 'vnpay'
      ? 'Place order and pay with VNPay'
      : 'Place order (COD)';

  return (
    <div className="st-page">
      <button type="button" className="st-back" onClick={() => onNavigate && onNavigate('cart')}>
        <ArrowLeft size={15} aria-hidden="true" /> Back to cart
      </button>

      <header className="st-header">
        <div className="st-header__title">
          <h1>Checkout</h1>
        </div>
        <div className="st-header__aside">
          <p>Enter shipping details and choose a secure payment method.</p>
        </div>
      </header>

      {serverError && (
        <div className="st-note st-note--error cm-alert" role="alert">
          <WarningCircle size={18} aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} noValidate>
        <div className="cm-split">
          <ol className="cm-steps">
            <li className="cm-step">
              <span className="cm-step__num" aria-hidden="true">1</span>
              <section className="cm-step__body" aria-labelledby="checkout-step-1">
                <div className="cm-step__head">
                  <h2 className="st-subheading" id="checkout-step-1">Customer &amp; delivery information</h2>
                  <p className="st-caption">Where the instruments should arrive and who signs for them.</p>
                </div>

                <div className="cm-grid">
                  {renderField({ field: 'fullName', label: 'Full name', placeholder: 'e.g. Hai Tran', required: true, autoComplete: 'name' })}
                  {renderField({ field: 'email', label: 'Email address', type: 'email', placeholder: 'e.g. haitran@example.com', required: true, autoComplete: 'email' })}
                  {renderField({ field: 'phone', label: 'Phone number', type: 'tel', placeholder: '+84 908...', required: true, autoComplete: 'tel' })}
                  {renderField({ field: 'city', label: 'City / province', placeholder: 'Hồ Chí Minh', required: true, autoComplete: 'address-level2' })}
                  {renderField({
                    field: 'address',
                    label: 'Detailed street address',
                    placeholder: 'Street number, street name, ward, district',
                    required: true,
                    autoComplete: 'street-address',
                    full: true,
                  })}
                </div>

                <div className="cm-grid cm-grid--3">
                  {renderField({ field: 'province', label: 'District', autoComplete: 'address-level1' })}
                  {renderField({ field: 'country', label: 'Country', autoComplete: 'country-name' })}
                  {renderField({ field: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' })}
                </div>

                <div className="st-field">
                  <label className="st-label" htmlFor="checkout-notes">
                    Order &amp; calibration notes <span className="cm-optional">(optional)</span>
                  </label>
                  <textarea
                    id="checkout-notes"
                    className="st-textarea"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Calibration certificate requests, custom cable lengths, or delivery instructions"
                  />
                </div>
              </section>
            </li>

            <li className="cm-step">
              <span className="cm-step__num" aria-hidden="true">2</span>
              <section className="cm-step__body" aria-labelledby="checkout-step-2">
                <h2 className="st-subheading" id="checkout-step-2">Shipping method</h2>
                <div className="cm-choices" role="radiogroup" aria-labelledby="checkout-step-2">
                  {Object.values(SHIPPING_METHODS).map((method) => {
                    const isSelected = shippingMethod === method.id;
                    return (
                      <label key={method.id} className={`cm-choice${isSelected ? ' is-selected' : ''}`}>
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={() => setShippingMethod(method.id)}
                        />
                        <span className="cm-choice__dot" aria-hidden="true" />
                        <span className="cm-choice__body">
                          <span className="cm-choice__top">
                            <span className="cm-choice__name">{method.name}</span>
                            <span className="cm-choice__price">{formatCurrency(method.fee)}</span>
                          </span>
                          <span className="cm-choice__desc">{method.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </li>

            <li className="cm-step">
              <span className="cm-step__num" aria-hidden="true">3</span>
              <section className="cm-step__body" aria-labelledby="checkout-step-3">
                <h2 className="st-subheading" id="checkout-step-3">Payment method</h2>
                <div className="cm-choices cm-choices--stack" role="radiogroup" aria-labelledby="checkout-step-3">
                  {PAYMENT_OPTIONS.map((method) => {
                    const Icon = method.id === 'cod' ? Money : CreditCard;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <label key={method.id} className={`cm-choice${isSelected ? ' is-selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(method.id)}
                        />
                        <span className="cm-choice__dot" aria-hidden="true" />
                        <span className="cm-choice__body">
                          <span className="cm-choice__name">
                            <Icon size={17} aria-hidden="true" />
                            {method.name}
                          </span>
                          <span className="cm-choice__desc">{method.description}</span>
                          {method.id === 'vnpay' && paymentMethod === 'vnpay' && (
                            <span className="st-note">
                              <Info size={15} aria-hidden="true" />
                              <span>Your order is created first, then you are redirected to VNPay to pay. The amount is charged in VND.</span>
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </li>
          </ol>

          <aside className="cm-aside">
            <div className="st-panel cm-summary">
              <div className="cm-summary__title">
                <h2 className="st-subheading">Order summary</h2>
                <span className="st-caption">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>

              <ul className="cm-items">
                {items.map((item) => (
                  <li key={item.product_id || item.id} className="cm-item">
                    <span className="st-thumb" aria-hidden="true">
                      {item.image ? <img src={sizedImage(item.image, 160)} alt="" /> : null}
                    </span>
                    <span className="cm-item__text">
                      <span className="cm-item__model">
                        {item.model || item.product_name} <span>×{item.quantity}</span>
                      </span>
                      {item.name && <span className="cm-item__name">{item.name}</span>}
                    </span>
                    <span className="cm-item__price">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="st-sum cm-summary__sum">
                <div className="st-sum__row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
                </div>
                <div className="st-sum__row">
                  <span>Shipping ({selectedShipping.name})</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                <div className="st-sum__total">
                  <span>Total</span>
                  <strong>{formatCurrency(totalAmount)}</strong>
                </div>
                <p className="cm-verified">The final total is verified by the server when you place the order.</p>
              </div>

              <button
                type="submit"
                className="st-btn st-btn--primary st-btn--lg st-btn--block"
                disabled={isSubmitting}
                aria-busy={isSubmitting || undefined}
              >
                {submitLabel}
              </button>

              <ul className="cm-assurances">
                <li>
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>Authorized commercial distributor</span>
                </li>
                <li>
                  <Truck size={16} aria-hidden="true" />
                  <span>Full transit insurance &amp; official import</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
