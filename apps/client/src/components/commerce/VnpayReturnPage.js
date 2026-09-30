import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Package, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { paymentService, getVnpayMessage } from '../../services/paymentService';

// VNPay redirects the browser here (VNPAY_RETURN_URL) with vnp_* query params.
// The API checks the signature; only a verified '00' result marks the order paid.
export function VnpayReturnPage({ search, onNavigate }) {
  const { clearCart } = useCart();
  const [state, setState] = useState({ status: 'verifying' });
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    paymentService
      .verifyVnpayReturn(search)
      .then((result) => {
        if (!result.valid) {
          setState({ status: 'invalid', orderId: result.order_id });
          return;
        }
        const details = {
          provider: 'VNPAY_SANDBOX',
          vnp_TxnRef: result.txn_ref,
          vnp_TransactionNo: result.transaction_no,
          vnp_ResponseCode: result.response_code,
          vnp_BankCode: result.bank_code,
          amount_vnd: result.amount_vnd,
        };
        if (result.success) {
          orderService.markOrderAsPaid(result.order_id, details);
          clearCart();
          setState({ status: 'paid', orderId: result.order_id, amountVnd: result.amount_vnd });
        } else {
          orderService.markPaymentFailed(result.order_id, details);
          setState({
            status: 'failed',
            orderId: result.order_id,
            message: getVnpayMessage(result.response_code),
          });
        }
      })
      .catch((err) => setState({ status: 'error', message: err.message }));
  }, [search, clearCart]);

  const { status, orderId } = state;
  const ok = status === 'paid';
  const Icon = status === 'verifying' ? Loader2 : ok ? CheckCircle2 : XCircle;
  const color = status === 'verifying' ? '#0069e0' : ok ? '#0f9554' : '#d93025';
  const title = {
    verifying: 'Verifying your VNPay payment...',
    paid: 'Payment Successful',
    failed: 'Payment Not Completed',
    invalid: 'Payment Could Not Be Verified',
    error: 'Could Not Reach the Server',
  }[status];
  const message = {
    verifying: 'Please wait, do not close this page.',
    paid: `Your payment${state.amountVnd ? ` of ${state.amountVnd.toLocaleString('vi-VN')} ₫` : ''} was confirmed by VNPay.`,
    failed: state.message,
    invalid: 'The payment response signature is invalid. Your order was not marked as paid.',
    error: `${state.message || ''} Your order status will be updated once the payment is verified.`,
  }[status];

  return (
    <div className="page-container" style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ padding: 40, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: `${color}14`, color, marginBottom: 20 }}>
          <Icon size={48} className={status === 'verifying' ? 'spin' : undefined} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{title}</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>{message}</p>

        {status !== 'verifying' && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {orderId && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate(`account-order:${orderId}`)}
                style={{ padding: '12px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
              >
                <Package size={16} />
                <span>View Order #{orderId}</span>
              </button>
            )}
            {!ok && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('cart')}
                style={{ padding: '12px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
              >
                <ShoppingCart size={16} />
                <span>Back to Cart</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VnpayReturnPage;
