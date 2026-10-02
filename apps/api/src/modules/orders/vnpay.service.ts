import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { formatVnpDate } from '../payments/vnpay.service';
import { OrdersRepository } from './orders.repository';

export interface VNPayUrlResult {
  payment_url: string;
  txn_ref: string;
  order_id: string;
}

export interface VNPayVerifyResult {
  success: boolean;
  is_already_paid?: boolean;
  message: string;
  code?: string;
  order?: any;
}

export interface VNPayIpnResponse {
  RspCode: string;
  Message: string;
}

@Injectable()
export class VNPayService {
  private readonly logger = new Logger(VNPayService.name);

  constructor(private readonly ordersRepository: OrdersRepository) {}

  private get tmnCode(): string {
    if (!process.env.VNPAY_TMN_CODE) throw new ServiceUnavailableException('VNPay is not configured');
    return process.env.VNPAY_TMN_CODE;
  }

  private get hashSecret(): string {
    if (!process.env.VNPAY_HASH_SECRET) throw new ServiceUnavailableException('VNPay is not configured');
    return process.env.VNPAY_HASH_SECRET;
  }

  private get payUrl(): string {
    return process.env.VNPAY_PAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  }

  private get returnUrl(): string {
    return (
      process.env.VNPAY_RETURN_URL ||
      'http://localhost:5173/payment/vnpay-return'
    );
  }

  /**
   * Sắp xếp tham số theo chuẩn VNPay (thay %20 bằng +)
   */
  sortObject(obj: Record<string, any>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (const key of str) {
      sorted[key] = encodeURIComponent(String(obj[key] ?? '')).replace(/%20/g, '+');
    }
    return sorted;
  }

  /**
   * Sinh chuỗi thời gian định dạng YYYYMMDDHHmmss theo múi giờ Việt Nam (UTC+7)
   */
  getVietnamDateTime(date = new Date()): string {
    return formatVnpDate(date);
  }

  /**
   * Tính hash SHA-512 cho các tham số VNPay theo chuẩn official Node.js VNPay
   */
  calculateSignature(params: Record<string, any>): string {
    const sorted = this.sortObject(params);
    const signData = Object.entries(sorted).map(([key, value]) => `${key}=${value}`).join('&');
    return crypto
      .createHmac('sha512', this.hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
  }

  /**
   * Kiểm tra tính hợp lệ của chữ ký phản hồi từ VNPay
   */
  verifySignature(queryParams: Record<string, any>): boolean {
    const rawHash = queryParams['vnp_SecureHash'];
    if (typeof rawHash !== 'string' || !/^[a-fA-F0-9]{128}$/.test(rawHash)) return false;
    const secureHash = rawHash.toLowerCase();

    const cleanParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(queryParams)) {
      if (key === 'vnp_SecureHash' || key === 'vnp_SecureHashType') {
        continue;
      }
      if (
        key.startsWith('vnp_') &&
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        cleanParams[key] = String(value);
      }
    }

    const sortedParams = this.sortObject(cleanParams);
    const signData = Object.entries(sortedParams).map(([key, value]) => `${key}=${value}`).join('&');
    const hash = crypto
      .createHmac('sha512', this.hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex')
      .toLowerCase();

    if (hash === secureHash) return true;

    // Biến thể dự phòng: encodeURIComponent thông thường không thay thế dấu +
    const sortedKeys = Object.keys(cleanParams).sort();
    const signParts1: string[] = [];
    for (const key of sortedKeys) {
      signParts1.push(`${encodeURIComponent(key)}=${encodeURIComponent(cleanParams[key] ?? '')}`);
    }
    const hash1 = crypto
      .createHmac('sha512', this.hashSecret)
      .update(Buffer.from(signParts1.join('&'), 'utf-8'))
      .digest('hex')
      .toLowerCase();

    return hash1 === secureHash;
  }

  /**
   * POST /payments/vnpay/create-url:
   * - Cần đăng nhập, body chỉ { order_id }
   * - Kiểm tra chủ đơn, vnpay, PENDING_PAYMENT / PAYMENT_FAILED
   * - Tạo vnp_TxnRef mới mỗi lần thử (chỉ chữ số), lưu orders.vnpay_txn_ref
   * - PAYMENT_FAILED -> chuyển lại PENDING_PAYMENT
   * - amount = orders.total
   */
  async createPaymentUrl(
    user: User,
    orderId: string,
    ipAddr = '127.0.0.1',
  ): Promise<VNPayUrlResult> {
    if (typeof orderId !== 'string' || !orderId.trim()) {
      throw new BadRequestException('Mã đơn hàng order_id không được để trống');
    }

    const trimmed = orderId.trim();
    const order = await this.ordersRepository.findOrderByIdentifier(trimmed);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
    }

    // 1. Kiểm tra quyền sở hữu (chủ đơn hoặc admin)
    const isOwner = order.customer_id === user.id;
    const isAdmin = (user.app_metadata?.role as string) === 'admin';
    if (!isOwner && !isAdmin) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
    }

