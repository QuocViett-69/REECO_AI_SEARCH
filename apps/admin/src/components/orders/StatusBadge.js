import React from 'react';
import { ORDER_STATUSES } from '../../services/ordersApi';

export function StatusBadge({ status }) {
  const meta = ORDER_STATUSES[status] || { label: status, color: '#475569', bg: '#f1f5f9' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: meta.bg,
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}
