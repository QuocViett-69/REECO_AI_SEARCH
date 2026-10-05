import React, { useState, useEffect, useCallback, useRef } from 'react';
import { orderService, SHIPPING_METHODS, formatCurrency } from '../../services/orderService';
import { createVnpayPaymentUrl, getPaymentMethodLabel } from '../../services/paymentService';
import { sizedImage } from '../../services/images';
import {
  ArrowClockwise,
  ArrowLeft,
  Check,
  CircleNotch,
  ClockCounterClockwise,
  CreditCard,
  MapPin,
  Money,
  Package,
  WarningCircle,
  X,
  XCircle,
} from '@phosphor-icons/react';
import { OrderStatusBadge, PaymentStatusBadge, getOrderStatusBadge } from './orderStatusBadge';
import '../../styles/studio/account.css';

const TRACKING_STEPS = [
  { key: 'PENDING_PAYMENT', label: 'Order placed', desc: 'Order registered in the REECO system' },
  { key: 'PAID', label: 'Payment confirmed', desc: 'Payment verified and authorized' },
  { key: 'PROCESSING', label: 'Processing at REECO', desc: 'Technical specs and import order prepared' },
  { key: 'FORWARDED_TO_MANUFACTURER', label: 'Forwarded to manufacturer', desc: 'Submitted to the Campbell Scientific factory' },
  { key: 'SHIPPED', label: 'Shipped from factory', desc: 'In international transit and customs' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Received at the customer destination' },
];

// Orders can be cancelled until they are handed to the carrier.
const CANCELLABLE_STATUSES = ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAID', 'PROCESSING'];

function getStepProgress(currentStatus) {
  if (currentStatus === 'CANCELLED' || currentStatus === 'PAYMENT_FAILED') {
    return -1;
  }
  const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === currentStatus);
  return currentIndex >= 0 ? currentIndex : 0;
}

function orderLabel(order) {
  if (order.order_code) return order.order_code;
  if (order.order_number) return `REECO-${order.order_number}`;
  return `#${order.id}`;
}