    // 2. Kiểm tra phương thức thanh toán
    if ((order.payment_method || '').toLowerCase() !== 'vnpay') {
      throw new BadRequestException(
        `Đơn hàng "${order.order_code}" được tạo với hình thức thanh toán ${order.payment_method}, không thể thanh toán qua VNPay`,
      );
    }

    // 3. Kiểm tra trạng thái: chỉ cho phép PENDING_PAYMENT hoặc PAYMENT_FAILED
    const allowedStatuses = ['PENDING_PAYMENT', 'PAYMENT_FAILED'];
    if (!allowedStatuses.includes(order.status)) {
      throw new ConflictException(
        `Đơn hàng "${order.order_code}" đang ở trạng thái "${order.status}", không thể khởi tạo thanh toán mới`,
      );
    }

    // 4. Tạo vnp_TxnRef mới (chỉ chứa chữ số)
    // Cấu trúc: [order_number][timestamp_ms] -> 100% số nguyên không trùng
    const randomSuffix = Math.floor(Math.random() * 900 + 100);
    const txnRef = `${order.order_number}${Date.now()}${randomSuffix}`;

    // 5. Nếu PAYMENT_FAILED -> chuyển lại PENDING_PAYMENT và lưu vnpay_txn_ref vào DB
    const resetToPending = order.status === 'PAYMENT_FAILED';
    await this.ordersRepository.updateOrderTxnRef(
      order.id,
      txnRef,
      resetToPending,
    );

