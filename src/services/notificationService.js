// ─── Notification Service & Daily Scheduled Notification Simulator ────────────
// Implements in-app notifications for order state transitions, delivery updates,
// payment confirmations, and scheduled daily updates (Asia/Ho_Chi_Minh).

const NOTIFICATIONS_STORAGE_KEY = 'reeco_notifications_store';
const LAST_DAILY_CHECK_KEY = 'reeco_last_daily_notification_check';

export const NOTIFICATION_TYPES = {
  ORDER_STATUS_CHANGED: { label: 'Order Status Update', color: '#00d2ff' },
  PAYMENT_UPDATED: { label: 'Payment Confirmed', color: '#00c873' },
  DELIVERY_UPDATED: { label: 'Delivery Schedule Update', color: '#ffb020' },
  DAILY_ORDER_UPDATE: { label: 'Daily Fulfillment Digest', color: '#8b5cf6' },
};

class NotificationService {
  constructor() {
    this.initDefaultNotificationsIfEmpty();
  }

  getStoredNotifications() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveStoredNotifications(notifs) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    } catch {}
  }

  initDefaultNotificationsIfEmpty() {
    try {
      if (typeof localStorage === 'undefined') return;
      const existing = this.getStoredNotifications();
      if (existing.length === 0) {
        const now = new Date();
        const pastDate1 = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
        const pastDate2 = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
        const pastDate3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

        const initialNotifs = [
          {
            id: 'notif_1001_01',
            customer_id: 'haitran',
            type: 'ORDER_STATUS_CHANGED',
            title: 'Order #1001 Status Changed to Processing',
            message: 'Your commercial order #1001 is currently processing at REECO and calibration specs are being prepared.',
            order_id: 1001,
            is_read: false,
            created_at: pastDate1.toISOString(),
          },
          {
            id: 'notif_1001_02',
            customer_id: 'haitran',
            type: 'PAYMENT_UPDATED',
            title: 'Payment for Order #1001 Confirmed',
            message: 'Payment of $1,050 for order #1001 has been successfully authorized and verified via VNPay Sandbox.',
            order_id: 1001,
            is_read: false,
            created_at: pastDate2.toISOString(),
          },
          {
            id: 'notif_1001_03',
            customer_id: 'haitran',
            type: 'DELIVERY_UPDATED',
            title: 'Estimated Delivery Calculated for Order #1001',
            message: 'Factory logistics schedule confirmed. Expected delivery window: Standard 7–10 business days.',
            order_id: 1001,
            is_read: true,
            created_at: pastDate3.toISOString(),
          },
        ];

        this.saveStoredNotifications(initialNotifs);
      }
    } catch {}
  }

  // ── Retrieve Customer Notifications (Authorized to own customer ID only) ─────
  getNotifications(customerId) {
    if (!customerId) return [];
    const all = this.getStoredNotifications();
    return all
      .filter((n) => n.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getUnreadCount(customerId) {
    if (!customerId) return 0;
    const notifs = this.getNotifications(customerId);
    return notifs.filter((n) => !n.is_read).length;
  }

  // ── Mark Notification as Read ────────────────────────────────────────────────
  markAsRead(notificationId) {
    const all = this.getStoredNotifications();
    const idx = all.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      all[idx].is_read = true;
      this.saveStoredNotifications(all);
      return { success: true, notification: all[idx] };
    }
    return { success: false, error: 'not_found' };
  }

  // ── Mark All as Read for Customer ────────────────────────────────────────────
  markAllAsRead(customerId) {
    if (!customerId) return { success: false };
    const all = this.getStoredNotifications();
    let updatedCount = 0;
    const updated = all.map((n) => {
      if (n.customer_id === customerId && !n.is_read) {
        updatedCount++;
        return { ...n, is_read: true };
      }
      return n;
    });
    this.saveStoredNotifications(updated);
    return { success: true, updatedCount };
  }

  // ── Create Notification with Duplicate Prevention ────────────────────────────
  createNotification({ customer_id, type, title, message, order_id = null }) {
    if (!customer_id || !title || !message) {
      throw new Error('customer_id, title, and message are required.');
    }

    const all = this.getStoredNotifications();

    // Duplicate check: prevent identical title + message for the same customer within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const isDuplicate = all.some(
      (n) =>
        n.customer_id === customer_id &&
        n.title === title &&
        n.created_at > oneHourAgo
    );

    if (isDuplicate) {
      return { duplicate: true, message: 'Notification already sent recently.' };
    }

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      customer_id,
      type: type || 'ORDER_STATUS_CHANGED',
      title: title.trim(),
      message: message.trim(),
      order_id: order_id ? parseInt(String(order_id).replace(/\D/g, ''), 10) : null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    all.unshift(newNotif);
    this.saveStoredNotifications(all);

    return { success: true, notification: newNotif };
  }

  // ── Scheduled Daily Notification Job Simulator ───────────────────────────────
  // Default timezone: Asia/Ho_Chi_Minh
  runDailyNotificationJob(customerId, orders = []) {
    if (!customerId || !orders || orders.length === 0) return { checked: 0, created: 0 };

    let createdCount = 0;
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const userDailyKey = `${LAST_DAILY_CHECK_KEY}_${customerId}_${todayKey}`;

    // Check if daily job already ran today for this customer
    try {
      if (typeof localStorage !== 'undefined') {
        const lastRan = localStorage.getItem(userDailyKey);
        if (lastRan) return { checked: orders.length, created: 0, reason: 'already_ran_today' };
      }
    } catch {}

    orders.forEach((order) => {
      // If order is active (not DELIVERED or CANCELLED)
      if (['PROCESSING', 'FORWARDED_TO_MANUFACTURER', 'SHIPPED'].includes(order.status)) {
        const res = this.createNotification({
          customer_id: customerId,
          type: 'DAILY_ORDER_UPDATE',
          title: `Daily Update: Order #${order.order_id} is ${order.status.replace(/_/g, ' ')}`,
          message: `Your Campbell Scientific order #${order.order_id} is in progress. Estimated delivery window: ${order.estimated_delivery?.display || 'In logistics queue'}.`,
          order_id: order.order_id,
        });
        if (res.success) createdCount++;
      }
    });

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(userDailyKey, todayKey);
      }
    } catch {}

    return { checked: orders.length, created: createdCount };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