function formatDeliveryRange(from, to) {
  if (!from) return null;
  const start = new Date(from);
  const end = to ? new Date(to) : null;
  if (Number.isNaN(start.getTime())) return to ? `${from} – ${to}` : from;
  const short = { month: 'short', day: 'numeric' };
  if (!end || Number.isNaN(end.getTime())) {
    return start.toLocaleDateString('en-US', { ...short, year: 'numeric' });
  }
  return `${start.toLocaleDateString('en-US', short)} – ${end.toLocaleDateString('en-US', { ...short, year: 'numeric' })}`;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Status history notes are written by the API in Vietnamese; show them in the page's language.
function formatTimelineNote(note) {
  if (!note) return null;
  if (note.includes('Khởi tạo đơn hàng mới')) return 'New order created';
  if (note.includes('Thanh toán thành công qua cổng VNPay')) {
    return note.replace('Thanh toán thành công qua cổng VNPay (Mã giao dịch:', 'Paid through VNPay (transaction');
  }
  if (note.includes('Thanh toán thất bại')) {
    return note.replace('Thanh toán thất bại qua cổng VNPay', 'VNPay payment failed');
  }
  if (note.includes('Cập nhật bởi Quản trị viên lúc')) {
    return note.replace('Cập nhật bởi Quản trị viên lúc', 'Updated by an administrator at');
  }
  return note;
}

const money = (value) => formatCurrency(Number(value));

export function OrderDetail({ orderId, onBack }) {
  // After a refresh the id comes back from the session, so the page can reload itself.
  const effectiveOrderId =
    orderId ||
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('reeco_current_order_id') || sessionStorage.getItem('reeco_last_order_id')
      : null);

  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const [isRepaying, setIsRepaying] = useState(false);
  const [payError, setPayError] = useState(null);

  const fetchOrderDetail = useCallback(async () => {
    if (!effectiveOrderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(effectiveOrderId);
      setOrder(res?.order || res);
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('reeco_current_order_id', effectiveOrderId);
        }
      } catch {}
    } catch (err) {
      setError(err.message || 'This order could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const openCancel = () => {
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const closeCancel = useCallback(() => {
    if (!isCancelling) setCancelModalOpen(false);
  }, [isCancelling]);

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
      setCancelError(err.message || 'This order could not be cancelled.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRepayVNPay = async () => {
    if (!order) return;
    setPayError(null);
    setIsRepaying(true);
    try {
      const res = await createVnpayPaymentUrl(order.id);
      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        setPayError('VNPay did not return a payment link. Try again in a moment.');
        setIsRepaying(false);
      }
    } catch (err) {
      setPayError(err.message || 'The VNPay payment could not be started.');
      setIsRepaying(false);
    }
  };

  if (loading) {
    return (
      <div className="st-page st-page--narrow ac-page">
        <div className="st-loading" role="status">
          <CircleNotch size={20} className="spin" aria-hidden="true" /> Loading order details
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="st-page st-page--narrow ac-page">
        <div className="st-state" role={error ? 'alert' : undefined}>
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><WarningCircle size={20} /></span>
          </div>
          <h1 className="st-state__title">Order not available</h1>
          <p className="st-state__desc">{error || 'This order could not be found.'}</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn" onClick={onBack}>
              <ArrowLeft size={16} aria-hidden="true" /> Back to my orders
            </button>
            {effectiveOrderId && (
              <button type="button" className="st-btn st-btn--primary" onClick={fetchOrderDetail}>
                <ArrowClockwise size={16} aria-hidden="true" /> Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepProgress(order.status);
  const isStopped = order.status === 'CANCELLED' || order.status === 'PAYMENT_FAILED';
  const createdDateStr = formatDateTime(order.created_at);
  const shippingInfo = SHIPPING_METHODS[order.shipping_method] || SHIPPING_METHODS.standard;
  const itemsList = order.order_items || order.items || [];
  const itemCount = itemsList.length;
  const statusHistory = Array.isArray(order.order_status_history)
    ? [...order.order_status_history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : [];
  const delivery = formatDeliveryRange(order.estimated_delivery_from, order.estimated_delivery_to);
  const label = orderLabel(order);

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const canRepay = order.payment_method === 'vnpay' && order.payment_status !== 'PAID' && order.status !== 'CANCELLED';

  return (
    <div className="st-page ac-page">
      <button type="button" className="st-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to my orders
      </button>

      <header className="st-header">
        <div className="st-header__title">
          <h1>{label}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="st-header__aside">
          <div className="ac-eta">
            <div className={`st-orb ${isStopped ? 'st-orb--stone' : 'st-orb--live'}`} aria-hidden="true" />
            <div>
              <p className="ac-eta__label">Estimated delivery</p>
              <p className="ac-eta__value">{isStopped ? 'Not scheduled' : delivery || 'Pending schedule'}</p>
            </div>
          </div>
          <p className="st-caption">
            Placed {createdDateStr}. Tracking code <span className="ac-ref">{order.order_code || label}</span>
          </p>
          {(canRepay || canCancel) && (
            <div className="ac-order-actions">
              {canRepay && (
                <button
                  type="button"
                  className="st-btn st-btn--primary"
                  disabled={isRepaying}
                  aria-busy={isRepaying}
                  onClick={handleRepayVNPay}
                >
                  <CreditCard size={16} aria-hidden="true" />
                  {isRepaying ? 'Opening VNPay…' : 'Pay again with VNPay'}
                </button>
              )}
              {canCancel && (
                <button type="button" className="st-btn st-btn--danger" onClick={openCancel}>
                  <XCircle size={16} aria-hidden="true" /> Cancel order
                </button>
              )}
            </div>
          )}
          {payError && (
            <p className="st-error-text" role="alert">
              {payError}
            </p>
          )}
        </div>
      </header>

      <div className="ac-detail">
        <div className="ac-detail__main">
          <section aria-labelledby="ac-timeline-title">
            <h2 className="st-heading ac-block__title" id="ac-timeline-title">Delivery progress</h2>

            {order.status === 'CANCELLED' ? (
              <div className="st-note" role="status">
                <WarningCircle size={18} aria-hidden="true" />
                <span>This order has been cancelled.</span>
              </div>
            ) : order.status === 'PAYMENT_FAILED' ? (
              <div className="st-note st-note--error" role="status">
                <WarningCircle size={18} aria-hidden="true" />
                <span>The payment for this order did not go through. Pay again to continue.</span>
              </div>
            ) : (
              <ol className="ac-timeline">
                {TRACKING_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const stateClass = isCurrent ? ' is-current' : isPassed ? ' is-done' : '';

                  return (
                    <li
                      key={step.key}
                      className={`ac-step${stateClass}`}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <span className="ac-step__mark" aria-hidden="true">
                        {isCurrent ? null : isPassed ? <Check size={14} weight="bold" /> : idx + 1}
                      </span>
                      <div>
                        <div className="ac-step__title">
                          {step.label}
                          {isCurrent && <span className="st-tag">Now</span>}
                        </div>
                        <div className="ac-step__desc">{step.desc}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="ac-history">
              <h3 className="ac-history__title">
                <ClockCounterClockwise size={18} aria-hidden="true" /> Status history
              </h3>
              {statusHistory.length === 0 ? (
                <p className="ac-history__empty">No status changes have been recorded for this order yet.</p>
              ) : (
                <ol className="ac-history__list">
                  {statusHistory.map((h, idx) => {
                    const badge = getOrderStatusBadge(h.status);
                    const note = formatTimelineNote(h.note || h.reason);
                    return (
                      <li key={h.id || idx} className={`ac-history__item ac-history__item--${badge.tone}`}>
                        <div className="ac-history__head">
                          <span className="ac-history__status">{badge.label}</span>
                          <time dateTime={h.created_at}>{formatDateTime(h.created_at)}</time>
                        </div>
                        {note && <p className="ac-history__note">{note}</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </section>

          <section aria-labelledby="ac-items-title">
            <h2 className="st-heading ac-block__title" id="ac-items-title">
              {itemCount} {itemCount === 1 ? 'product' : 'products'}
            </h2>

            <ul className="ac-items">
              {itemsList.map((item, idx) => {
                const image = item.image_url || item.image;
                const lineTotal = item.line_total ?? Number(item.unit_price) * Number(item.quantity);
                return (
                  <li key={item.id || idx} className="ac-item">
                    <span className="st-thumb st-thumb--lg" aria-hidden="true">
                      {image ? <img src={sizedImage(image, 200)} alt="" /> : <Package size={24} />}
                    </span>
                    <div>
                      <div className="ac-item__model">{item.model || item.product_id}</div>
                      <div className="ac-item__name">{item.product_name}</div>
                      <div className="ac-item__qty">
                        {money(item.unit_price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="ac-item__total">{money(lineTotal)}</div>
                  </li>
                );
              })}
            </ul>

            <div className="st-sum ac-summary">
              <div className="st-sum__row">
                <span>Subtotal</span>
                <span>{money(order.subtotal)}</span>
              </div>
              <div className="st-sum__row">
                <span>Shipping ({shippingInfo.name})</span>
                <span>{money(order.shipping_fee)}</span>
              </div>
              <div className="st-sum__total">
                <span>Order total</span>
                <strong>{money(order.total)}</strong>
              </div>
            </div>
          </section>
        </div>

        <aside className="ac-detail__aside">
          <section className="st-panel" aria-labelledby="ac-ship-title">
            <h2 className="ac-aside-title" id="ac-ship-title">
              <MapPin size={18} aria-hidden="true" /> Shipping to
            </h2>
            <address className="ac-address">
              <strong>{order.customer_name}</strong>
              <span>{order.customer_phone}</span>
              <span>{order.shipping_address}</span>
              <span>
                {[order.city, order.province].filter(Boolean).join(', ')}
                {order.postal_code ? ` ${order.postal_code}` : ''}
              </span>
              <span>{order.country || 'Vietnam'}</span>
            </address>
            {order.notes && (
              <p className="ac-panel-note">
                <strong>Notes</strong>
                <br />
                {order.notes}
              </p>
            )}
          </section>

          <section className="st-panel" aria-labelledby="ac-pay-title">
            <h2 className="ac-aside-title" id="ac-pay-title">
              {order.payment_method === 'cod' ? (
                <Money size={18} aria-hidden="true" />
              ) : (
                <CreditCard size={18} aria-hidden="true" />
              )}
              Payment
            </h2>

            <dl className="ac-kv">
              <div>
                <dt>Method</dt>
                <dd>{getPaymentMethodLabel(order.payment_method)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <PaymentStatusBadge status={order.payment_status} />
                </dd>
              </div>
              {order.vnpay_transaction_no && (
                <div>
                  <dt>VNPay transaction</dt>
                  <dd className="st-num">{order.vnpay_transaction_no}</dd>
                </div>
              )}
            </dl>

            {order.payment_method === 'cod' && order.payment_status !== 'PAID' && order.status !== 'CANCELLED' && (
              <p className="ac-panel-note">
                Prepare <strong>{money(order.total)}</strong> in cash to pay the courier on delivery.
              </p>
            )}

            {canRepay && (
              <p className="ac-panel-note">
                This order is waiting for payment. Use <strong>Pay again with VNPay</strong> at the top of the page.
              </p>
            )}
          </section>
        </aside>
      </div>

      {cancelModalOpen && (
        <CancelOrderDialog
          orderLabel={label}
          reason={cancelReason}
          onReasonChange={setCancelReason}
          error={cancelError}
          isCancelling={isCancelling}
          onClose={closeCancel}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}

function CancelOrderDialog({ orderLabel: label, reason, onReasonChange, error, isCancelling, onClose, onConfirm }) {
  const dialogRef = useRef(null);

  // Escape closes; focus starts in the dialog and returns to the opener afterwards.
  useEffect(() => {
    const opener = document.activeElement;
    dialogRef.current?.querySelector('textarea')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
    };
  }, [onClose]);

  return (
    <div
      className="st-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="st-modal ac-cancel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ac-cancel-title"
        aria-describedby="ac-cancel-desc"
        ref={dialogRef}
      >
        <div className="st-modal__head">
          <div>
            <h2 className="st-modal__title" id="ac-cancel-title">Cancel this order?</h2>
            <p className="st-caption">Order {label}</p>
          </div>
          <button type="button" className="st-btn st-btn--icon st-btn--sm" onClick={onClose} aria-label="Close" disabled={isCancelling}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="st-modal__body">
          <p className="ac-cancel__desc" id="ac-cancel-desc">
            Once an order is cancelled it can't be reopened. You can place a new order at any time.
          </p>

          {error && (
            <p className="st-note st-note--error" role="alert">
              <WarningCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <label className="st-field">
            <span className="st-label">Reason (optional)</span>
            <textarea
              className="st-textarea"
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="For example, wrong delivery address or no longer needed"
            />
          </label>
        </div>

        <div className="st-modal__foot">
          <button type="button" className="st-btn" onClick={onClose} disabled={isCancelling}>
            Keep order
          </button>
          <button
            type="button"
            className="st-btn ac-cancel__confirm"
            onClick={onConfirm}
            disabled={isCancelling}
            aria-busy={isCancelling}
          >
            {isCancelling ? 'Cancelling…' : 'Cancel order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
