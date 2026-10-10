export const SHIPPING_METHODS = {
  standard: {
    key: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    fee_vnd: 250000,
    min_days: 7,
    max_days: 10,
  },
  express: {
    key: 'express',
    name: 'Giao hàng hỏa tốc',
    fee_vnd: 500000,
    min_days: 2,
    max_days: 3,
  },
} as const;

export type ShippingMethodKey = keyof typeof SHIPPING_METHODS;

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  FORWARDED_TO_MANUFACTURER: 'FORWARDED_TO_MANUFACTURER',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  COD_PENDING: 'COD_PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
} as const;

export type PaymentStatusType =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// Allowed statuses for cancellation
export const CANCELLABLE_STATUSES: readonly string[] = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAYMENT_FAILED,
  ORDER_STATUS.PAID,
  ORDER_STATUS.PROCESSING,
];

// A VNPay result may only change an order that is still waiting for payment
export const AWAITING_PAYMENT_STATUSES: readonly string[] = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAYMENT_FAILED,
];

// Workflow transitions
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['FORWARDED_TO_MANUFACTURER', 'SHIPPED', 'CANCELLED'],
  FORWARDED_TO_MANUFACTURER: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
};
