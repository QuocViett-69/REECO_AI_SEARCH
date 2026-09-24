// ─── REECO Customer Commerce Part 3 Test Suite ────────────────────────────────
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

import { notificationService, NOTIFICATION_TYPES } from '../src/services/notificationService.js';
import { recommendationService } from '../src/services/recommendationService.js';
import orderService from '../src/services/orderService.js';
import { getCommercialData } from '../src/services/commercialService.js';

describe('REECO Customer Commerce - Part 3 Test Suite', () => {

  beforeEach(() => {
    store.clear();
    orderService.initDefaultOrdersIfEmpty();
    notificationService.initDefaultNotificationsIfEmpty();
  });

  // ── 1. In-App Notifications & State Management ──────────────────────────────
  describe('In-App Notifications & Customer Isolation', () => {
    test('retrieves notifications exclusively for own customer ID', () => {
      const haiNotifs = notificationService.getNotifications('haitran');
      assert.ok(Array.isArray(haiNotifs));
      assert.ok(haiNotifs.every((n) => n.customer_id === 'haitran'));

      const otherNotifs = notificationService.getNotifications('other_user');
      assert.equal(otherNotifs.length, 0);
    });

    test('calculates unread notification count and marks as read', () => {
      const initialUnread = notificationService.getUnreadCount('haitran');
      assert.ok(initialUnread >= 1);

      const notifs = notificationService.getNotifications('haitran');
      const unreadOne = notifs.find((n) => !n.is_read);
      assert.ok(unreadOne);

      notificationService.markAsRead(unreadOne.id);
      const afterUnread = notificationService.getUnreadCount('haitran');
      assert.equal(afterUnread, initialUnread - 1);
    });

    test('marks all notifications as read for a customer', () => {
      const res = notificationService.markAllAsRead('haitran');
      assert.equal(res.success, true);
      assert.equal(notificationService.getUnreadCount('haitran'), 0);
    });

    test('creates notification and prevents duplicate notifications within 1 hour', () => {
      const first = notificationService.createNotification({
        customer_id: 'haitran',
        type: 'ORDER_STATUS_CHANGED',
        title: 'Order #1002 Shipped',
        message: 'Order #1002 is on the way via air freight.',
        order_id: 1002,
      });

      assert.equal(first.success, true);
      assert.equal(first.notification.title, 'Order #1002 Shipped');

      // Attempt immediate duplicate
      const duplicate = notificationService.createNotification({
        customer_id: 'haitran',
        type: 'ORDER_STATUS_CHANGED',
        title: 'Order #1002 Shipped',
        message: 'Order #1002 is on the way via air freight.',
        order_id: 1002,
      });

      assert.equal(duplicate.duplicate, true);
    });
  });

  // ── 2. Automatic Notification on Order Status Changes ────────────────────────
  describe('Automatic Notifications on Fulfillment Transitions', () => {
    test('admin updating order status triggers customer notification automatically', () => {
      const adminUser = { username: 'reeco', role: 'admin' };
      const orders = orderService.getCustomerOrders('haitran');
      assert.ok(orders.length > 0);

      const targetOrder = orders[0];
      const unreadBefore = notificationService.getUnreadCount('haitran');

      const updateRes = orderService.updateOrderStatus(targetOrder.order_id, 'FORWARDED_TO_MANUFACTURER', adminUser);
      assert.equal(updateRes.success, true);

      const unreadAfter = notificationService.getUnreadCount('haitran');
      assert.ok(unreadAfter >= unreadBefore);

      const notifs = notificationService.getNotifications('haitran');
      const latest = notifs[0];
      assert.ok(latest.title.includes('Forwarded to Manufacturer'));
      assert.equal(latest.order_id, targetOrder.order_id);
    });
  });

  // ── 3. Daily Notification Digest Simulator ──────────────────────────────────
  describe('Daily Notification Digest Simulator (Asia/Ho_Chi_Minh)', () => {
    test('runs daily scheduled job check for active orders without spamming', () => {
      const orders = orderService.getCustomerOrders('haitran');
      
      const run1 = notificationService.runDailyNotificationJob('haitran', orders);
      assert.ok(run1.checked > 0);

      // Subsequent check on same day should recognise it already ran
      const run2 = notificationService.runDailyNotificationJob('haitran', orders);
      assert.equal(run2.created, 0);
    });
  });

  // ── 4. AI Recommendation Integration Point ───────────────────────────────────
  describe('AI Recommendation Integration Point ("You may also need")', () => {
    test('returns technical compatibility recommendations with reason badges', async () => {
      const recs = await recommendationService.getProductRecommendations('CSI_CS655', 'CS655');
      assert.ok(Array.isArray(recs));
      assert.ok(recs.length > 0);

      const first = recs[0];
      assert.ok(first.model);
      assert.ok(first.reason);
      assert.ok(first.price > 0);
      assert.equal(first.currency, 'USD');
    });

    test('falls back gracefully to complementary products when model has no direct mapping', async () => {
      const recs = await recommendationService.getProductRecommendations('UNKNOWN_001', 'UNKNOWN_MODEL');
      assert.ok(Array.isArray(recs));
      assert.ok(recs.length > 0);
      assert.ok(recs[0].price > 0);
    });
  });

  // ── 5. Final Commercial & Inventory Safety Audit ────────────────────────────
  describe('Commercial Data & Zero Stock Quantity Audit', () => {
    test('ensures commercial metadata NEVER exposes warehouse stock quantity', () => {
      const commData = getCommercialData('CSI_CS655', 'CS655');
      assert.equal(commData.availability_label, 'Available for order');
      assert.equal(commData.is_purchasable, true);
      assert.equal(commData.stock_quantity, undefined);
      assert.equal(commData.warehouse_count, undefined);
      assert.equal(commData.inventory, undefined);
    });
  });
});
