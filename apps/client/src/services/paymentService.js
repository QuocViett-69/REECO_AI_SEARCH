// ─── Payment Service ──────────────────────────────────────────────────────────
// Two methods: Cash on Delivery and VNPay (sandbox). VNPay URLs are signed by
// the API (/payments/vnpay/*) so the hash secret never reaches the browser.

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

export const PAYMENT_METHODS = {
  cod: {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    description: 'Pay in cash when the order is delivered to you.',
    provider: 'COD',
  },
  vnpay: {
    id: 'vnpay',
    name: 'VNPay',
    description: 'ATM card, Visa / Mastercard, QR code or bank app via VNPay (sandbox).',
    provider: 'VNPAY_SANDBOX',
  },
};

export const VNPAY_RETURN_PATH = '/payment/vnpay-return';

// Orders created before COD/VNPay-only checkout may still hold old method ids.
export function getPaymentMethodLabel(method) {
  if (method === 'mastercard') return PAYMENT_METHODS.vnpay.name;
  if (method === 'bank_transfer') return 'Bank Transfer';
  return PAYMENT_METHODS[method]?.name || method;
}

// VNPay response codes shown to customers (vnp_ResponseCode).
const VNPAY_MESSAGES = {
  '07': 'Payment was deducted but flagged as suspicious. Please contact support.',
  '09': 'Your card/account is not registered for Internet Banking.',
  10: 'Card/account verification failed more than 3 times.',
  11: 'The payment session expired. Please try again.',
  12: 'Your card/account is locked.',
  13: 'Incorrect OTP. Please try again.',
  24: 'Payment was cancelled.',
  51: 'Insufficient account balance.',
  65: 'Daily transaction limit exceeded.',
  75: 'The bank is under maintenance.',
  79: 'Incorrect payment password entered too many times.',
};

export function getVnpayMessage(code) {
  return VNPAY_MESSAGES[code] || 'VNPay payment was not successful.';
}

class PaymentService {
  createPayment({ orderId, amount, method }) {
    if (!orderId || !amount) {
      throw new Error('orderId and amount are required to initialize payment');
    }
    const selected = PAYMENT_METHODS[method];
    if (!selected) throw new Error(`Unsupported payment method: ${method}`);
    return {
      status: 'PENDING_PAYMENT',
      method: selected.id,
      provider: selected.provider,
      amount,
    };
  }

  async createVnpayPaymentUrl(order) {
    if (order.currency && order.currency !== 'VND') {
      throw new Error('VNPay only accepts orders priced in VND. Please place a new order.');
    }
    const res = await fetch(`${API_BASE_URL}/payments/vnpay/create-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: String(order.order_id), amount_vnd: order.total }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        res.status === 503
          ? 'VNPay is not configured on the server yet.'
          : data.message || 'Could not start VNPay payment.'
      );
    }
    return data; // { payment_url, txn_ref, amount_vnd }
  }

  // search: the query string VNPay appended to the return URL.
  async verifyVnpayReturn(search) {
    const res = await fetch(`${API_BASE_URL}/payments/vnpay/verify${search}`);
    if (!res.ok) throw new Error('Could not verify VNPay payment.');
    return res.json(); // { valid, success, order_id, transaction_no, response_code, ... }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
