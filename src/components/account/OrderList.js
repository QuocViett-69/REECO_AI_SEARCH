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
          <Package size={40} style={{ color: 'var(--text-3, #777)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 20 }}>
            Please sign in to view your order history and tracking information.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('login')}
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
          color: 'var(--text-3, #888)',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Back to Account Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1, #fff)', margin: '0 0 4px' }}>
            My Orders
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3, #888)', margin: 0 }}>
            Track Campbell Scientific commercial orders and import statuses
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate && onNavigate('products')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px' }}
        >
          <ShoppingBag size={14} /> Browse Catalog
        </button>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3, #888)' }}>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, borderRadius: 16, textAlign: 'center' }}>
          <Package size={48} style={{ color: 'var(--text-3, #555)', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 24 }}>
            You haven't placed any commercial orders with REECO yet.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            Explore Campbell Products
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || {
              label: order.status,
              color: '#888',
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
                  transition: 'border-color 0.2s',
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
                      background: 'rgba(0, 210, 255, 0.1)',
                      color: 'var(--accent, #00d2ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Package size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                        #{order.order_id}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: `${statusConfig.color}20`,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.color}40`,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3, #888)', display: 'flex', gap: 12 }}>
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
                    <div style={{ fontSize: 11, color: 'var(--text-3, #888)', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent, #00d2ff)' }}>
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
