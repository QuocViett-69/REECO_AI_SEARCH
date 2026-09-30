import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, ORDER_STATUSES, SHIPPING_METHODS } from '../../services/orderService';
import { formatPrice } from '../../services/commercialService';
import {
  Shield,
  Search,
  Filter,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Save,
  User,
  CreditCard,
  Building2,
  MapPin,
} from 'lucide-react';
import { getPaymentMethodLabel } from '../../services/paymentService';

export function AdminOrders({ onViewOrder }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadOrders = () => {
    if (user && user.role === 'admin') {
      const res = orderService.getAllOrdersForAdmin(user, {
        search: searchQuery,
        status: statusFilter,
      });
      if (res.orders) {
        setOrders(res.orders);
        if (selectedOrder) {
          const updated = res.orders.find((o) => o.order_id === selectedOrder.order_id);
          if (updated) setSelectedOrder(updated);
        }
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user, searchQuery, statusFilter]);

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <Shield size={44} color="#ff6b6b" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            Admin Access Required
          </h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 20 }}>
            You must be logged in as an administrator (<code>reeco</code> / <code>ilovereeco</code>) to access the order management portal.
          </p>
        </div>
      </div>
    );
  }

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setSaveSuccess(false);
    setActionError(null);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    setActionError(null);
    setSaveSuccess(false);

    if (!selectedOrder) return;

    const res = orderService.updateOrderStatus(selectedOrder.order_id, editStatus, user);
    if (res.error) {
      setActionError(res.message);
    } else {
      setSelectedOrder(res.order);
      setSaveSuccess(true);
      loadOrders();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0, 210, 255, 0.15)', color: 'var(--accent, #00d2ff)' }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
              Admin Order Management
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3, #888)', margin: 0 }}>
              Commercial operations, fulfillment state machine, and status updates
            </p>
          </div>
        </div>
      </div>

      {selectedOrder ? (
        /* ── Admin Order Detail & Status Editor View ── */
        <div>
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: 'var(--text-3, #888)',
              cursor: 'pointer',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={14} /> Back to All Orders
          </button>

          {saveSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 8,
                background: 'rgba(0, 200, 115, 0.15)',
                border: '1px solid rgba(0, 200, 115, 0.3)',
                color: '#00c873',
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              <CheckCircle2 size={16} />
              <span>Order status successfully updated to <strong>{ORDER_STATUSES[editStatus]?.label || editStatus}</strong>.</span>
            </div>
          )}

          {actionError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 8,
                background: 'rgba(255, 68, 68, 0.15)',
                border: '1px solid rgba(255, 68, 68, 0.3)',
                color: '#ff6b6b',
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={16} />
              <span>{actionError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
            {/* Left: Order Info & Status Update */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Status Update Card */}
              <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(0, 210, 255, 0.25)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>
                  Update Fulfillment Status
                </h2>

                <form onSubmit={handleUpdateStatus} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: 14,
                    }}
                  >
                    {Object.entries(ORDER_STATUSES).map(([key, config]) => (
                      <option key={key} value={key} style={{ background: '#111', color: '#fff' }}>
                        {config.label} ({key})
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', fontSize: 14 }}
                  >
                    <Save size={16} /> Save Status
                  </button>
                </form>
              </div>

              {/* Order Items Snapshot */}
              <div className="glass-card" style={{ padding: 24, borderRadius: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 16px' }}>
                  Order Snapshot Products (#{selectedOrder.order_id})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--accent, #00d2ff)' }}>{item.model}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2, #ccc)' }}>{item.product_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3, #888)', marginTop: 2 }}>
                          {formatPrice(item.unit_price, selectedOrder.currency)} × {item.quantity}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
                        {formatPrice(item.line_total, selectedOrder.currency)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-3, #888)', marginBottom: 6 }}>
                    <span>Subtotal:</span>
                    <span style={{ color: '#fff' }}>{formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-3, #888)', marginBottom: 10 }}>
                    <span>Shipping Fee:</span>
                    <span style={{ color: '#fff' }}>{formatPrice(selectedOrder.shipping_fee, selectedOrder.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#fff', paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <span>Total:</span>
                    <span style={{ color: 'var(--accent, #00d2ff)' }}>{formatPrice(selectedOrder.total, selectedOrder.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Customer & Fulfillment Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={16} color="var(--accent, #00d2ff)" />
                  <span>Customer Profile</span>
                </h3>
                <div style={{ fontSize: 13, color: 'var(--text-2, #ccc)', lineHeight: 1.6 }}>
                  <div><strong>Name:</strong> {selectedOrder.customer_name}</div>
                  <div><strong>Username:</strong> <code>{selectedOrder.customer_id}</code></div>
                  <div><strong>Email:</strong> {selectedOrder.customer_email}</div>
                  <div><strong>Phone:</strong> {selectedOrder.customer_phone}</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color="var(--accent, #00d2ff)" />
                  <span>Shipping &amp; Delivery</span>
                </h3>
                <div style={{ fontSize: 13, color: 'var(--text-2, #ccc)', lineHeight: 1.6 }}>
                  <div><strong>Method:</strong> {selectedOrder.shipping_method} (${selectedOrder.shipping_fee})</div>
                  <div><strong>Destination:</strong> {selectedOrder.shipping_address}, {selectedOrder.city}</div>
                  <div><strong>Estimated:</strong> {selectedOrder.estimated_delivery?.display}</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 20, borderRadius: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={16} color="var(--accent, #00d2ff)" />
                  <span>Payment Information</span>
                </h3>
                <div style={{ fontSize: 13, color: 'var(--text-2, #ccc)', lineHeight: 1.6 }}>
                  <div><strong>Method:</strong> {getPaymentMethodLabel(selectedOrder.payment_method)}</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: selectedOrder.payment_status === 'PAID' ? '#00c873' : '#ffb020', fontWeight: 700 }}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Admin Order Table / List View ── */
        <div>
          {/* Filter and Search Bar */}
          <div
            className="glass-card"
            style={{
              padding: 16,
              borderRadius: 14,
              marginBottom: 20,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search size={16} color="var(--text-3, #888)" />
              <input
                type="text"
                placeholder="Search by Order ID, customer, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="var(--text-3, #888)" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: 13,
                }}
              >
                <option value="ALL" style={{ background: '#111' }}>All Statuses</option>
                {Object.entries(ORDER_STATUSES).map(([key, config]) => (
                  <option key={key} value={key} style={{ background: '#111' }}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          {orders.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, borderRadius: 16, textAlign: 'center' }}>
              <Package size={40} style={{ color: 'var(--text-3, #555)', marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, color: '#fff', margin: '0 0 6px' }}>No orders found</h3>
              <p style={{ color: 'var(--text-3, #888)', fontSize: 13, margin: 0 }}>
                Try adjusting your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="glass-card" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-3, #888)', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                      <th style={{ padding: '14px 16px' }}>Order ID</th>
                      <th style={{ padding: '14px 16px' }}>Customer</th>
                      <th style={{ padding: '14px 16px' }}>Total</th>
                      <th style={{ padding: '14px 16px' }}>Payment</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const statusConfig = ORDER_STATUSES[order.status] || {
                        label: order.status,
                        color: '#888',
                      };
                      return (
                        <tr
                          key={order.id || order.order_id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.2s',
                          }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent, #00d2ff)' }}>
                            #{order.order_id}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{order.customer_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3, #888)' }}>{order.customer_email}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#fff' }}>
                            {formatPrice(order.total, order.currency)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: order.payment_status === 'PAID' ? '#00c873' : '#ffb020',
                              }}
                            >
                              {order.payment_status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: 4,
                                background: `${statusConfig.color}20`,
                                color: statusConfig.color,
                                border: `1px solid ${statusConfig.color}40`,
                              }}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => handleSelectOrder(order)}
                              style={{ padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <span>Manage</span>
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
