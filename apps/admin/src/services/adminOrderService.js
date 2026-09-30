// ─── Admin Order Management Service ──────────────────────────────────────────
// Connected to NestJS Admin Orders API + PostgreSQL/Supabase Database
// Provides real-time order lists, detail, status updates with history, and stats

import {
  getAdminOrdersApi,
  getAdminOrderDetailApi,
  updateAdminOrderStatusApi,
  getAdminOrderStatsApi,
} from './api';

export const ORDER_STATUSES = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#f59e0b', bg: '#fef3c7' },
  PAID: { label: 'Đã thanh toán', color: '#10b981', bg: '#d1fae5' },
  PROCESSING: { label: 'Đang xử lý tại REECO', color: '#06b6d4', bg: '#cffafe' },
  FORWARDED_TO_MANUFACTURER: { label: 'Chuyển hãng sản xuất', color: '#8b5cf6', bg: '#ede9fe' },
  SHIPPED: { label: 'Đang vận chuyển', color: '#3b82f6', bg: '#dbeafe' },
  DELIVERED: { label: 'Đã giao hàng thành công', color: '#059669', bg: '#a7f3d0' },
  CANCELLED: { label: 'Đã hủy đơn', color: '#ef4444', bg: '#fee2e2' },
  PAYMENT_FAILED: { label: 'Thanh toán thất bại', color: '#dc2626', bg: '#fecaca' },
};

export const ORDER_STATUS_TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['FORWARDED_TO_MANUFACTURER', 'SHIPPED', 'CANCELLED'],
  FORWARDED_TO_MANUFACTURER: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
};

export function mapApiOrder(o) {
  if (!o) return null;
  return {
    ...o,
    order_id: o.order_number || o.order_code || o.id,
    order_code: o.order_code || `REECO-${o.order_number || ''}`,
    items: (o.order_items || o.items || []).map((item) => ({
      ...item,
      image:
        item.image_url ||
        item.image ||
        'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/4883',
      product_name: item.product_name || item.name || item.model,
    })),
    status_history: (o.order_status_history || o.status_history || []).map((h) => ({
      status: h.to_status || h.status,
      timestamp: h.created_at || h.timestamp,
      changed_by: h.changed_by || 'admin@reeco.vn',
      note: h.note || undefined,
    })),
  };
}

class AdminOrderService {
  constructor() {
    this.cachedOrders = [];
    this.cachedStats = null;
  }

  // ─── Get filtered orders from API ─────────────────────────────────────────
  async getOrders({ search = '', status = 'ALL', page = 1, limit = 100 } = {}) {
    const res = await getAdminOrdersApi({
      search,
      status: status === 'ALL' ? undefined : status,
      page,
      limit,
    });

    if (res && res.items) {
      const items = res.items.map(mapApiOrder);
      this.cachedOrders = items;
      return {
        items,
        total: res.total ?? items.length,
        page: res.page ?? page,
        limit: res.limit ?? limit,
        totalPages: Math.ceil((res.total ?? items.length) / limit),
      };
    }

    // Return in-memory fallback
    return {
      items: this.cachedOrders,
      total: this.cachedOrders.length,
      page: 1,
      limit,
      totalPages: 1,
    };
  }

  // ─── Get single order detail from API ─────────────────────────────────────
  async getOrderById(orderId) {
    if (!orderId) return null;

    const res = await getAdminOrderDetailApi(orderId);
    if (res && (res.id || res.order_code || res.order_number)) {
      return mapApiOrder(res);
    }

    // Fallback to cached orders
    const found = this.cachedOrders.find(
      (o) =>
        String(o.order_id) === String(orderId) ||
        o.id === orderId ||
        o.order_code === orderId ||
        String(o.order_number) === String(orderId)
    );
    return found || null;
  }

  // ─── Update Order Status via API ──────────────────────────────────────────
  async updateOrderStatus(orderId, newStatus, note = '', changedBy = 'admin@reeco.vn') {
    const res = await updateAdminOrderStatusApi(orderId, newStatus, note);

    if (res.success && res.data) {
      const mapped = mapApiOrder(res.data);
      // Update cache
      const idx = this.cachedOrders.findIndex(
        (o) =>
          String(o.order_id) === String(orderId) ||
          o.id === orderId ||
          o.order_code === orderId
      );
      if (idx !== -1) {
        this.cachedOrders[idx] = mapped;
      }
      return mapped;
    }

    if (res.error === 'conflict' || res.statusCode === 409) {
      const allowedStr = Array.isArray(res.allowed_statuses)
        ? res.allowed_statuses.join(', ')
        : '';
      throw new Error(
        res.message ||
          `Chuyển đổi trạng thái không hợp lệ. Các trạng thái hợp lệ: ${allowedStr}`
      );
    }

    throw new Error(res.message || 'Lỗi khi cập nhật trạng thái đơn hàng trên server.');
  }

  // ─── Calculate Revenue & Order Statistics via API ─────────────────────────
  async getOrderStats() {
    const res = await getAdminOrderStatsApi();
    if (res && typeof res.totalOrders === 'number') {
      this.cachedStats = res;
      return res;
    }

    // Return cached stats or empty structure
    return (
      this.cachedStats || {
        totalOrders: 0,
        paidOrdersCount: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingCount: 0,
        processingCount: 0,
        shippedCount: 0,
        deliveredCount: 0,
        cancelledCount: 0,
        vnpayRevenue: 0,
        codRevenue: 0,
        dailyRevenueMap: {},
        topProducts: [],
      }
    );
  }
}

export const adminOrderService = new AdminOrderService();
