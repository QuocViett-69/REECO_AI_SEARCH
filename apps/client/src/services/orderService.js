// ─── Order Service & State Machine ─────────────────────────────────────────────
// Supports sequential Order IDs (1001, 1002, 1003...), item snapshots,
// shipping calculation ($10 Standard vs $30 Express), customer ownership isolation,
// and admin status transitions.

import { paymentService } from './paymentService.js';
import { notificationService } from './notificationService.js';

const ORDERS_STORAGE_KEY = 'reeco_orders_store';
const NEXT_ORDER_ID_KEY = 'reeco_next_order_id';

export const SHIPPING_METHODS = {
  standard: {
    id: 'standard',
    name: 'Standard Delivery',
    fee: 10,
    deliveryDaysMin: 7,
    deliveryDaysMax: 10,
    description: 'Estimated delivery: 7–10 business days via Authorized Logistics',
  },
  express: {
    id: 'express',
    name: 'Express Air Freight',
    fee: 30,
    deliveryDaysMin: 2,
    deliveryDaysMax: 3,
    description: 'Estimated delivery: 2–3 business days via Priority Air Cargo',
  },
};

export const ORDER_STATUSES = {
  PENDING_PAYMENT: { label: 'Pending Payment', step: 1, color: '#ffb020' },
  PAID: { label: 'Payment Confirmed', step: 2, color: '#00c873' },
  PROCESSING: { label: 'Processing at REECO', step: 3, color: '#00d2ff' },
  FORWARDED_TO_MANUFACTURER: { label: 'Forwarded to Manufacturer', step: 4, color: '#8b5cf6' },
  SHIPPED: { label: 'Shipped from Factory', step: 5, color: '#3b82f6' },
  DELIVERED: { label: 'Delivered', step: 6, color: '#10b981' },
  CANCELLED: { label: 'Cancelled', step: 0, color: '#ef4444' },
  PAYMENT_FAILED: { label: 'Payment Failed', step: 0, color: '#ef4444' },
};

