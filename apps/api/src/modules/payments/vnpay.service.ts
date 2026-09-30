import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { configuration } from '../../config/configuration';

// VNPay Pay API v2.1.0: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
// The hash secret stays on the server; the client only receives signed URLs.

type VnpParams = Record<string, string>;

export interface VnpayReturnResult {
  valid: boolean;
  success: boolean;
  order_id: string | null;
  txn_ref: string | null;
  transaction_no: string | null;
  response_code: string | null;
  amount_vnd: number | null;
  bank_code: string | null;
}

const PAYMENT_TTL_MS = 15 * 60 * 1000;

// yyyyMMddHHmmss in Vietnam time (GMT+7), as VNPay requires.
export function formatVnpDate(date: Date): string {
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${vn.getUTCFullYear()}${pad(vn.getUTCMonth() + 1)}${pad(vn.getUTCDate())}` +
    `${pad(vn.getUTCHours())}${pad(vn.getUTCMinutes())}${pad(vn.getUTCSeconds())}`
  );
}

// Same canonical form as VNPay's Node.js sample: sorted keys, form-encoded values.
export function buildSignData(params: VnpParams): string {
  return Object.entries(params)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`)
    .join('&');
}

export function signVnp(params: VnpParams, secret: string): string {
  return createHmac('sha512', secret)
    .update(Buffer.from(buildSignData(params), 'utf-8'))
    .digest('hex');
}

@Injectable()
export class VnpayService {
  private readonly config = configuration().vnpay;

  createPaymentUrl(input: {
    orderId: string;
    amountVnd: number;
    ipAddr: string;
    now?: Date;
  }): { payment_url: string; txn_ref: string; amount_vnd: number } {
    this.assertConfigured();
    const now = input.now ?? new Date();
    const txnRef = `${input.orderId}T${now.getTime()}`;
    const params: VnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.tmnCode,
      vnp_Amount: String(input.amountVnd * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang REECO-${input.orderId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.config.returnUrl,
      vnp_IpAddr: input.ipAddr,
      vnp_CreateDate: formatVnpDate(now),
      vnp_ExpireDate: formatVnpDate(new Date(now.getTime() + PAYMENT_TTL_MS)),
    };
    const hash = signVnp(params, this.config.hashSecret);
    return {
      payment_url: `${this.config.payUrl}?${buildSignData(params)}&vnp_SecureHash=${hash}`,
      txn_ref: txnRef,
      amount_vnd: input.amountVnd,
    };
  }

  verifyReturn(query: Record<string, unknown>): VnpayReturnResult {
    this.assertConfigured();
    const params: VnpParams = {};
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('vnp_') && typeof value === 'string') params[key] = value;
    }
    const received = params.vnp_SecureHash ?? '';
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const expected = signVnp(params, this.config.hashSecret);
    const valid =
      received.length === expected.length &&
      timingSafeEqual(Buffer.from(received.toLowerCase()), Buffer.from(expected));
    const txnRef = params.vnp_TxnRef ?? null;
    const amount = Number(params.vnp_Amount);

    return {
      valid,
      success:
        valid &&
        params.vnp_ResponseCode === '00' &&
        params.vnp_TransactionStatus === '00',
      order_id: txnRef ? (txnRef.split('T')[0] ?? null) : null,
      txn_ref: txnRef,
      transaction_no: params.vnp_TransactionNo ?? null,
      response_code: params.vnp_ResponseCode ?? null,
      amount_vnd: Number.isFinite(amount) ? amount / 100 : null,
      bank_code: params.vnp_BankCode ?? null,
    };
  }

  private assertConfigured(): void {
    if (!this.config.tmnCode || !this.config.hashSecret) {
      throw new ServiceUnavailableException('VNPay is not configured');
    }
  }
}
