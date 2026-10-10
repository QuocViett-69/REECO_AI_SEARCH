// ─── Orders & Payments Test Suite (Task 2: 2.1, 2.2, 2.4) ──────────────────────
// Tests order creation, history, status transitions, delivery estimations,
// currency formatting, and VNPay payment initiation and verification via API.

import {
  orderService,
  SHIPPING_METHODS,
  ORDER_STATUSES,
  calculateEstimatedDelivery,
  formatCurrency,
} from './services/orderService';
import {
  paymentService,
  createVnpayPaymentUrl,
  verifyVnpayReturn,
  BANK_TRANSFER_INFO,
} from './services/paymentService';
import { apiFetch } from './services/apiFetch';

// Mock apiFetch
jest.mock('./services/apiFetch', () => ({
  __esModule: true,
  apiFetch: jest.fn(),
  default: jest.fn(),
}));

describe('Task 2: Orders & Payments API Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── 1. Order Statuses & Shipping Methods Definitions ───────────────────────
  describe('Constants & Shipping Calculations', () => {
    test('ORDER_STATUSES contains all required e-commerce order workflow statuses', () => {
      const statuses = Object.keys(ORDER_STATUSES);
      expect(statuses).toContain('PENDING_PAYMENT');
      expect(statuses).toContain('PAID');
      expect(statuses).toContain('PROCESSING');
      expect(statuses).toContain('FORWARDED_TO_MANUFACTURER');
      expect(statuses).toContain('SHIPPED');
      expect(statuses).toContain('DELIVERED');
      expect(statuses).toContain('CANCELLED');
      expect(statuses).toContain('PAYMENT_FAILED');
    });

    test('SHIPPING_METHODS has standard (250.000 ₫) and express (500.000 ₫)', () => {
      expect(SHIPPING_METHODS.standard).toBeDefined();
      expect(SHIPPING_METHODS.standard.fee).toBe(250000);
      expect(SHIPPING_METHODS.standard.deliveryDaysMin).toBe(7);
      expect(SHIPPING_METHODS.standard.deliveryDaysMax).toBe(10);

      expect(SHIPPING_METHODS.express).toBeDefined();
      expect(SHIPPING_METHODS.express.fee).toBe(500000);
      expect(SHIPPING_METHODS.express.deliveryDaysMin).toBe(2);
      expect(SHIPPING_METHODS.express.deliveryDaysMax).toBe(3);
    });

    test('SHIPPING_METHODS fees and day counts match the API orders.constants.ts', () => {
      const fs = require('fs');
      const path = require('path');
      const src = fs.readFileSync(
        path.join(__dirname, '../../api/src/modules/orders/orders.constants.ts'),
        'utf8'
      );
      for (const key of ['standard', 'express']) {
        const block = src.match(new RegExp(`${key}:\\s*{([^}]*)}`))[1];
        const num = (name) => Number(block.match(new RegExp(`${name}:\\s*(\\d+)`))[1]);
        const m = SHIPPING_METHODS[key];
        expect([m.fee, m.deliveryDaysMin, m.deliveryDaysMax]).toEqual([
          num('fee_vnd'),
          num('min_days'),
          num('max_days'),
        ]);
        expect(m.description).toContain(`${m.deliveryDaysMin}–${m.deliveryDaysMax} `);
      }
    });

    test('calculateEstimatedDelivery computes from/to dates accurately', () => {
      const base = new Date('2026-09-24T10:00:00Z');
      const standardEst = calculateEstimatedDelivery(base, 'standard');
      expect(new Date(standardEst.from) < new Date(standardEst.to)).toBe(true);
      expect(standardEst.display).toBeDefined();

      const expressEst = calculateEstimatedDelivery(base, 'express');
      expect(new Date(expressEst.from) < new Date(expressEst.to)).toBe(true);
    });

    test('formatCurrency formats integer amounts correctly into VND', () => {
      const formatted = formatCurrency(26670000);
      expect(formatted).toContain('26.670.000');
      expect(formatted).toContain('₫');

      expect(formatCurrency(0)).toContain('0');
      expect(formatCurrency(null)).toBe('0 ₫');
      expect(formatCurrency(undefined)).toBe('0 ₫');
    });
  });

  // ── 2. OrderService API Calls ──────────────────────────────────────────────
  describe('OrderService - API Integration', () => {
    test('createOrder sends POST /orders with CreateOrderRequest payload', async () => {
      const mockCreatedOrder = {
        id: 'ord-uuid-1001',
        order_number: 1001,
        order_code: 'REECO-1001',
        status: 'PROCESSING',
        payment_method: 'cod',
        total: 26670000,
        currency: 'VND',
      };
      apiFetch.mockResolvedValueOnce(mockCreatedOrder);

      const requestPayload = {
        items: [{ product_id: 'CSI_CS655', quantity: 2 }],
        payment_method: 'cod',
        shipping_method: 'standard',
        customer_name: 'Hai Tran',
        customer_email: 'haitran@example.com',
        customer_phone: '+84 908 123 456',
        shipping_address: '128 Nguyễn Văn Thủ, Quận 1',
        city: 'Thành phố Hồ Chí Minh',
      };

      const result = await orderService.createOrder(requestPayload);

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith('/orders', {
        method: 'POST',
        body: JSON.stringify(requestPayload),
      });
      expect(result).toEqual(mockCreatedOrder);
    });

    test('createOrder handles API error (e.g. 400 Bad Request)', async () => {
      const apiError = new Error('Thiếu sản phẩm trong đơn hàng');
      apiError.status = 400;
      apiFetch.mockRejectedValueOnce(apiError);

      await expect(
        orderService.createOrder({ items: [] })
      ).rejects.toThrow('Thiếu sản phẩm trong đơn hàng');
    });

    test('getMyOrders calls GET /orders/me with pagination', async () => {
      const mockOrdersResponse = {
        data: [
          { id: '1', order_code: 'REECO-1001', total: 26670000 },
          { id: '2', order_code: 'REECO-1002', total: 11930000 },
        ],
        pagination: { total: 2, page: 1, pageSize: 20 },
      };
      apiFetch.mockResolvedValueOnce(mockOrdersResponse);

      const result = await orderService.getMyOrders(1, 20);

      expect(apiFetch).toHaveBeenCalledWith('/orders/me?page=1&page_size=20');
      expect(result.items.length).toBe(2);
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
    });

    test('getCustomerOrders returns data array for backward compatibility', async () => {
      const mockOrdersResponse = {
        data: [{ id: '1', order_code: 'REECO-1001' }],
      };
      apiFetch.mockResolvedValueOnce(mockOrdersResponse);

      const orders = await orderService.getCustomerOrders();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBe(1);
      expect(orders[0].order_code).toBe('REECO-1001');
    });

    test('getOrderById calls GET /orders/:orderId and returns order data', async () => {
      const mockOrder = {
        id: 'ord-uuid-1002',
        order_code: 'REECO-1002',
        order_number: 1002,
        status: 'SHIPPED',
        total: 11930000,
        order_items: [],
      };
      apiFetch.mockResolvedValueOnce(mockOrder);

      const res = await orderService.getOrderById('REECO-1002');

      expect(apiFetch).toHaveBeenCalledWith('/orders/REECO-1002');
      expect(res.order).toEqual(mockOrder);
      expect(res.order_code).toBe('REECO-1002');
    });

    test('cancelOrder calls POST /orders/:orderId/cancel with reason', async () => {
      const mockCancelledOrder = {
        id: 'ord-uuid-1003',
        status: 'CANCELLED',
      };
      apiFetch.mockResolvedValueOnce(mockCancelledOrder);

      const result = await orderService.cancelOrder(
        'REECO-1003',
        'Khách đổi ý muốn mua sản phẩm khác'
      );

      expect(apiFetch).toHaveBeenCalledWith('/orders/REECO-1003/cancel', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Khách đổi ý muốn mua sản phẩm khác' }),
      });
      expect(result).toEqual(mockCancelledOrder);
    });

    test('getAllOrdersForAdmin calls GET /admin/orders with query parameters', async () => {
      // Shape returned by GET /admin/orders (orders.repository listAdminOrders)
      const mockAdminRes = {
        items: [{ id: '1', order_code: 'REECO-1001' }],
        total: 1,
      };
      apiFetch.mockResolvedValueOnce(mockAdminRes);

      const result = await orderService.getAllOrdersForAdmin({
        search: 'Hai Tran',
        status: 'PROCESSING',
      });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/orders?')
      );
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Hai+Tran')
      );
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=PROCESSING')
      );
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('page_size=100')
      );
      expect(result.orders.length).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    test('updateOrderStatus calls PATCH /admin/orders/:orderId/status', async () => {
      const mockUpdated = {
        id: 'ord-1001',
        status: 'SHIPPED',
      };
      apiFetch.mockResolvedValueOnce(mockUpdated);

      const result = await orderService.updateOrderStatus(
        'ord-1001',
        'SHIPPED',
        'Bàn giao cho bưu tá'
      );

      expect(apiFetch).toHaveBeenCalledWith('/admin/orders/ord-1001/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SHIPPED', note: 'Bàn giao cho bưu tá' }),
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  // ── 3. PaymentService API Calls (Task 2.2 VNPay) ───────────────────────────
  describe('PaymentService - VNPay Sandbox Integration', () => {
    test('createVnpayPaymentUrl sends ONLY { order_id } in body to /payments/vnpay/create-url', async () => {
      const mockUrlResponse = {
        payment_url:
          'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1244000000&vnp_TxnRef=1003112233',
        txn_ref: '1003112233',
      };
      apiFetch.mockResolvedValueOnce(mockUrlResponse);

      const result = await createVnpayPaymentUrl('ord-uuid-1003');

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith('/payments/vnpay/create-url', {
        method: 'POST',
        body: JSON.stringify({ order_id: 'ord-uuid-1003' }),
      });
      expect(result).toEqual(mockUrlResponse);
      expect(result.payment_url).toContain('sandbox.vnpayment.vn');
    });

    test('paymentService.createVnpayPaymentUrl instance method calls createVnpayPaymentUrl', async () => {
      apiFetch.mockResolvedValueOnce({ payment_url: 'https://sandbox.vnpayment.vn/test' });

      const res = await paymentService.createVnpayPaymentUrl(1003);

      expect(apiFetch).toHaveBeenCalledWith('/payments/vnpay/create-url', {
        method: 'POST',
        body: JSON.stringify({ order_id: '1003' }),
      });
      expect(res.payment_url).toBeDefined();
    });

    test('verifyVnpayReturn calls GET /payments/vnpay/verify with search parameters', async () => {
      const mockVerifyResponse = {
        success: true,
        code: '00',
        message: 'Thanh toán thành công qua VNPay.',
        transaction_no: '14589230',
        order: {
          id: 'ord-uuid-1002',
          order_code: 'REECO-1002',
          status: 'PROCESSING',
          payment_status: 'PAID',
        },
      };
      apiFetch.mockResolvedValueOnce(mockVerifyResponse);

      const searchStr = '?vnp_Amount=1193000000&vnp_ResponseCode=00&vnp_TxnRef=1002847361&vnp_SecureHash=abcdef';
      const result = await verifyVnpayReturn(searchStr);

      expect(apiFetch).toHaveBeenCalledWith(`/payments/vnpay/verify${searchStr}`);
      expect(result.success).toBe(true);
      expect(result.code).toBe('00');
      expect(result.transaction_no).toBe('14589230');
      expect(result.order.payment_status).toBe('PAID');
    });

    test('verifyVNPayCallback accepts object params and converts to query string', async () => {
      apiFetch.mockResolvedValueOnce({ success: false, code: '24', message: 'Giao dịch bị hủy bởi người dùng.' });

      const params = {
        vnp_Amount: '1244000000',
        vnp_ResponseCode: '24',
        vnp_TxnRef: '1003112233',
      };

      const result = await paymentService.verifyVNPayCallback(params);

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/payments/vnpay/verify?')
      );
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('vnp_ResponseCode=24')
      );
      expect(result.success).toBe(false);
    });

    test('BANK_TRANSFER_INFO contains required bank transfer details', () => {
      expect(BANK_TRANSFER_INFO.bankName).toBeDefined();
      expect(BANK_TRANSFER_INFO.accountName).toContain('REECO');
      expect(BANK_TRANSFER_INFO.accountNumber).toBeDefined();
      expect(BANK_TRANSFER_INFO.swiftCode).toBeDefined();
    });
  });
});
