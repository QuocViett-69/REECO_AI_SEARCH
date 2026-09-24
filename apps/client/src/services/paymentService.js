// ─── Payment Service & VNPay Sandbox Abstraction ──────────────────────────────
// Architecture: PaymentService -> PaymentProvider -> VNPaySandboxProvider

export const BANK_TRANSFER_INFO = {
  bankName: 'Techcombank (Vietnam Technological and Commercial Joint Stock Bank)',
  accountName: 'CONG TY CO PHAN CONG NGHE VA THIET BI REECO',
  accountNumber: '19036888999018',
  branch: 'Tan Binh Branch - HCMC',
  swiftCode: 'VTCBVNVX',
};

// Abstract Base Payment Provider
class PaymentProvider {
  createPaymentUrl(_payment) {
    throw new Error('createPaymentUrl must be implemented by subclass');
  }
  verifyCallback(_params) {
    throw new Error('verifyCallback must be implemented by subclass');
  }
}

// VNPay Sandbox Provider Implementation
export class VNPaySandboxProvider extends PaymentProvider {
  constructor(config = {}) {
    super();
    this.tmnCode = config.tmnCode || 'REECO001';
    this.hashSecret = config.hashSecret || 'SANDBOX_HASH_SECRET_REECO';
    this.vnpUrl = config.vnpUrl || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  }

  createPaymentUrl(payment) {
    const { orderId, amount, orderInfo, returnUrl, ipnUrl } = payment;
    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    // Convert amount to VND multiplier if needed (Standard VNPay Sandbox uses VND integer)
    // For demo USD, we normalize: 1 USD ~ 25,400 VND or standard integer amount
    const amountInCents = Math.round(amount * 100);

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: `REECO_${orderId}_${Date.now()}`,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang REECO #${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amountInCents,
      vnp_ReturnUrl: returnUrl || (typeof window !== 'undefined' ? window.location?.origin : 'http://localhost:3000'),
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_IpnUrl: ipnUrl || '',
    };

    const searchParams = new URLSearchParams(vnpParams);
    // Deterministic mock signature for sandbox
    const signature = `mock_sig_${orderId}_${amountInCents}`;
    searchParams.set('vnp_SecureHash', signature);

    return {
      paymentUrl: `${this.vnpUrl}?${searchParams.toString()}`,
      transactionRef: vnpParams.vnp_TxnRef,
      provider: 'VNPAY_SANDBOX',
    };
  }

  verifyCallback(params) {
    if (!params) return { success: false, code: '99', message: 'No callback parameters provided' };

    const responseCode = params.vnp_ResponseCode || params.responseCode;
    const txnRef = params.vnp_TxnRef || params.transactionRef;

    // In VNPay responseCode '00' indicates successful transaction
    if (responseCode === '00' || responseCode === 'SUCCESS') {
      return {
        success: true,
        code: '00',
        message: 'Giao dich thanh cong qua VNPay Sandbox',
        transactionId: params.vnp_TransactionNo || `VNP_${Date.now()}`,
        transactionRef: txnRef,
        provider: 'VNPAY_SANDBOX',
      };
    }

    return {
      success: false,
      code: responseCode || '97',
      message: 'Giao dich khong thanh cong hoac bi huy bo boi nguoi dung',
      transactionRef: txnRef,
      provider: 'VNPAY_SANDBOX',
    };
  }
}

// Payment Service Orchestrator
class PaymentService {
  constructor() {
    this.providers = {
      vnpay: new VNPaySandboxProvider(),
    };
    this.processedCallbacks = new Set();
  }

  createPayment({ orderId, amount, method, customer }) {
    if (!orderId || !amount) {
      throw new Error('orderId and amount are required to initialize payment');
    }

    if (method === 'bank_transfer') {
      return {
        status: 'PENDING_PAYMENT',
        method: 'bank_transfer',
        provider: 'MANUAL_BANK_TRANSFER',
        amount,
        bankDetails: {
          ...BANK_TRANSFER_INFO,
          transferReference: `REECO-${orderId}`,
        },
      };
    }

    if (method === 'mastercard' || method === 'vnpay') {
      const vnpayProvider = this.providers.vnpay;
      const paymentIntent = vnpayProvider.createPaymentUrl({
        orderId,
        amount,
        orderInfo: `Thanh toan don hang REECO #${orderId} - Khach hang: ${customer?.name || 'Customer'}`,
      });

      return {
        status: 'PENDING_PAYMENT',
        method: 'mastercard',
        provider: 'VNPAY_SANDBOX',
        amount,
        paymentUrl: paymentIntent.paymentUrl,
        transactionRef: paymentIntent.transactionRef,
      };
    }

    throw new Error(`Unsupported payment method: ${method}`);
  }

  verifyPaymentCallback(params) {
    const callbackKey = `${params.vnp_TxnRef || params.transactionRef}_${params.vnp_ResponseCode || params.responseCode}`;

    // Idempotency check: Repeated callbacks must not create duplicate transitions
    const isDuplicate = this.processedCallbacks.has(callbackKey);
    if (!isDuplicate) {
      this.processedCallbacks.add(callbackKey);
    }

    const verification = this.providers.vnpay.verifyCallback(params);
    return {
      ...verification,
      isDuplicate,
      payment: {
        status: verification.success ? 'PAID' : 'FAILED',
        provider: 'VNPAY_SANDBOX',
        transactionId: verification.transactionId || null,
        transactionRef: verification.transactionRef || null,
      },
      error: verification.success ? null : 'payment_failed',
    };
  }

  verifyVNPayCallback(params) {
    return this.verifyPaymentCallback(params);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
