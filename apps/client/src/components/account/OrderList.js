import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, ORDER_STATUSES } from '../../services/orderService';
import { formatPrice } from '../../services/commercialService';
import {
  Package,
  ArrowLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

export function OrderList({ onNavigate, onViewOrder }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.username) {
      const customerOrders = orderService.getCustomerOrders(user.username);
      setOrders(customerOrders);
    }
    setLoading(false);
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <Package size={40} style={{ color: '#93979f', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Authentication Required</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Please sign in to view your order history and tracking information.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('login')}
            style={{ padding: '10px 24px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <button
        type="button"
        onClick={() => onNavigate && onNavigate('account')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Back to Account Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
            My Orders
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Track Campbell Scientific commercial orders and import statuses
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate && onNavigate('products')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
        >
          <ShoppingBag size={14} /> Browse Catalog
        </button>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, borderRadius: 16, textAlign: 'center' }}>
          <Package size={48} style={{ color: '#93979f', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>No orders placed yet</h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            You haven't placed any commercial orders with REECO yet.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '10px 24px', fontSize: 14, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            Explore Campbell Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || {
              label: order.status,
              color: '#6b7280',
            };
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={order.id || order.order_id}
                className="glass-card"
                style={{
                  padding: 20,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (onViewOrder) {
                    onViewOrder(order.order_id);
                  } else if (onNavigate) {
                    onNavigate(`account-order:${order.order_id}`);
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'rgba(0, 105, 224, 0.08)',
                      color: '#0069e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Package size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                        #{order.order_id}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: `${statusConfig.color}15`,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.color}30`,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 12 }}>
                      <span>Date: {dateStr}</span>
                      <span>•</span>
                      <span>{order.items?.length || 0} {(order.items?.length === 1) ? 'item' : 'items'}</span>
                      <span>•</span>
                      <span>Delivery: {order.estimated_delivery?.display || 'In transit'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#93979f', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0069e0' }}>
                      {formatPrice(order.total, order.currency)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#fff',
                      color: '#111827',
                      border: '1px solid #e5e7eb',
                      borderRadius: 9999,
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewOrder) {
                        onViewOrder(order.order_id);
                      } else if (onNavigate) {
                        onNavigate(`account-order:${order.order_id}`);
                      }
                    }}
                  >
                    <span>View Order</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderList;
