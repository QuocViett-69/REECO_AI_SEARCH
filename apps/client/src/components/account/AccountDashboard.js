import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user && user.username) {
      const orders = orderService.getCustomerOrders(user.username);
      const pending = orders.filter((o) =>
        ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'FORWARDED_TO_MANUFACTURER', 'SHIPPED'].includes(o.status)
      ).length;
      const completed = orders.filter((o) => o.status === 'DELIVERED').length;

      setOrderMetrics({
        total: orders.length,
        pending,
        completed,
      });

      setUnreadNotifs(notificationService.getUnreadCount(user.username));
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent, #00d2ff)', marginBottom: 20 }}>
            <User size={40} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-1, #fff)', marginBottom: 8 }}>
            Account Access Required
          </h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 24 }}>
            Sign in with your commercial partner or customer credentials.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('login')}
            style={{ padding: '12px 28px', fontSize: 14 }}
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
              background: user.role === 'admin' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(0, 200, 115, 0.15)',
              color: user.role === 'admin' ? 'var(--accent, #00d2ff)' : '#00c873',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.role === 'admin' ? <Shield size={28} /> : <User size={28} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1, #fff)', margin: 0 }}>
                {user.name}
              </h1>
              <span
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: user.role === 'admin' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(0, 200, 115, 0.15)',
                  color: user.role === 'admin' ? 'var(--accent, #00d2ff)' : '#00c873',
                }}
              >
                {user.role}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3, #888)' }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px' }}
            >
              <Shield size={14} /> Admin Portal
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px' }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 4 }}>Total Orders</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{orderMetrics.total}</div>
        </div>
        <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 4 }}>Saved Favorites</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ff6b6b' }}>{favoriteCount}</div>
        </div>
        <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 4 }}>Unread Alerts</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: unreadNotifs > 0 ? 'var(--accent, #00d2ff)' : '#aaa' }}>
            {unreadNotifs}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3, #888)', marginBottom: 4 }}>Completed Orders</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#00c873' }}>{orderMetrics.completed}</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {/* Orders Card */}
        <div
          className="glass-card"
          style={{ padding: 22, borderRadius: 14, cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('account-orders')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent, #00d2ff)' }}>
              <Package size={22} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1, #fff)' }}>{orderMetrics.total}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1, #fff)', margin: '0 0 4px' }}>
            My Orders
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-3, #888)', margin: '0 0 14px' }}>
            Track order delivery status and history
          </p>
          <div style={{ fontSize: 13, color: 'var(--accent, #00d2ff)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <span>View Orders</span> <ArrowRight size={14} />
          </div>
        </div>

        {/* Favorites Card */}
        <div
          className="glass-card"
          style={{ padding: 22, borderRadius: 14, cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('favorites')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255, 68, 68, 0.1)', color: '#ff6b6b' }}>
              <Heart size={22} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1, #fff)' }}>{favoriteCount}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1, #fff)', margin: '0 0 4px' }}>
            My Favorites
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-3, #888)', margin: '0 0 14px' }}>
            Review bookmarked sensors &amp; loggers
          </p>
          <div style={{ fontSize: 13, color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <span>View Favorites</span> <ArrowRight size={14} />
          </div>
        </div>

        {/* Notifications Card */}
        <div
          className="glass-card"
          style={{ padding: 22, borderRadius: 14, cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('account-notifications')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ padding: 10, borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Bell size={22} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1, #fff)' }}>{unreadNotifs}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1, #fff)', margin: '0 0 4px' }}>
            Notifications
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-3, #888)', margin: '0 0 14px' }}>
            Daily fulfillment logs &amp; milestone alerts
          </p>
          <div style={{ fontSize: 13, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <span>View Alerts</span> <ArrowRight size={14} />
          </div>
        </div>

        {/* Cart Card */}
        <div
          className="glass-card"
          style={{ padding: 22, borderRadius: 14, cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('cart')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ padding: 10, borderRadius: 10, background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent, #00d2ff)' }}>
              <ShoppingBag size={22} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1, #fff)' }}>{cartCount}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1, #fff)', margin: '0 0 4px' }}>
            Shopping Cart
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-3, #888)', margin: '0 0 14px' }}>
            Manage pending items for commercial order
          </p>
          <div style={{ fontSize: 13, color: 'var(--accent, #00d2ff)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <span>Go to Cart</span> <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDashboard;