    // 6. Xây dựng URL thanh toán VNPay
    const createDate = this.getVietnamDateTime();
    const amountInVnpUnits = Math.round(Number(order.total) * 100);

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${order.order_code}`,
      vnp_OrderType: 'other',
      vnp_Amount: String(amountInVnpUnits),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedParams = this.sortObject(vnpParams);
    const signData = Object.entries(sortedParams).map(([key, value]) => `${key}=${value}`).join('&');
    const secureHash = crypto
      .createHmac('sha512', this.hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    sortedParams['vnp_SecureHash'] = secureHash;
    const paymentUrl = `${this.payUrl}?${Object.entries(sortedParams).map(([key, value]) => `${key}=${value}`).join('&')}`;

    return {
      payment_url: paymentUrl,
      txn_ref: txnRef,
      order_id: order.id,
    };
  }

  /**
   * GET /payments/vnpay/verify:
   * - Kiểm tra chữ ký HMAC-SHA512
   * - Tìm đơn theo TxnRef
   * - Kiểm tra vnp_Amount / 100 == total
   * - Idempotent: Đơn đã PAID trả kết quả cũ, không tạo thêm notification
   * - Cập nhật DB: PAID -> PROCESSING, paid_at, transaction_no / PAYMENT_FAILED
   * - Trả response kèm order
   */
  async verifyPayment(
    queryParams: Record<string, any>,
  ): Promise<VNPayVerifyResult> {
    const txnRef = queryParams['vnp_TxnRef'];
    const vnpAmountRaw = queryParams['vnp_Amount'];
    const responseCode = queryParams['vnp_ResponseCode'];
    const transactionNo = queryParams['vnp_TransactionNo'];

    // 1. Kiểm tra chữ ký
    const isValidSignature = this.verifySignature(queryParams);
    if (!isValidSignature) {
      throw new BadRequestException(
        'Chữ ký giao dịch VNPay không hợp lệ (Sai checksum hoặc bị thay đổi tham số)',
      );
    }

    if (!txnRef) {
      throw new BadRequestException('Mã giao dịch vnp_TxnRef không hợp lệ');
    }

    // 2. Tìm đơn hàng theo TxnRef
    const order = await this.ordersRepository.findOrderByTxnRef(String(txnRef));
    if (!order) {
      throw new NotFoundException(
        `Không tìm thấy đơn hàng tương ứng với mã giao dịch VNPay "${txnRef}"`,
      );
    }

    // 3. Kiểm tra số tiền: vnp_Amount / 100 == order.total
    const vnpAmount = Number(vnpAmountRaw);
    const orderTotal = Number(order.total) * 100;
    if (vnpAmount !== orderTotal) {
      throw new BadRequestException(
        `Số tiền thanh toán (${vnpAmount} ₫) không khớp với giá trị đơn hàng (${orderTotal} ₫)`,
      );
    }

    // 4. Idempotent: nếu đơn đã PAID, trả kết quả cũ, không cập nhật lại, không bắn notification
    if (order.payment_status === 'PAID') {
      return {
        success: true,
        is_already_paid: true,
        message: 'Đơn hàng đã được xác nhận thanh toán thành công trước đó.',
        order,
      };
    }

    // 5. Cập nhật trạng thái thanh toán
    if (responseCode === '00' && queryParams['vnp_TransactionStatus'] === '00') {
      // Thanh toán thành công -> PROCESSING / PAID
      const updatedOrder = await this.ordersRepository.recordPaymentSuccess(
        order,
        String(transactionNo || `VNP${Date.now()}`),
      );

      return {
        success: true,
        message: 'Thanh toán đơn hàng thành công qua cổng VNPay.',
        order: updatedOrder,
      };
    } else {
      // Thanh toán thất bại -> PAYMENT_FAILED / FAILED
      const updatedOrder = await this.ordersRepository.recordPaymentFailure(
        order,
        String(responseCode || '99'),
        transactionNo ? String(transactionNo) : undefined,
      );

      return {
        success: false,
        code: responseCode,
        message: `Giao dịch thanh toán không thành công (Mã phản hồi VNPay: ${responseCode}).`,
        order: updatedOrder,
      };
    }
  }

  /**
   * GET /payments/vnpay/ipn:
   * - Dùng chung logic kiểm tra và cập nhật với verify
   * - Trả định dạng chuẩn VNPay IPN: { RspCode, Message }
   */
  async processIpn(queryParams: Record<string, any>): Promise<VNPayIpnResponse> {
    const txnRef = queryParams['vnp_TxnRef'];
    const vnpAmountRaw = queryParams['vnp_Amount'];
    const responseCode = queryParams['vnp_ResponseCode'];
    const transactionNo = queryParams['vnp_TransactionNo'];

    // 1. Kiểm tra chữ ký
    if (!this.verifySignature(queryParams)) {
      this.logger.warn(`IPN: Invalid Checksum for txnRef: ${txnRef}`);
      return { RspCode: '97', Message: 'Checksum failed' };
    }

    // 2. Tìm đơn theo TxnRef
    const order = await this.ordersRepository.findOrderByTxnRef(String(txnRef));
    if (!order) {
      this.logger.warn(`IPN: Order not found for txnRef: ${txnRef}`);
      return { RspCode: '01', Message: 'Order not found' };
    }

    // 3. Kiểm tra số tiền
    const vnpAmount = Number(vnpAmountRaw);
    const orderTotal = Number(order.total) * 100;
    if (vnpAmount !== orderTotal) {
      this.logger.warn(
        `IPN: Invalid amount: vnp=${vnpAmount}, order=${orderTotal}`,
      );
      return { RspCode: '04', Message: 'Invalid amount' };
    }

    // 4. Idempotency check: đơn đã xác nhận trước đó
    if (order.payment_status === 'PAID') {
      return { RspCode: '02', Message: 'Order already confirmed' };
    }

    // 5. Cập nhật kết quả thanh toán
    try {
      if (responseCode === '00' && queryParams['vnp_TransactionStatus'] === '00') {
        await this.ordersRepository.recordPaymentSuccess(
          order,
          String(transactionNo || `VNP${Date.now()}`),
        );
      } else {
        await this.ordersRepository.recordPaymentFailure(
          order,
          String(responseCode || '99'),
          transactionNo ? String(transactionNo) : undefined,
        );
      }
      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (err: any) {
      this.logger.error(`IPN: Exception updating order: ${err.message}`);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }
}
