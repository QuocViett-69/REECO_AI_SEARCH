// Admin orders API (GET/PATCH /admin/orders*). Functions throw ApiError from ./http.
import { apiFetch } from './http';

export const ORDER_STATUSES = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#b45309', bg: '#fef3c7' },
  PAID: { label: 'Đã thanh toán', color: '#047857', bg: '#d1fae5' },
  PROCESSING: { label: 'Đang xử lý', color: '#0e7490', bg: '#cffafe' },
  FORWARDED_TO_MANUFACTURER: { label: 'Đã chuyển hãng', color: '#6d28d9', bg: '#ede9fe' },
  SHIPPED: { label: 'Đang vận chuyển', color: '#1d4ed8', bg: '#dbeafe' },
  DELIVERED: { label: 'Đã giao hàng', color: '#065f46', bg: '#a7f3d0' },
  CANCELLED: { label: 'Đã hủy', color: '#b91c1c', bg: '#fee2e2' },
  PAYMENT_FAILED: { label: 'Thanh toán thất bại', color: '#b91c1c', bg: '#fecaca' },
};

export const PAYMENT_STATUSES = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  COD_PENDING: 'COD - chưa thu',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
};

// Copy of ORDER_STATUS_TRANSITIONS in packages/shared/src/schemas/commerce.ts, kept here because
// that package pulls in zod. ordersApi.test.js fails if the two drift apart.
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

export const DEFAULT_PAGE_SIZE = 20;

export function statusLabel(status) {
  return ORDER_STATUSES[status]?.label || status;
}

export function formatVnd(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// The API returns table rows (order_items, order_status_history); views use items/history.
export function normalizeOrder(order) {
  if (!order) return null;
  const history = (order.order_status_history || [])
    .map((entry) => ({
      from_status: entry.from_status || null,
      status: entry.to_status,
      note: entry.note || null,
      changed_by: entry.changed_by || null,
      changed_by_label: entry.changed_by_label || entry.changed_by || null,
      created_at: entry.created_at,
    }))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return {
    ...order,
    order_code: order.order_code || (order.order_number ? `REECO-${order.order_number}` : order.id),
    items: order.order_items || order.items || [],
    history,
  };
}

export async function listOrders({ search = '', status = '', page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const query = new URLSearchParams();
  if (search.trim()) query.set('search', search.trim());
  if (status && status !== 'ALL') query.set('status', status);
  query.set('page', String(page));
  query.set('page_size', String(pageSize));
  const data = await apiFetch(`/admin/orders?${query.toString()}`);
  return { items: (data?.items || []).map(normalizeOrder), total: data?.total || 0 };
}

export async function getOrder(orderId) {
  return normalizeOrder(await apiFetch(`/admin/orders/${encodeURIComponent(orderId)}`));
}

export async function updateOrderStatus(orderId, status, note) {
  const body = { status, ...(note && note.trim() && { note: note.trim() }) };
  return apiFetch(`/admin/orders/${encodeURIComponent(orderId)}/status`, { method: 'PATCH', body });
}

export function getOrderStats() {
  return apiFetch('/admin/orders/stats');
}