function formatDate(d) {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateEstimatedDelivery(createdDate, methodKey) {
  const method = SHIPPING_METHODS[methodKey] || SHIPPING_METHODS.standard;
  const base = new Date(createdDate);

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
  constructor() {
    this.initDefaultOrdersIfEmpty();
  }

  getStoredOrders() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveStoredOrders(orders) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {}
  }

  getNextOrderId() {
    try {
      if (typeof localStorage === 'undefined') return 1001;
      const stored = localStorage.getItem(NEXT_ORDER_ID_KEY);
      const current = stored ? parseInt(stored, 10) : 1001;
      const next = current + 1;
      localStorage.setItem(NEXT_ORDER_ID_KEY, String(next));
      return current;
    } catch {
      return 1001;
    }
  }

  initDefaultOrdersIfEmpty() {
    try {
      if (typeof localStorage === 'undefined') return;
      const existing = this.getStoredOrders();
      if (existing.length === 0) {
      // Seed an initial demo historical order for customer 'haitran'
      const now = new Date();
      const pastDate = new Date(now);
      pastDate.setDate(pastDate.getDate() - 3);

      const delivery = calculateEstimatedDelivery(pastDate, 'standard');

      const initialOrder = {
        id: 'ord_1001',
        order_id: 1001,
        order_code: 'REECO-1001',
        customer_id: 'haitran',
        customer_name: 'Hai Tran',
        customer_email: 'haitran@example.com',
        customer_phone: '+84 908 123 456',
        status: 'PROCESSING',
        payment_status: 'PAID',
        payment_method: 'mastercard',
        payment_provider: 'VNPAY_SANDBOX',
        shipping_method: 'standard',
        shipping_fee: 10,
        subtotal: 1040,
        total: 1050,
        currency: 'USD',
        shipping_address: '128 Nguyen Van Thu, Da Kao Ward, District 1',
        city: 'Ho Chi Minh City',
        province: 'Ho Chi Minh',
        country: 'Vietnam',
        postal_code: '700000',
        notes: 'Please ensure calibration certification documents are enclosed.',
        estimated_delivery: delivery,
        created_at: pastDate.toISOString(),
        updated_at: pastDate.toISOString(),
        items: [
          {
            product_id: 'CSI_CS655',
            model: 'CS655',
            product_name: '12cm Water Content Reflectometer Plus (-50 to +70C)',
            unit_price: 520,
            quantity: 2,
            line_total: 1040,
            image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/4883',
          },
        ],
      };

      this.saveStoredOrders([initialOrder]);
      localStorage.setItem(NEXT_ORDER_ID_KEY, '1002');
    }
  } catch {}
}

  // ── Create Order with Strict Validation & Server-Side Price Calculation ───────
  createOrder({
    customer,
    items,
    shippingInfo,
    shippingMethod = 'standard',
    paymentMethod = 'bank_transfer',
  }) {
    if (!customer || !customer.username) {
      throw new Error('Authenticated customer information is required to place an order.');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    // Validate Customer Information Form
    const { fullName, email, phone, address, city, province, country, postalCode, notes } = shippingInfo || {};
    if (!fullName || !email || !phone || !address || !city) {
      throw new Error('Full name, email, phone, address, and city are mandatory fields.');
    }

    // Validate Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    // Calculate Subtotal & Snapshots
    const itemSnapshots = items.map((item) => {
      const unitPrice = item.price || 450;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      return {
        product_id: item.product_id || item.id,
        model: item.model || 'REECO-PROD',
        product_name: item.name || item.product_name || item.model,
        unit_price: unitPrice,
        quantity: qty,
        line_total: unitPrice * qty,
        image: item.image || item.image_url || null,
      };
    });

    const subtotal = itemSnapshots.reduce((sum, item) => sum + item.line_total, 0);
    const selectedShipping = SHIPPING_METHODS[shippingMethod] || SHIPPING_METHODS.standard;
    const shippingFee = selectedShipping.fee;
    const total = subtotal + shippingFee;

    const sequentialId = this.getNextOrderId();
    const now = new Date();
    const estimatedDelivery = calculateEstimatedDelivery(now, shippingMethod);

    // Initial payment state
    const initialPaymentStatus = paymentMethod === 'mastercard' ? 'PENDING_PAYMENT' : 'PENDING_PAYMENT';
    const initialOrderStatus = 'PENDING_PAYMENT';

    const newOrder = {
      id: `ord_${sequentialId}`,
      order_id: sequentialId,
      order_code: `REECO-${sequentialId}`,
      customer_id: customer.username,
      customer_name: fullName.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      status: initialOrderStatus,
      payment_status: initialPaymentStatus,
      payment_method: paymentMethod,
      shipping_method: shippingMethod,
      shipping_fee: shippingFee,
      subtotal,
      total,
      currency: 'USD',
      shipping_address: address.trim(),
      city: city.trim(),
      province: (province || '').trim(),
      country: (country || 'Vietnam').trim(),
      postal_code: (postalCode || '').trim(),
      notes: (notes || '').trim(),
      estimated_delivery: estimatedDelivery,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      items: itemSnapshots,
    };

    // Initialize Payment
    const paymentIntent = paymentService.createPayment({
      orderId: sequentialId,
      amount: total,
      method: paymentMethod,
      customer: { name: fullName, email },
    });

    newOrder.payment_intent = paymentIntent;

    const allOrders = this.getStoredOrders();
    allOrders.unshift(newOrder);
    this.saveStoredOrders(allOrders);

    return newOrder;
  }

  // ── Retrieve Customer Orders (Authorized to own username only) ───────────────
  getCustomerOrders(username) {
    if (!username) return [];
    const all = this.getStoredOrders();
    return all.filter((ord) => ord.customer_id === username);
  }

  // ── Retrieve Order by ID with Strict Ownership Verification ──────────────────
  getOrderById(orderId, currentUser) {
    if (!orderId || !currentUser) {
      return { error: 'unauthorized', message: 'Authentication required to inspect order details.' };
    }

    const all = this.getStoredOrders();
    const numericId = parseInt(String(orderId).replace(/\D/g, ''), 10);

    const order = all.find(
      (o) => o.order_id === numericId || o.id === orderId || o.order_code === orderId
    );

    if (!order) {
      return { error: 'not_found', message: 'Order not found in database.' };
    }

    // Admin can view any order; Customer can only view own orders
    if (currentUser.role !== 'admin' && order.customer_id !== currentUser.username) {
      return { error: 'forbidden', message: 'You do not have permission to view this order.' };
    }

    return { order };
  }

  // ── Admin Order Inspection (Filtered & Searched) ──────────────────────────────
  getAllOrdersForAdmin(adminUser, filters = {}) {
    if (!adminUser || adminUser.role !== 'admin') {
      return { error: 'forbidden', message: 'Admin privileges required.' };
    }

    let list = this.getStoredOrders();

    if (filters.search) {
      const q = String(filters.search).toLowerCase().trim();
      list = list.filter(
        (o) =>
          String(o.order_id).includes(q) ||
          o.order_code.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((o) => o.status === filters.status);
    }

    return { orders: list };
  }

  // ── Admin Order Status Update (Strict Admin Guard) ────────────────────────────
  updateOrderStatus(orderId, newStatus, adminUser) {
    if (!adminUser || adminUser.role !== 'admin') {
      return { error: 'forbidden', message: 'Only administrators can update order status.' };
    }

    if (!ORDER_STATUSES[newStatus]) {
      return { error: 'invalid_status', message: `Invalid status code: ${newStatus}` };
    }

    const all = this.getStoredOrders();
    const numericId = parseInt(String(orderId).replace(/\D/g, ''), 10);
    const orderIndex = all.findIndex(
      (o) => o.order_id === numericId || o.id === orderId || o.order_code === orderId
    );

    if (orderIndex === -1) {
      return { error: 'not_found', message: 'Order not found.' };
    }

    const order = all[orderIndex];
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    // If order transitions to PROCESSING or FORWARDED, automatically ensure payment is confirmed
    if (newStatus === 'PROCESSING' || newStatus === 'FORWARDED_TO_MANUFACTURER' || newStatus === 'SHIPPED') {
      order.payment_status = 'PAID';
    }

    all[orderIndex] = order;
    this.saveStoredOrders(all);

    // Dispatch order status changed notification
    try {
      notificationService.createNotification({
        customer_id: order.customer_id,
        type: 'ORDER_STATUS_CHANGED',
        title: `Order #${order.order_id} status changed to ${ORDER_STATUSES[newStatus]?.label || newStatus}`,
        message: `Your commercial order #${order.order_id} status has been updated to "${ORDER_STATUSES[newStatus]?.label || newStatus}".`,
        order_id: order.order_id,
      });
    } catch {}

    return { success: true, order };
  }

  // ── Complete Payment for Order (e.g. from VNPay or Admin Confirmation) ────────
  markOrderAsPaid(orderId, paymentDetails = {}) {
    const all = this.getStoredOrders();
    const numericId = parseInt(String(orderId).replace(/\D/g, ''), 10);
    const orderIndex = all.findIndex(
      (o) => o.order_id === numericId || o.id === orderId || o.order_code === orderId
    );

    if (orderIndex === -1) return { error: 'not_found' };

    const order = all[orderIndex];
    order.payment_status = 'PAID';
    order.status = 'PROCESSING';
    order.updated_at = new Date().toISOString();
    order.payment_confirmation = {
      confirmed_at: new Date().toISOString(),
      ...paymentDetails,
    };

    all[orderIndex] = order;
    this.saveStoredOrders(all);

    // Dispatch payment confirmed notification
    try {
      notificationService.createNotification({
        customer_id: order.customer_id,
        type: 'PAYMENT_UPDATED',
        title: `Payment for Order #${order.order_id} Confirmed`,
        message: `Payment for commercial order #${order.order_id} has been verified. Order has transitioned to Processing.`,
        order_id: order.order_id,
      });
    } catch {}

    return { success: true, order };
  }
}

export const orderService = new OrderService();
export default orderService;
