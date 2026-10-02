// ─── Notification Service & Real-time Hook ─────────────────────────────────────
// Client API integration via apiFetch with polling hook for Navbar integration.

import { useState, useEffect, useCallback } from 'react';
import { apiFetch, getAuthToken } from './apiFetch.js';

export const NOTIFICATION_TYPES = {
  ORDER_CREATED: { label: 'New Order', color: '#ffb020' },
  ORDER_STATUS_CHANGED: { label: 'Status Update', color: '#00d2ff' },
  PAYMENT_UPDATED: { label: 'Payment Confirmed', color: '#00c873' },
};

const NOTIFICATIONS_CACHE_KEY = 'reeco_notifications_cache';
const UNREAD_COUNT_CACHE_KEY = 'reeco_unread_count_cache';
const LAST_FETCH_KEY = 'reeco_notifications_last_fetch';

class NotificationService {
  /**
   * Lấy danh sách thông báo đã lưu trong session
   * @returns {Array}
   */
  getCachedNotifications() {
    try {
      if (typeof sessionStorage === 'undefined') return [];
      const cached = sessionStorage.getItem(NOTIFICATIONS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  /**
   * Lấy số lượng chưa đọc đã lưu trong session
   * @returns {number}
   */
  getCachedUnreadCount() {
    try {
      if (typeof sessionStorage === 'undefined') return 0;
      const cached = sessionStorage.getItem(UNREAD_COUNT_CACHE_KEY);
      return cached !== null ? Number(cached) : 0;
    } catch {
      return 0;
    }
  }

  setCachedNotifications(list) {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(list || []));
      sessionStorage.setItem(LAST_FETCH_KEY, String(Date.now()));
    } catch {}
  }

  setCachedUnreadCount(count) {
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem(UNREAD_COUNT_CACHE_KEY, String(count || 0));
    } catch {}
  }

  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   * @param {boolean} [unreadOnly=false]
   * @returns {Promise<Array>}
   */
  async getMyNotifications(unreadOnly = false) {
    const query = unreadOnly ? '?unread_only=true' : '';
    const res = await apiFetch(`/notifications/me${query}`);
    const list = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : []);
    if (!unreadOnly) {
      this.setCachedNotifications(list);
      const unreadCount =
        typeof res?.unread_count === 'number'
          ? res.unread_count
          : list.filter((n) => !n.read_at).length;
      this.setCachedUnreadCount(unreadCount);
    }
    return list;
  }

  /**
   * Alias tương thích ngược
   */
  async getNotifications(customerIdOrUnreadOnly = false) {
    const unreadOnly = typeof customerIdOrUnreadOnly === 'boolean' ? customerIdOrUnreadOnly : false;
    return await this.getMyNotifications(unreadOnly);
  }

  /**
   * Đếm số lượng thông báo chưa đọc
   * @returns {Promise<number>}
   */
  async getUnreadCount() {
    try {
      const res = await apiFetch('/notifications/me?unread_only=true');
      if (typeof res?.unread_count === 'number') {
        this.setCachedUnreadCount(res.unread_count);
        return res.unread_count;
      }
      const list = Array.isArray(res) ? res : (Array.isArray(res?.items) ? res.items : []);
      const count = list.length;
      this.setCachedUnreadCount(count);
      return count;
    } catch {
      return this.getCachedUnreadCount();
    }
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    try {
      const cached = this.getCachedNotifications();
      const updated = cached.map((n) =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      );
      this.setCachedNotifications(updated);
      const newCount = Math.max(0, this.getCachedUnreadCount() - 1);
      this.setCachedUnreadCount(newCount);
    } catch {}

    return await apiFetch(`/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH',
    });
  }

  /**
   * Đánh dấu tất cả thông báo của chính mình là đã đọc
   */
  async markAllAsRead() {
    try {
      const cached = this.getCachedNotifications();
      const updated = cached.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }));
      this.setCachedNotifications(updated);
      this.setCachedUnreadCount(0);
    } catch {}

    return await apiFetch('/notifications/read-all', {
      method: 'POST',
    });
  }
}

export const notificationService = new NotificationService();

/**
 * Custom hook polling số lượng thông báo chưa đọc mỗi 30 giây
 * Cung cấp cho Navbar hoặc các component cần hiển thị badge
 * Khởi tạo tức thì từ sessionStorage cache để tránh layout shift / chớp giật
 * @param {number} [pollInterval=30000] Chu kỳ polling (mặc định 30s)
 * @returns {number} unreadCount
 */
export function useUnreadNotificationCount(pollInterval = 30000) {
  const [unreadCount, setUnreadCount] = useState(() => {
    return notificationService.getCachedUnreadCount();
  });

  const fetchCount = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore network errors during poll
    }
  }, []);

  useEffect(() => {
    fetchCount();

    if (!pollInterval || pollInterval <= 0) return;

    const timer = setInterval(() => {
      fetchCount();
    }, pollInterval);

    // Refresh khi window focus
    const onFocus = () => fetchCount();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchCount, pollInterval]);

  return unreadCount;
}

export default notificationService;
