// ─── Payment Service (VNPay Sandbox Integration) ──────────────────────────────
// Client API integration via apiFetch for payment initialization and verification.

import { apiFetch } from './apiFetch.js';

export const BANK_TRANSFER_INFO = {
  bankName: 'Techcombank (Vietnam Technological and Commercial Joint Stock Bank)',
  accountName: 'CONG TY CO PHAN CONG NGHE VA THIET BI REECO',
  accountNumber: '19036888999018',
  branch: 'Tan Binh Branch - HCMC',
  swiftCode: 'VTCBVNVX',
};

/**
 * Tạo URL thanh toán VNPay cho đơn hàng
 * Chỉ gửi duy nhất { order_id }
 * @param {string} orderId
 * @returns {Promise<{ payment_url: string, txn_ref: string }>}
 */
export async function createVnpayPaymentUrl(orderId) {
  return await apiFetch('/payments/vnpay/create-url', {
    method: 'POST',
    body: JSON.stringify({ order_id: String(orderId) }),
  });
}

/**
 * Xác thực kết quả giao dịch thanh toán từ VNPay return URL
 * @param {string} search - Chuỗi query string từ window.location.search
 * @returns {Promise<{ success: boolean, code: string, message: string, transaction_no?: string, order?: Object }>}
 */
export async function verifyVnpayReturn(search) {
  const query = search ? (search.startsWith('?') ? search : `?${search}`) : '';
  return await apiFetch(`/payments/vnpay/verify${query}`);
}

class PaymentService {
  async createVnpayPaymentUrl(orderId) {
    return await createVnpayPaymentUrl(orderId);
  }

  async verifyVnpayReturn(search) {
    return await verifyVnpayReturn(search);
  }

  // Tương thích ngược nếu có chỗ gọi verifyVNPayCallback
  async verifyVNPayCallback(searchOrParams) {
    const search =
      typeof searchOrParams === 'string'
        ? searchOrParams
        : new URLSearchParams(searchOrParams || {}).toString();
    return await verifyVnpayReturn(search);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
