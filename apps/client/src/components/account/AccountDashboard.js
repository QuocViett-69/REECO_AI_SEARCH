import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorite } from '../../context/FavoriteContext';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import {
  User,
  ShoppingBag,
  Heart,
  Shield,
  LogOut,
  Package,
  ArrowRight,
  Bell,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export function AccountDashboard({ onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoriteCount } = useFavorite();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [orderMetrics, setOrderMetrics] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [ordersRes, unreadCount] = await Promise.all([
        orderService.getMyOrders(),
        notificationService.getUnreadCount(),
      ]);

      const orders = ordersRes?.items || ordersRes?.data || (Array.isArray(ordersRes) ? ordersRes : []);
      const pending = orders.filter((o) =>
        ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'FORWARDED_TO_MANUFACTURER', 'SHIPPED'].includes(o.status)
      ).length;
      const completed = orders.filter((o) => o.status === 'DELIVERED').length;

      setOrderMetrics({
        total: orders.length,
        pending,
        completed,
      });
      setUnreadNotifs(unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(0, 105, 224, 0.08)', color: '#0069e0', marginBottom: 20 }}>
            <User size={40} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
            Account Access Required
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            Please sign in with your customer or commercial partner account.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('login')}
            style={{ padding: '12px 28px', fontSize: 14, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 960, margin: '40px auto', padding: '0 20px' }}>
      {/* User Header */}
      <div className="glass-card" style={{ padding: 28, borderRadius: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: user.role === 'admin' ? 'rgba(0, 105, 224, 0.08)' : 'rgba(15, 149, 84, 0.08)',
              color: user.role === 'admin' ? '#0069e0' : '#0f9554',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.role === 'admin' ? <Shield size={28} /> : <User size={28} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
                {user.name}
              </h1>
              <span
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: user.role === 'admin' ? 'rgba(0, 105, 224, 0.08)' : 'rgba(15, 149, 84, 0.08)',
                  color: user.role === 'admin' ? '#0069e0' : '#0f9554',
                }}
              >
                {user.role}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {user.email} {user.company && `• ${user.company}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {user.role === 'admin' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate && onNavigate('admin-orders')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px', background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
            >
              <Shield size={14} /> Order Admin
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* 1. Loading state */}
      {loading && (
        <div className="glass-card" style={{ padding: 48, borderRadius: 16, textAlign: 'center', color: '#6b7280', marginBottom: 24 }}>
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
          <div>Updating metrics and notifications...</div>
        </div>
      )}

      {/* 2. Error state */}
      {!loading && error && (
        <div className="glass-card" style={{ padding: 32, borderRadius: 16, textAlign: 'center', marginBottom: 24 }}>
          <AlertCircle size={36} color="#d93025" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>Unable to load dashboard</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={loadDashboardData}
            style={{ padding: '8px 18px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* 3. Data state */}
      {!loading && !error && (
        <>
          {/* Metrics Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Total Orders</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{orderMetrics.total}</div>
            </div>
            <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Processing / In Transit</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0069e0' }}>{orderMetrics.pending}</div>
            </div>
            <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Unread Notifications</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: unreadNotifs > 0 ? '#8b5cf6' : '#93979f' }}>
                {unreadNotifs}
              </div>
            </div>
            <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Completed Orders</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f9554' }}>{orderMetrics.completed}</div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {/* Orders Card */}
            <div
              className="glass-card"
              style={{ padding: 22, borderRadius: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onClick={() => onNavigate && onNavigate('account-orders')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0, 105, 224, 0.08)', color: '#0069e0' }}>
                  <Package size={22} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{orderMetrics.total}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                My Orders
              </h3>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 14px' }}>
                Track delivery progress and order history
              </p>
              <div style={{ fontSize: 13, color: '#0069e0', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <span>View Orders</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Favorites Card */}
            <div
              className="glass-card"
              style={{ padding: 22, borderRadius: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onClick={() => onNavigate && onNavigate('favorites')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 10, background: 'rgba(217, 48, 37, 0.06)', color: '#d93025' }}>
                  <Heart size={22} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{favoriteCount}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Saved Favorites
              </h3>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 14px' }}>
                Review saved sensors and equipment
              </p>
              <div style={{ fontSize: 13, color: '#d93025', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <span>View Favorites</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Notifications Card */}
            <div
              className="glass-card"
              style={{ padding: 22, borderRadius: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onClick={() => onNavigate && onNavigate('account-notifications')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 10, background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
                  <Bell size={22} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{unreadNotifs}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Notifications
              </h3>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 14px' }}>
                Updates on orders, payments, and shipping
              </p>
              <div style={{ fontSize: 13, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <span>View Notifications</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Cart Card */}
            <div
              className="glass-card"
              style={{ padding: 22, borderRadius: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onClick={() => onNavigate && onNavigate('cart')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0, 105, 224, 0.08)', color: '#0069e0' }}>
                  <ShoppingBag size={22} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{cartCount}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                Cart
              </h3>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 14px' }}>
                Manage items ready for checkout
              </p>
              <div style={{ fontSize: 13, color: '#0069e0', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <span>Go to Cart</span> <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AccountDashboard;
