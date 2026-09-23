// ─── REECO Customer Commerce Part 2 Test Suite ────────────────────────────────
import assert from 'node:assert/strict';
import { test, describe, beforeEach } from 'node:test';

// In-memory mock localStorage for Node environment
const store = new Map();
global.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

// Import services dynamically or define testing instances
import {
  SHIPPING_METHODS,
  ORDER_STATUSES,
  calculateEstimatedDelivery,
} from '../src/services/orderService.js';
import { paymentService, BANK_TRANSFER_INFO } from '../src/services/paymentService.js';
import orderService from '../src/services/orderService.js';

describe('REECO Customer Commerce - Part 2 Test Suite', () => {

  beforeEach(() => {
    store.clear();
    orderService.initDefaultOrdersIfEmpty();
  });

  // ── 1. Shipping & Estimated Delivery Calculation ──────────────────────────
  describe('Shipping Methods & Delivery Estimation', () => {
    test('Standard shipping fee is $10 and delivery is 7–10 days', () => {
      const standard = SHIPPING_METHODS.standard;
      assert.equal(standard.fee, 10);
      assert.equal(standard.deliveryDaysMin, 7);
      assert.equal(standard.deliveryDaysMax, 10);

      const baseDate = new Date('2026-09-24T10:00:00Z');
      const est = calculateEstimatedDelivery(baseDate, 'standard');
      assert.ok(est.display.includes('2026'));
      assert.ok(est.from < est.to);
    });

    test('Express shipping fee is $30 and delivery is 2–3 days', () => {
      const express = SHIPPING_METHODS.express;
      assert.equal(express.fee, 30);
      assert.equal(express.deliveryDaysMin, 2);
      assert.equal(express.deliveryDaysMax, 3);

      const baseDate = new Date('2026-09-24T10:00:00Z');
      const est = calculateEstimatedDelivery(baseDate, 'express');
      assert.ok(est.display.includes('2026'));
      assert.ok(est.from < est.to);
    });
  });

  // ── 2. Order Creation & Sequential ID & Price Calculations ────────────────
  describe('Order Creation & Snapshots & Price Integrity', () => {
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
      { product_id: 'CSI_CS655', model: 'CS655', product_name: 'Water Content Reflectometer', price: 520, quantity: 2 },
      { product_id: 'CSI_CR300', model: 'CR300', product_name: 'Compact Measurement Datalogger', price: 680, quantity: 1 },
    ];

    test('validates required checkout form fields', () => {
      assert.throws(() => {
        orderService.createOrder({
          customer: mockCustomer,
          items: mockItems,
          shippingInfo: { ...mockShippingInfo, fullName: '' },
        });
      }, /mandatory fields/i);

      assert.throws(() => {
        orderService.createOrder({
          customer: mockCustomer,
          items: mockItems,
          shippingInfo: { ...mockShippingInfo, email: 'invalid-email' },
        });
      }, /valid email/i);
    });

    test('creates order with sequential order ID incrementing', () => {
      const order1 = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'standard',
        paymentMethod: 'bank_transfer',
      });

      const order2 = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'express',
        paymentMethod: 'mastercard',
      });

      assert.equal(typeof order1.order_id, 'number');
      assert.equal(typeof order2.order_id, 'number');
      assert.equal(order2.order_id, order1.order_id + 1);
      assert.equal(order1.order_code, `REECO-${order1.order_id}`);
    });

    test('calculates subtotal, shipping fee, and total accurately on backend', () => {
      // CS655: 520 * 2 = 1040
      // CR300: 680 * 1 = 680
      // Subtotal = 1720
      // Standard Shipping = 10
      // Total = 1730
      const order = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'standard',
        paymentMethod: 'bank_transfer',
      });

      assert.equal(order.subtotal, 1720);
      assert.equal(order.shipping_fee, 10);
      assert.equal(order.total, 1730);

      // Express Shipping = 30 -> Total = 1750
      const expressOrder = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'express',
        paymentMethod: 'mastercard',
      });

      assert.equal(expressOrder.subtotal, 1720);
      assert.equal(expressOrder.shipping_fee, 30);
      assert.equal(expressOrder.total, 1750);
    });

    test('creates immutable order item snapshots with historical unit price', () => {
      const order = orderService.createOrder({
        customer: mockCustomer,
        items: mockItems,
        shippingInfo: mockShippingInfo,
        shippingMethod: 'standard',
        paymentMethod: 'bank_transfer',
      });

      assert.equal(order.items.length, 2);
      const snapshotItem = order.items[0];
      assert.equal(snapshotItem.model, 'CS655');
      assert.equal(snapshotItem.unit_price, 520);
      assert.equal(snapshotItem.quantity, 2);
      assert.equal(snapshotItem.line_total, 1040);
    });
  });

  // ── 3. Authorization & Customer Ownership Isolation ──────────────────────
  describe('Customer Ownership & Admin Privileges', () => {
    const customerHai = { username: 'haitran', role: 'customer' };
    const customerOther = { username: 'john_doe', role: 'customer' };
    const adminUser = { username: 'reeco', role: 'admin' };

    test('customer can retrieve only their own orders', () => {
      const haiOrders = orderService.getCustomerOrders('haitran');
      assert.ok(Array.isArray(haiOrders));
      assert.ok(haiOrders.every((o) => o.customer_id === 'haitran'));

      const otherOrders = orderService.getCustomerOrders('john_doe');
      assert.equal(otherOrders.length, 0);
    });

    test('customer cannot view another customer order detail', () => {
      const haiOrders = orderService.getCustomerOrders('haitran');
      assert.ok(haiOrders.length > 0);
      const orderId = haiOrders[0].order_id;

      // Customer Hai viewing own order -> Allowed
      const ownRes = orderService.getOrderById(orderId, customerHai);
      assert.ok(!ownRes.error);
      assert.equal(ownRes.order.order_id, orderId);

      // Another customer viewing Hai's order -> Forbidden
      const unauthorizedRes = orderService.getOrderById(orderId, customerOther);
      assert.equal(unauthorizedRes.error, 'forbidden');

      // Admin viewing Hai's order -> Allowed
      const adminRes = orderService.getOrderById(orderId, adminUser);
      assert.ok(!adminRes.error);
      assert.equal(adminRes.order.order_id, orderId);
    });

    test('customer cannot access admin order list or modify order status', () => {
      // Customer trying to get all admin orders
      const adminListAttempt = orderService.getAllOrdersForAdmin(customerHai);
      assert.equal(adminListAttempt.error, 'forbidden');

      // Customer trying to update status
      const haiOrders = orderService.getCustomerOrders('haitran');
      const orderId = haiOrders[0].order_id;
      const statusUpdateAttempt = orderService.updateOrderStatus(orderId, 'DELIVERED', customerHai);
      assert.equal(statusUpdateAttempt.error, 'forbidden');
    });

    test('admin can inspect all orders, search/filter, and update status', () => {
      // Admin lists all orders
      const adminOrdersRes = orderService.getAllOrdersForAdmin(adminUser);
      assert.ok(!adminOrdersRes.error);
      assert.ok(adminOrdersRes.orders.length > 0);

      const targetOrder = adminOrdersRes.orders[0];
      const updateRes = orderService.updateOrderStatus(targetOrder.order_id, 'FORWARDED_TO_MANUFACTURER', adminUser);
      assert.equal(updateRes.success, true);
      assert.equal(updateRes.order.status, 'FORWARDED_TO_MANUFACTURER');
    });
  });

  // ── 4. Payment & VNPay Sandbox Flow & Idempotency ────────────────────────
  describe('Payment Gateway & VNPay Sandbox & Idempotency', () => {
    test('creates payment intent with correct VNPay URL structure', () => {
      const intent = paymentService.createPayment({
        orderId: 1005,
        amount: 1050,
        method: 'mastercard',
        customer: { name: 'Hai Tran', email: 'haitran@example.com' },
      });

      assert.equal(intent.provider, 'VNPAY_SANDBOX');
      assert.equal(intent.amount, 1050);
      assert.ok(intent.paymentUrl.includes('sandbox.vnpayment.vn'));
      assert.ok(intent.paymentUrl.includes('REECO_1005'));
    });

    test('verifies VNPay callback and handles repeated callbacks idempotently', () => {
      const vnpParams = {
        vnp_TxnRef: '1005',
        vnp_Amount: '105000',
        vnp_ResponseCode: '00',
        vnp_TransactionNo: 'VNP_TEST_99999',
        vnp_BankCode: 'NCB',
      };

      // First callback processing
      const firstCallback = paymentService.verifyVNPayCallback(vnpParams);
      assert.equal(firstCallback.success, true);
      assert.equal(firstCallback.isDuplicate, false);
      assert.equal(firstCallback.payment.status, 'PAID');

      // Duplicate callback with same parameters
      const duplicateCallback = paymentService.verifyVNPayCallback(vnpParams);
      assert.equal(duplicateCallback.success, true);
      assert.equal(duplicateCallback.isDuplicate, true);
      assert.equal(duplicateCallback.payment.status, 'PAID');
    });

    test('handles failed VNPay transactions correctly without false success', () => {
      const vnpFailedParams = {
        vnp_TxnRef: '1006',
        vnp_Amount: '50000',
        vnp_ResponseCode: '24', // Customer cancelled
        vnp_TransactionNo: 'VNP_FAIL_001',
      };

      const failedResult = paymentService.verifyVNPayCallback(vnpFailedParams);
      assert.equal(failedResult.success, false);
      assert.equal(failedResult.payment.status, 'FAILED');
      assert.equal(failedResult.error, 'payment_failed');
    });
  });
});
