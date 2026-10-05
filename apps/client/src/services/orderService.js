// ─── Order Service ─────────────────────────────────────────────────────────────
// Client API integration via apiFetch, with VND currency and strict server synchronization.

import { apiFetch } from './apiFetch.js';

export const SHIPPING_METHODS = {
  standard: {
    id: 'standard',
    name: 'Standard Delivery',
    fee: 250000,
    deliveryDaysMin: 7,
    deliveryDaysMax: 10,
    description: 'Standard delivery: 7–10 business days',
  },
  express: {
    id: 'express',
    name: 'Express Air Freight',
    fee: 500000,
    deliveryDaysMin: 2,
    deliveryDaysMax: 3,
    description: 'Express air freight: 2–3 business days',
  },
};

export const ORDER_STATUSES = {
  PENDING_PAYMENT: { label: 'Pending Payment', step: 1, color: '#ffb020' },
  PAID: { label: 'Paid', step: 2, color: '#00c873' },
  PROCESSING: { label: 'Processing at REECO', step: 3, color: '#00d2ff' },
  FORWARDED_TO_MANUFACTURER: { label: 'Forwarded to Manufacturer', step: 4, color: '#8b5cf6' },
  SHIPPED: { label: 'In Transit', step: 5, color: '#3b82f6' },
  DELIVERED: { label: 'Delivered', step: 6, color: '#10b981' },
  CANCELLED: { label: 'Cancelled', step: 0, color: '#ef4444' },
  PAYMENT_FAILED: { label: 'Payment Failed', step: 0, color: '#ef4444' },
};

export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(d) {
  return d.toLocaleDateString('vi-VN', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateEstimatedDelivery(createdDate, methodKey) {
  const method = SHIPPING_METHODS[methodKey] || SHIPPING_METHODS.standard;
  const base = new Date(createdDate || Date.now());

  const minDate = new Date(base);
  minDate.setDate(minDate.getDate() + method.deliveryDaysMin);

  const maxDate = new Date(base);
  maxDate.setDate(maxDate.getDate() + method.deliveryDaysMax);

  return {
    from: minDate.toISOString(),
    to: maxDate.toISOString(),
    display: `${formatDate(minDate)} – ${formatDate(maxDate)}`,
  };
}

class OrderService {
  /**
   * Tạo đơn hàng mới từ payload CreateOrderRequest
   * @param {Object} orderPayload
   */
  async createOrder(orderPayload) {
    return await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  }

  /**
   * Lấy lịch sử đơn hàng của người dùng hiện tại
   * @param {number} [page=1]
   * @param {number} [pageSize=20]
   */
  async getMyOrders(page = 1, pageSize = 20) {
    const res = await apiFetch(`/orders/me?page=${page}&page_size=${pageSize}`);
    const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
    return {
      items,
      data: items,
      total: res?.total ?? items.length,
    };
  }

  /**
   * Tương thích lấy đơn hàng của khách hàng (trả về danh sách mảng đơn hàng)
   */
  async getCustomerOrders(usernameOrPage = 1, pageSize = 50) {
    const page = typeof usernameOrPage === 'number' ? usernameOrPage : 1;
    const res = await this.getMyOrders(page, pageSize);
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  }

  /**
   * Xem chi tiết đơn hàng theo orderId (hỗ trợ UUID, số thứ tự 1001, hoặc mã REECO-1001)
   * @param {string} orderId
   */
  async getOrderById(orderId) {
    const data = await apiFetch(`/orders/${encodeURIComponent(orderId)}`);
    return {
      order: data,
      ...data,
    };
  }

  /**
   * Hủy đơn hàng (trước khi vận chuyển)
   * @param {string} orderId
   * @param {string} [reason]
   */
  async cancelOrder(orderId, reason) {
    return await apiFetch(`/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Khách hàng yêu cầu hủy đơn' }),
    });
  }

  /**
   * Lấy danh sách đơn hàng cho Admin
   */
  async getAllOrdersForAdmin(adminUserOrFilters = {}, maybeFilters = {}) {
    const filters =
      adminUserOrFilters && typeof adminUserOrFilters === 'object' && adminUserOrFilters.role
        ? maybeFilters
        : adminUserOrFilters;

    const query = new URLSearchParams();
    if (filters.search) query.set('search', filters.search);
    if (filters.status && filters.status !== 'ALL') query.set('status', filters.status);
    if (filters.page) query.set('page', String(filters.page));
    // The API defaults to 20 rows; the admin page lists up to the API maximum of 100.
    query.set('page_size', String(filters.pageSize || filters.page_size || 100));

    const qStr = query.toString();
    const res = await apiFetch(`/admin/orders${qStr ? `?${qStr}` : ''}`);
    // GET /admin/orders returns { items, total }
    const orders = res?.items || (Array.isArray(res) ? res : []);
    return {
      orders,
      pagination: {
        total: typeof res?.total === 'number' ? res.total : orders.length,
        page: Number(filters.page) || 1,
        page_size: Number(query.get('page_size')),
      },
    };
  }

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Admin)
   */
  async updateOrderStatus(orderId, newStatus, noteOrUser) {
    const note = typeof noteOrUser === 'string' ? noteOrUser : undefined;
    return await apiFetch(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, note }),
    });
  }
}

export const orderService = new OrderService();
export default orderService;
