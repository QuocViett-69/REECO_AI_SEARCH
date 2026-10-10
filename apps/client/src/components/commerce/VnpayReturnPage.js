import React, { useEffect, useState } from 'react';
import '../../styles/studio/commerce.css';
import {
  ArrowClockwise,
  CircleNotch,
  Package,
  ShoppingBag,
  X,
} from '../common/SkyIconSet';
import { verifyVnpayReturn, createVnpayPaymentUrl } from '../../services/paymentService';
import { formatCurrency } from '../../services/orderService';
import { PaperCutStation } from '../common/PaperCutStation';

// VNPay redirects the browser here (VNPAY_RETURN_URL) with vnp_* query params.
// The API checks the signature and updates the order; this page only reports the result.
export function VnpayReturnPage({ search: returnSearch, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState(null);

  useEffect(() => {
    async function verify() {
      try {
        const search = returnSearch ?? window.location.search ?? '';
        if (!search) {
          // A reload after the redirect has no query string; reuse the saved result
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
        // Drop the vnp_* query so a reload shows the saved result instead of verifying again.
        // Router state is kept; the prop is unchanged, so this effect does not rerun.
        window.history.replaceState(window.history.state, '', window.location.pathname);
      } catch (err) {
        setError(err.message || 'Payment verification failed.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [returnSearch]);

  const handleRetryPayment = async () => {
    setRetryError(null);
    let orderId = result?.order?.id;
    if (!orderId && typeof sessionStorage !== 'undefined') {
      try {
        orderId =
          sessionStorage.getItem('reeco_last_order_id') ||
          JSON.parse(sessionStorage.getItem('reeco_active_payment') || '{}')?.orderId;
      } catch {}
    }
    if (!orderId) {
      setRetryError('Order information not found for retry.');
      return;
    }

    try {
      setRetrying(true);
      const res = await createVnpayPaymentUrl(orderId);
      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        setRetryError('Failed to obtain payment URL from VNPay. Please try again later.');
      }
    } catch (err) {
      setRetryError(err.message || 'Unable to re-initiate payment transaction.');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="st-page st-page--narrow">
        <div className="cm-moment cm-moment--quiet" role="status" aria-live="polite">
          <span className="st-orb st-orb--violet st-orb--live" aria-hidden="true">
            <span className="st-orb__icon"><CircleNotch size={22} className="spin" /></span>
          </span>
          <h1 className="cm-moment__title">Verifying your VNPay payment...</h1>
          <p className="cm-moment__desc">Checking the signature and updating your order. Please do not close this page.</p>
        </div>
      </div>
    );
  }

  const order = result?.order;
  const isSuccess = result?.success && (order?.payment_status === 'PAID' || result?.is_already_paid);
  const orderCode = order ? order.order_code || order.order_number || order.id : null;
  const orderTarget = order ? order.id || order.order_code : null;

  if (!error && isSuccess) {
    return (
      <div className="st-page">
        <section className="cm-celebrate" role="status" aria-live="polite">
          <div className="cm-celebrate__text">
            {orderCode && <span className="cm-celebrate__ref">Order {orderCode}</span>}
            <h1 className="cm-celebrate__title">Payment received.</h1>
            <p className="cm-celebrate__desc">
              {result?.message || 'Your transaction has been confirmed by the VNPay gateway.'}
            </p>

            {order && (
              <dl className="st-dl cm-receipt">
                <div>
                  <dt>Total paid</dt>
                  <dd className="st-num">{formatCurrency(order.total)}</dd>
                </div>
                <div>
                  <dt>Order status</dt>
                  <dd>{order.status}</dd>
                </div>
                {order.vnpay_transaction_no && (
                  <div>
                    <dt>VNPay transaction</dt>
                    <dd className="st-mono">{order.vnpay_transaction_no}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="cm-celebrate__actions">
              {orderTarget && (
                <button
                  type="button"
                  className="st-btn st-btn--primary st-btn--lg"
                  onClick={() => onNavigate && onNavigate(`account-order:${orderTarget}`)}
                >
                  <Package size={18} aria-hidden="true" />
                  <span>View order details</span>
                </button>
              )}
              <button type="button" className="st-btn st-btn--lg" onClick={() => onNavigate && onNavigate('products')}>
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

  return (
    <div className="st-page st-page--narrow">
      <div className="cm-moment cm-moment--quiet" role="status" aria-live="polite">
        <span className="st-orb st-orb--stone" aria-hidden="true">
          <span className="st-orb__icon"><X size={22} /></span>
        </span>
        <h1 className="cm-moment__title">Payment not completed</h1>
        <p className="cm-moment__desc">
          {error || result?.message || 'The VNPay transaction was cancelled or could not be completed.'}
        </p>

        {order && (
          <dl className="st-dl cm-receipt cm-receipt--center">
            <div>
              <dt>Order</dt>
              <dd>{orderCode}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd className="st-num">{formatCurrency(order.total)}</dd>
            </div>
            <div>
              <dt>Payment status</dt>
              <dd><span className="st-status st-status--red">{order.payment_status}</span></dd>
            </div>
          </dl>
        )}

        {retryError && <p className="st-note st-note--error cm-moment__note" role="alert">{retryError}</p>}

        <div className="cm-moment__actions">
          {order && (
            <button
              type="button"
              className="st-btn st-btn--primary st-btn--buy st-btn--lg"
              disabled={retrying}
              onClick={handleRetryPayment}
            >
              <ArrowClockwise size={17} className={retrying ? 'spin' : undefined} aria-hidden="true" />
              <span>{retrying ? 'Opening VNPay...' : 'Pay again'}</span>
            </button>
          )}
          {orderTarget && (
            <button
              type="button"
              className="st-btn st-btn--lg"
              onClick={() => onNavigate && onNavigate(`account-order:${orderTarget}`)}
            >
              <Package size={17} aria-hidden="true" />
              <span>View order details</span>
            </button>
          )}
          <button type="button" className="st-btn st-btn--lg" onClick={() => onNavigate && onNavigate('products')}>
            <ShoppingBag size={17} aria-hidden="true" />
            <span>Continue shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VnpayReturnPage;
