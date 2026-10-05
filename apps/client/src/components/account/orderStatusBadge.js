import React from 'react';

// One status-dot scheme for order and payment statuses, shared by the customer
// order list/detail and the admin order portal. Blue = in progress, amber = waiting
// on the customer, green = done, red = stopped, gray = unknown.
const ORDER_STATUS_BADGES = {
  PENDING_PAYMENT: { label: 'Pending payment', tone: 'amber' },
  PAID: { label: 'Payment confirmed', tone: 'blue' },
  PROCESSING: { label: 'Processing at REECO', tone: 'blue' },
  FORWARDED_TO_MANUFACTURER: { label: 'Forwarded to manufacturer', tone: 'blue' },
  SHIPPED: { label: 'Shipped from factory', tone: 'blue' },
  DELIVERED: { label: 'Delivered', tone: 'green' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
  PAYMENT_FAILED: { label: 'Payment failed', tone: 'red' },
};

const PAYMENT_STATUS_BADGES = {
  PAID: { label: 'Paid', tone: 'green' },
  PENDING_PAYMENT: { label: 'Awaiting payment', tone: 'amber' },
  COD_PENDING: { label: 'Cash on delivery', tone: 'amber' },
  FAILED: { label: 'Failed', tone: 'red' },
};

function humanize(value) {
  if (!value) return 'Unknown';
  const text = String(value).replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getOrderStatusBadge(status) {
  return ORDER_STATUS_BADGES[status] || { label: humanize(status), tone: 'gray' };
}

export function getPaymentStatusBadge(status) {
  return PAYMENT_STATUS_BADGES[status] || { label: humanize(status), tone: 'gray' };
}

function Badge({ label, tone }) {
  return <span className={`st-status st-status--${tone}`}>{label}</span>;
}

export function OrderStatusBadge({ status }) {
  return <Badge {...getOrderStatusBadge(status)} />;
}

export function PaymentStatusBadge({ status }) {
  return <Badge {...getPaymentStatusBadge(status)} />;
}
