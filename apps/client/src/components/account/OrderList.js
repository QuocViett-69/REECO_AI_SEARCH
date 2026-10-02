import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, ORDER_STATUSES, formatCurrency } from '../../services/orderService';
import {
  Package,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export function OrderList({ onNavigate, onViewOrder }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getMyOrders();
      const list = res?.items || res?.data || (Array.isArray(res) ? res : []);
      setOrders(list);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <Package size={40} style={{ color: '#93979f', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Sign In Required</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Please sign in to view your order history and track shipments.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('login')}
            style={{ padding: '10px 24px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            Sign In Now
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
        <ArrowLeft size={14} /> Back to Account
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
            My Orders
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Track commercial orders status and shipping progress
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

      {/* 1. Loading state */}
      {loading && (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '3px solid #e5e7eb',
              borderTopColor: '#0069e0',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div>Loading orders from system...</div>
        </div>
      )}

      {/* 2. Error state */}
      {!loading && error && (
        <div className="glass-card" style={{ padding: 36, borderRadius: 16, textAlign: 'center' }}>
          <AlertCircle size={40} color="#d93025" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Unable to load orders</h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchOrders}
            style={{ padding: '8px 20px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* 3. Empty data state */}
      {!loading && !error && orders.length === 0 && (
        <div className="glass-card" style={{ padding: 48, borderRadius: 16, textAlign: 'center' }}>
          <Package size={48} style={{ color: '#93979f', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>No orders placed yet</h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            Explore scientific measurement and precision sensors by Campbell Scientific.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '10px 24px', fontSize: 14, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            Explore Products
          </button>
        </div>
      )}

      {/* 4. Data list state */}
      {!loading && !error && orders.length > 0 && (
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
            const itemCount = order.order_items?.length || order.items?.length || 0;
            const targetId = order.id || order.order_code;

            return (
              <div
                key={order.id || order.order_code}
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
                    onViewOrder(targetId);
                  } else if (onNavigate) {
                    onNavigate(`account-order:${targetId}`);
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
                        {order.order_code || `REECO-${order.order_number}` || `#${order.id}`}
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
                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>Ordered: {dateStr}</span>
                      <span>•</span>
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                      {order.estimated_delivery_from && (
                        <>
                          <span>•</span>
                          <span>Est. Delivery: {order.estimated_delivery_from} → {order.estimated_delivery_to}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#93979f', textTransform: 'uppercase' }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0069e0' }}>
                      {formatCurrency(order.total)}
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
                        onViewOrder(targetId);
                      } else if (onNavigate) {
                        onNavigate(`account-order:${targetId}`);
                      }
                    }}
                  >
                    <span>Details</span>
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
