import React, { useState, useEffect } from 'react';
import '../../styles/studio/commerce.css';
import { CircleNotch, Package, ShoppingBag, WarningCircle } from '../common/SkyIconSet';
import { orderService, formatCurrency } from '../../services/orderService';
import { PaperCutStation } from '../common/PaperCutStation';

export function OrderSuccessPage({ orderId, onNavigate }) {
  const effectiveOrderId =
    orderId ||
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('reeco_order_success_id') ||
        sessionStorage.getItem('reeco_last_order_id')
      : null);

  // Show the order saved at checkout straight away, then refresh it from the server
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
      return undefined;
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
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveOrderId]);

  if (loading) {
    return (
      <div className="st-page">
        <div className="st-loading" role="status">
          <CircleNotch size={20} className="spin" aria-hidden="true" /> Confirming your order with REECO
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="st-page st-page--narrow">
        <div className="st-state" role="alert">
          <span className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><WarningCircle size={22} /></span>
          </span>
          <h1 className="st-state__title">Order details could not load</h1>
          <p className="st-state__desc">{error}</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => onNavigate && onNavigate('account-orders')}>
              View my orders
            </button>
            <button type="button" className="st-btn" onClick={() => onNavigate && onNavigate('products')}>
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const targetId = order?.id || order?.order_code || orderId;
  const orderCode = order
    ? order.order_code || (order.order_number ? `REECO-${order.order_number}` : order.id)
    : orderId;
  const isPaid = order?.payment_status === 'PAID';

  return (
    <div className="st-page">
      <section className="cm-celebrate" role="status">
        <div className="cm-celebrate__text">
          {orderCode && <span className="cm-celebrate__ref">Order {String(orderCode).startsWith('REECO') ? orderCode : `#${orderCode}`}</span>}
          <h1 className="cm-celebrate__title">Order placed.</h1>
          <p className="cm-celebrate__desc">
            Thank you for choosing REECO. Your order is recorded and ready for calibration and
            dispatch, and you can follow every step from your account.
          </p>

          {order && (
            <dl className="st-dl cm-receipt">
              <div>
                <dt>Total</dt>
                <dd className="st-num">{formatCurrency(order.total)}</dd>
              </div>
              <div>
                <dt>Payment method</dt>
                <dd>{order.payment_method === 'cod' ? 'Cash on delivery (COD)' : 'VNPay'}</dd>
              </div>
              <div>
                <dt>Payment status</dt>
                <dd>
                  <span className={`st-status ${isPaid ? 'st-status--green' : 'st-status--amber'}`}>
                    {isPaid ? 'Paid' : order.payment_status === 'COD_PENDING' ? 'Pay on delivery' : 'Awaiting payment'}
                  </span>
                </dd>
              </div>
            </dl>
          )}

          <div className="cm-celebrate__actions">
            {targetId && (
              <button
                type="button"
                className="st-btn st-btn--primary st-btn--lg"
                onClick={() => onNavigate && onNavigate(`account-order:${targetId}`)}
              >
                <Package size={18} aria-hidden="true" />
                <span>Track order</span>
              </button>
            )}
            <button
              type="button"
              className="st-btn st-btn--lg"
              onClick={() => onNavigate && onNavigate('products')}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span>Continue shopping</span>
            </button>
          </div>
        </div>

        <div className="cm-celebrate__art">
          <PaperCutStation />
        </div>
      </section>
    </div>
  );
}

export default OrderSuccessPage;
