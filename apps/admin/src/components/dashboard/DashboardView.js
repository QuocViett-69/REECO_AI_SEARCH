import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Activity, RefreshCw } from 'lucide-react';
import { checkApiHealth } from '../../services/api';
import { ORDER_STATUSES, formatDateTime, formatVnd, getOrderStats, listOrders } from '../../services/ordersApi';
import { StatusBadge } from '../orders/StatusBadge';

export const RECENT_ORDERS_LIMIT = 5;

export function DashboardView({ stats, onNavigateToOrders }) {
  const [orderStats, setOrderStats] = useState(null);
  const [orderStatsError, setOrderStatsError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [apiOnline, setApiOnline] = useState(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setHealthChecking(true);
    const [statsRes, recentRes, healthRes] = await Promise.allSettled([
      getOrderStats(),
      listOrders({ page: 1, pageSize: RECENT_ORDERS_LIMIT }),
      checkApiHealth(),
    ]);
    if (statsRes.status === 'fulfilled') {
      setOrderStats(statsRes.value);
      setOrderStatsError(null);
    } else {
      setOrderStatsError(statsRes.reason?.message || 'Không tải được số liệu đơn hàng.');
    }
    if (recentRes.status === 'fulfilled') setRecentOrders(recentRes.value.items);
    setApiOnline(healthRes.status === 'fulfilled' && healthRes.value === true);
    setHealthChecking(false);
    setLastCheckedTime(new Date().toLocaleTimeString('vi-VN'));
  }, []);

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(loadDashboardData, 30000);
    return () => clearInterval(timer);
  }, [loadDashboardData]);

  const formatCurrency = formatVnd;
  const countFor = (status) => orderStats?.ordersByStatus?.[status] || 0;

  const totalProducts = stats?.totalProducts || 0;
  const activeProducts = stats?.activeProducts || 0;
  const totalOrders = orderStats?.totalOrders || 0;
  const pendingPayment = orderStats?.pendingCount || 0;
  const processingOrders = orderStats?.processingCount || 0;
  const deliveredOrders = orderStats?.deliveredCount || 0;
  const revenue = orderStats?.totalRevenue || 0;
  const averageOrderValue = orderStats?.averageOrderValue || 0;

  return (
    <main className="main-content">
      {/* ── Page Header with Health Badge ───────────────────────────────────── */}
      <div
        className="page-title"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <span>Operations Dashboard</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: apiOnline === false ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.12)',
              border: `1px solid ${apiOnline === false ? '#fef08a' : '#bbf7d0'}`,
              color: apiOnline === false ? '#854d0e' : '#166534',
            }}
          >
            <Activity size={14} className={healthChecking ? 'spin' : ''} />
            <span>{apiOnline === null ? 'Đang kiểm tra...' : apiOnline ? 'API Server: Online 🟢' : 'API Server: Offline 🟡'}</span>
            {lastCheckedTime && <span style={{ opacity: 0.7, fontSize: '11px', marginLeft: 4 }}>({lastCheckedTime})</span>}
          </div>

          <button
            type="button"
            className="btn"
            onClick={loadDashboardData}
            disabled={healthChecking}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <RefreshCw size={13} className={healthChecking ? 'spin' : ''} /> Kiểm tra
          </button>
        </div>
      </div>

      {orderStatsError && (
        <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 14 }}>
          <AlertCircle size={16} /> {orderStatsError}
        </div>
      )}

      {/* ── Real Backend Data KPI Cards Grid ─────────────────────────────────── */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{totalProducts}</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>Catalogue total</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Products</div>
          <div className="stat-value" style={{ color: '#059669' }}>{activeProducts}</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>Live in search</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{totalOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>Recorded in database</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Payment</div>
          <div className="stat-value" style={{ color: '#d97706' }}>{pendingPayment}</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>Awaiting VNPay/COD</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Processing Orders</div>
          <div className="stat-value" style={{ color: '#0284c7' }}>{processingOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>In fulfillment</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Delivered Orders</div>
          <div className="stat-value" style={{ color: '#059669' }}>{deliveredOrders}</div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>Successfully completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{formatCurrency(revenue)}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>No comparison data</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{formatCurrency(averageOrderValue)}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>No comparison data</div>
        </div>
      </div>

      {/* ── Interactive Order Status Overview ─────────────────────────────────── */}
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Order Status Overview</span>
          <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 400 }}>Nhấn vào thẻ trạng thái để lọc đơn hàng tương ứng</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, paddingTop: 12 }}>
          {Object.entries(ORDER_STATUSES).map(([key, meta]) => ({ key, ...meta, count: countFor(key) })).map((item) => (
            <div
              key={item.key}
              onClick={() => onNavigateToOrders && onNavigateToOrders(item.key)}
              style={{
                padding: '14px 16px',
                borderRadius: 8,
                background: item.bg,
                border: `1px solid ${item.color}30`,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: item.color, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.count} đơn</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Latest orders ────────────────────────────────────────────────────── */}
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{RECENT_ORDERS_LIMIT} đơn mới nhất</span>
          <Link to="/orders" style={{ fontSize: 13, fontWeight: 500 }}>Xem tất cả</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '16px 0', color: 'var(--text-light)', fontSize: 14 }}>Chưa có đơn hàng.</div>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th style={{ textAlign: 'right' }}>Tổng tiền</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${encodeURIComponent(order.order_code)}`} style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {order.order_code}
                    </Link>
                  </td>
                  <td>{order.customer_name}</td>
                  <td style={{ fontSize: 13 }}>{formatDateTime(order.created_at)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVnd(order.total)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Payment Channels Overview ────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div className="detail-card" style={{ marginBottom: 0 }}>
          <div className="card-header">Payment Method Breakdown</div>
          <div style={{ paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 10, border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ color: '#0066b3', display: 'block' }}>Cổng VNPay Sandbox</strong>
                <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Xác thực chữ ký SHA256 & IPN</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 16 }}>{formatCurrency(orderStats?.vnpayRevenue || 0)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ color: '#475569', display: 'block' }}>Thanh toán COD (Tiền mặt)</strong>
                <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Thu tiền tận nơi khi nhận hàng</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 16 }}>{formatCurrency(orderStats?.codRevenue || 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>


    </main>
  );
}
