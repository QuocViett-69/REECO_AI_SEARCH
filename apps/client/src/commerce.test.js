import { getProductPrice, getCommercialData, formatPrice, parseStoredItems } from './services/commercialService';
import { DEMO_CREDENTIALS, authenticateUser } from './services/authService';
import { orderService, SHIPPING_METHODS, ORDER_STATUSES, calculateEstimatedDelivery } from './services/orderService';
import { paymentService, getPaymentMethodLabel } from './services/paymentService';
import { notificationService, NOTIFICATION_TYPES } from './services/notificationService';
import { recommendationService } from './services/recommendationService';

describe('REECO Customer Commerce - Part 1, Part 2 & Part 3 Suite', () => {

  // ── 1. Commercial Product Tests ─────────────────────────────────────────────
  describe('Product Commercial & Pricing Layer', () => {
    const sampleProduct = {
      product_id: 'CSI_CS655',
      model: 'CS655',
      name: 'Soil Water Content Reflectometer',
    };

    test('price is correctly determined and formatted for CS655 (13.210.000 ₫)', () => {
      const price = getProductPrice(sampleProduct.product_id, sampleProduct.model);
      expect(price).toBe(13_210_000);
      expect(formatPrice(price)).toMatch(/^13\.210\.000\s₫$/);
    });

    test('availability is displayed as "Available for order" and purchasable', () => {
      const comm = getCommercialData(sampleProduct.product_id, sampleProduct.model);
      expect(comm.availability_label).toBe('Available for order');
      expect(comm.is_purchasable).toBe(true);
    });

    test('stock quantity and inventory numbers are NEVER exposed in commercial data', () => {
      const comm = getCommercialData(sampleProduct.product_id, sampleProduct.model);
      expect(comm.stock_quantity).toBeUndefined();
      expect(comm.inventory).toBeUndefined();
      expect(comm.stock).toBeUndefined();
      expect(comm.quantity_in_stock).toBeUndefined();
    });
  });

  // ── 2. Auth & Roles Tests ───────────────────────────────────────────────────
  describe('Authentication & Role Credentials', () => {
    test('customer credentials are correct: haitran / ilovereeco (role: customer)', () => {
      const cred = DEMO_CREDENTIALS.customer;
      expect(cred.username).toBe('haitran');
      expect(cred.password).toBe('ilovereeco');
      expect(cred.role).toBe('customer');
    });

    test('admin credentials are correct: reeco / ilovereeco (role: admin)', () => {
      const cred = DEMO_CREDENTIALS.admin;
      expect(cred.username).toBe('reeco');
      expect(cred.password).toBe('ilovereeco');
      expect(cred.role).toBe('admin');
    });

    test('role mismatch or invalid password fails authentication check', () => {
      expect(authenticateUser('customer', 'wronguser', 'ilovereeco').success).toBe(false);
      expect(authenticateUser('customer', 'haitran', 'wrongpass').success).toBe(false);
      expect(authenticateUser('customer', 'reeco', 'ilovereeco').success).toBe(false);
      expect(authenticateUser('customer', 'haitran', 'ilovereeco').success).toBe(true);
      expect(authenticateUser('admin', 'reeco', 'ilovereeco').success).toBe(true);
    });
  });

  // ── 3. Part 2: Shipping & Delivery Calculation ──────────────────────────────
  describe('Part 2 - Shipping Methods & Delivery Estimation', () => {
    test('Standard shipping fee is 250,000 VND and delivery is 7–10 days', () => {
      const standard = SHIPPING_METHODS.standard;
      expect(standard.fee).toBe(250_000);
      expect(standard.deliveryDaysMin).toBe(7);
      expect(standard.deliveryDaysMax).toBe(10);

      const baseDate = new Date('2026-09-24T10:00:00Z');
      const est = calculateEstimatedDelivery(baseDate, 'standard');
      expect(est.display).toContain('2026');
      expect(est.from < est.to).toBe(true);
    });

    test('Express shipping fee is 750,000 VND and delivery is 2–3 days', () => {
      const express = SHIPPING_METHODS.express;
      expect(express.fee).toBe(750_000);
      expect(express.deliveryDaysMin).toBe(2);
      expect(express.deliveryDaysMax).toBe(3);

      const baseDate = new Date('2026-09-24T10:00:00Z');
      const est = calculateEstimatedDelivery(baseDate, 'express');
      expect(est.display).toContain('2026');
      expect(est.from < est.to).toBe(true);
    });
  });

  // ── 4. Part 2: Order Creation & Pricing Integrity ───────────────────────────
  describe('Part 2 - Order Creation & Snapshots & Price Integrity', () => {
    const mockCustomer = {
      username: 'haitran',
      name: 'Hai Tran',
      email: 'haitran@example.com',
      role: 'customer',
    };

    const mockShippingInfo = {
      fullName: 'Hai Tran',
      email: 'haitran@example.com',
      phone: '+84 908 123 456',
      address: '128 Nguyen Van Thu, District 1',
      city: 'Ho Chi Minh City',
      province: 'Ho Chi Minh',
      country: 'Vietnam',
      postalCode: '700000',
      notes: 'Calibrated certification needed',
    };

    const mockItems = [
      { product_id: 'CSI_CS655', model: 'CS655', product_name: 'Water Content Reflectometer', price: 13_210_000, quantity: 2 },
      { product_id: 'CSI_CR300', model: 'CR300', product_name: 'Compact Measurement Datalogger', price: 17_270_000, quantity: 1 },
    ];

    test('creates order with sequential order ID incrementing', () => {
      const order1 = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'standard',
        paymentMethod: 'cod',
      });

      const order2 = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'express',
        paymentMethod: 'vnpay',
      });

      expect(typeof order1.order_id).toBe('number');
      expect(typeof order2.order_id).toBe('number');
      expect(order2.order_id).toBe(order1.order_id + 1);
      expect(order1.order_code).toBe(`REECO-${order1.order_id}`);
    });

    test('calculates subtotal, shipping fee, and total accurately on backend', () => {
      const order = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'standard',
        paymentMethod: 'cod',
      });

      expect(order.subtotal).toBe(43_690_000); // 13,210,000*2 + 17,270,000
      expect(order.shipping_fee).toBe(250_000);
      expect(order.total).toBe(43_940_000);
      expect(order.currency).toBe('VND');
    });

    test('creates immutable order item snapshots with historical unit price', () => {
      const order = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'standard',
        paymentMethod: 'cod',
      });

      expect(order.items.length).toBe(2);
      expect(order.items[0].model).toBe('CS655');
      expect(order.items[0].unit_price).toBe(13_210_000);
      expect(order.items[0].quantity).toBe(2);
      expect(order.items[0].line_total).toBe(26_420_000);
    });
  });

  // ── 5. Part 2: Authorization & Ownership ────────────────────────────────────
  describe('Part 2 - Authorization & Customer Ownership Isolation', () => {
    const customerHai = { username: 'haitran', role: 'customer' };
    const customerOther = { username: 'john_doe', role: 'customer' };
    const adminUser = { username: 'reeco', role: 'admin' };

    test('customer can retrieve only their own orders', () => {
      const haiOrders = orderService.getCustomerOrders('haitran');
      expect(Array.isArray(haiOrders)).toBe(true);
      expect(haiOrders.every((o) => o.customer_id === 'haitran')).toBe(true);

      const otherOrders = orderService.getCustomerOrders('john_doe');
      expect(otherOrders.length).toBe(0);
    });

    test('customer cannot view another customer order detail', () => {
      const haiOrders = orderService.getCustomerOrders('haitran');
      expect(haiOrders.length > 0).toBe(true);
      const orderId = haiOrders[0].order_id;

      const ownRes = orderService.getOrderById(orderId, customerHai);
      expect(ownRes.error).toBeUndefined();

      const unauthorizedRes = orderService.getOrderById(orderId, customerOther);
      expect(unauthorizedRes.error).toBe('forbidden');

      const adminRes = orderService.getOrderById(orderId, adminUser);
      expect(adminRes.error).toBeUndefined();
    });

    test('customer cannot access admin order list or modify order status', () => {
      const adminListAttempt = orderService.getAllOrdersForAdmin(customerHai);
      expect(adminListAttempt.error).toBe('forbidden');

      const haiOrders = orderService.getCustomerOrders('haitran');
      const orderId = haiOrders[0].order_id;
      const statusUpdateAttempt = orderService.updateOrderStatus(orderId, 'DELIVERED', customerHai);
      expect(statusUpdateAttempt.error).toBe('forbidden');
    });

    test('admin can update order status', () => {
      const adminOrdersRes = orderService.getAllOrdersForAdmin(adminUser);
      expect(adminOrdersRes.error).toBeUndefined();
      const targetOrder = adminOrdersRes.orders[0];

      const updateRes = orderService.updateOrderStatus(targetOrder.order_id, 'FORWARDED_TO_MANUFACTURER', adminUser);
      expect(updateRes.success).toBe(true);
      expect(updateRes.order.status).toBe('FORWARDED_TO_MANUFACTURER');
    });
  });

  // ── 6. Part 2: Payment Methods (COD + VNPay) ────────────────────────────
  describe('Part 2 - Payment Methods: COD & VNPay Sandbox', () => {
    const customer = { username: 'haitran', role: 'customer' };
    const items = [{ product_id: 'CSI_CS655', model: 'CS655', price: 13_210_000, currency: 'VND', quantity: 1 }];
    const shippingInfo = {
      fullName: 'Hai Tran', email: 'haitran@example.com', phone: '+84 908 123 456',
      address: '128 Nguyen Van Thu', city: 'Ho Chi Minh City',
    };

    test('only COD and VNPay are accepted', () => {
      expect(paymentService.createPayment({ orderId: 1, amount: 10, method: 'cod' }).provider).toBe('COD');
      expect(paymentService.createPayment({ orderId: 1, amount: 10, method: 'vnpay' }).provider).toBe('VNPAY_SANDBOX');
      expect(() => paymentService.createPayment({ orderId: 1, amount: 10, method: 'bank_transfer' })).toThrow();
      expect(() => paymentService.createPayment({ orderId: 1, amount: 10, method: 'mastercard' })).toThrow();
    });

    test('COD order is processed immediately and paid on delivery', () => {
      const order = orderService.createOrder({ customer, items, shippingInfo, paymentMethod: 'cod' });
      expect(order.status).toBe('PROCESSING');
      expect(order.payment_status).toBe('COD_PENDING');

      const admin = { username: 'reeco', role: 'admin' };
      expect(orderService.updateOrderStatus(order.order_id, 'SHIPPED', admin).order.payment_status).toBe('COD_PENDING');
      expect(orderService.updateOrderStatus(order.order_id, 'DELIVERED', admin).order.payment_status).toBe('PAID');
    });

    test('VNPay order waits for payment, and confirming twice is idempotent', () => {
      const order = orderService.createOrder({ customer, items, shippingInfo, paymentMethod: 'vnpay' });
      expect(order.status).toBe('PENDING_PAYMENT');
      expect(order.payment_status).toBe('PENDING_PAYMENT');

      const first = orderService.markOrderAsPaid(order.order_id, { vnp_ResponseCode: '00' });
      expect(first.order.payment_status).toBe('PAID');
      expect(first.duplicate).toBeUndefined();
      expect(orderService.markOrderAsPaid(order.order_id, { vnp_ResponseCode: '00' }).duplicate).toBe(true);
    });

    test('failed VNPay payment marks order failed but never downgrades a paid order', () => {
      const order = orderService.createOrder({ customer, items, shippingInfo, paymentMethod: 'vnpay' });
      const failed = orderService.markPaymentFailed(order.order_id, { vnp_ResponseCode: '24' });
      expect(failed.order.status).toBe('PAYMENT_FAILED');
      expect(failed.order.payment_status).toBe('FAILED');

      orderService.markOrderAsPaid(order.order_id);
      expect(orderService.markPaymentFailed(order.order_id).order.payment_status).toBe('PAID');
    });

    test('cart items saved in USD are re-priced in VND', () => {
      const [item] = parseStoredItems(JSON.stringify([{ product_id: 'CSI_CS655', model: 'CS655', price: 520, currency: 'USD', quantity: 1 }]));
      expect(item.price).toBe(13_210_000);
      expect(item.currency).toBe('VND');
    });

    test('legacy payment method ids still render a label', () => {
      expect(getPaymentMethodLabel('mastercard')).toBe('VNPay');
      expect(getPaymentMethodLabel('bank_transfer')).toBe('Bank Transfer');
      expect(getPaymentMethodLabel('cod')).toBe('Cash on Delivery (COD)');
    });
  });

  // ── 7. Part 3: Notifications & Daily Job ────────────────────────────────────
  describe('Part 3 - Notifications & Daily Scheduled Digest', () => {
    test('retrieves notifications exclusively for own customer ID', () => {
      const haiNotifs = notificationService.getNotifications('haitran');
      expect(Array.isArray(haiNotifs)).toBe(true);
      expect(haiNotifs.every((n) => n.customer_id === 'haitran')).toBe(true);

      const otherNotifs = notificationService.getNotifications('other_customer');
      expect(otherNotifs.length).toBe(0);
    });

    test('marks notification and all notifications as read', () => {
      const initialUnread = notificationService.getUnreadCount('haitran');
      expect(initialUnread >= 0).toBe(true);

      notificationService.markAllAsRead('haitran');
      expect(notificationService.getUnreadCount('haitran')).toBe(0);
    });

    test('prevents duplicate notifications within 1 hour', () => {
      const first = notificationService.createNotification({
        customer_id: 'haitran',
        type: 'ORDER_STATUS_CHANGED',
        title: 'Order #1003 Shipped',
        message: 'Order #1003 is on the way via air freight.',
        order_id: 1003,
      });
      expect(first.success).toBe(true);

      const duplicate = notificationService.createNotification({
        customer_id: 'haitran',
        type: 'ORDER_STATUS_CHANGED',
        title: 'Order #1003 Shipped',
        message: 'Order #1003 is on the way via air freight.',
        order_id: 1003,
      });
      expect(duplicate.duplicate).toBe(true);
    });
  });

  // ── 8. Part 3: AI Recommendations ("You may also need") ─────────────────────
  describe('Part 3 - AI Recommendation Integration Point', () => {
    test('returns technical compatibility recommendations with reason badges', async () => {
      const recs = await recommendationService.getProductRecommendations('CSI_CS655', 'CS655');
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length > 0).toBe(true);
      expect(recs[0].model).toBeDefined();
      expect(recs[0].reason).toBeDefined();
      expect(recs[0].price).toBeGreaterThan(0);
    });
  });
});
