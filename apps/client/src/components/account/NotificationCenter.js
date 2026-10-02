import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationService, NOTIFICATION_TYPES } from '../../services/notificationService';
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  Package,
  CreditCard,
  Truck,
  Sparkles,
  ChevronRight,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

function getRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now - past;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const NOTIF_TAB_KEY = 'reeco_notifications_tab';

export function NotificationCenter({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    return notificationService.getCachedNotifications();
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return sessionStorage.getItem(NOTIF_TAB_KEY) || 'all';
    } catch {
      return 'all';
    }
  });
  const [loading, setLoading] = useState(() => {
    return notificationService.getCachedNotifications().length === 0;
  });
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    // Only show full loading spinner if cache is empty
    if (notificationService.getCachedNotifications().length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const list = await notificationService.getMyNotifications();
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      if (notificationService.getCachedNotifications().length === 0) {
        setError(err.message || 'Unable to load notifications.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem(NOTIF_TAB_KEY, tab);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <Bell size={40} style={{ color: '#93979f', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Sign In Required</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Please sign in to view order notifications and delivery updates.
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

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch {}
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read_at) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.order_id && onNavigate) {
      onNavigate(`account-order:${notif.order_id}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="page-container" style={{ maxWidth: 840, margin: '40px auto', padding: '0 20px' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(0, 105, 224, 0.08)',
                  color: '#0069e0',
                  border: '1px solid rgba(0, 105, 224, 0.2)',
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
            Notifications on new orders, shipping status updates, and payment confirmations
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px', background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer' }}
          >
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            border: activeTab === 'all' ? '1px solid #111827' : '1px solid #e5e7eb',
            background: activeTab === 'all' ? '#111827' : '#fff',
            color: activeTab === 'all' ? '#fff' : '#6b7280',
            cursor: 'pointer',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('unread')}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            border: activeTab === 'unread' ? '1px solid #0069e0' : '1px solid #e5e7eb',
            background: activeTab === 'unread' ? '#0069e0' : '#fff',
            color: activeTab === 'unread' ? '#fff' : '#6b7280',
            cursor: 'pointer',
          }}
        >
          Unread ({unreadCount})
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
          <div>Loading notifications...</div>
        </div>
      )}

      {/* 2. Error state */}
      {!loading && error && (
        <div className="glass-card" style={{ padding: 36, borderRadius: 16, textAlign: 'center' }}>
          <AlertCircle size={40} color="#d93025" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Unable to load notifications</h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={loadNotifications}
            style={{ padding: '8px 20px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', border: 'none', borderRadius: 9999, cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* 3. Empty data state */}
      {!loading && !error && (activeTab === 'unread' ? notifications.filter(n => !n.read_at).length === 0 : notifications.length === 0) && (
        <div className="glass-card" style={{ padding: 48, borderRadius: 16, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#93979f',
              marginBottom: 16,
            }}
          >
            <Bell size={28} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
            {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
            {activeTab === 'unread' ? 'You have caught up with all order updates.' : 'All order updates and notifications will appear here.'}
          </p>
        </div>
      )}

      {/* 4. Data state */}
      {!loading && !error && (activeTab === 'unread' ? notifications.filter(n => !n.read_at) : notifications).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(activeTab === 'unread' ? notifications.filter(n => !n.read_at) : notifications).map((notif) => {
            const isRead = Boolean(notif.read_at);
            const typeConfig = NOTIFICATION_TYPES[notif.type] || {
              label: notif.type,
              color: '#0069e0',
            };

            let TypeIcon = Package;
            if (notif.type === 'PAYMENT_UPDATED') TypeIcon = CreditCard;
            else if (notif.type === 'ORDER_STATUS_CHANGED') TypeIcon = Truck;

            return (
              <div
                key={notif.id}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  cursor: notif.order_id ? 'pointer' : 'default',
                  border: isRead ? '1px solid #e5e7eb' : '1px solid rgba(0, 105, 224, 0.3)',
                  background: isRead ? '#ffffff' : 'rgba(0, 105, 224, 0.02)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onClick={() => handleNotificationClick(notif)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Status Indicator Dot */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      marginTop: 6,
                      background: isRead ? 'transparent' : '#0069e0',
                      border: isRead ? '1px solid #e5e7eb' : 'none',
                      flexShrink: 0,
                    }}
                  />

                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${typeConfig.color}15`,
                      color: typeConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <TypeIcon size={18} />
                  </div>

                  {/* Content */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: isRead ? 600 : 700,
                          color: isRead ? '#535862' : '#111827',
                        }}
                      >
                        {notif.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: `${typeConfig.color}15`,
                          color: typeConfig.color,
                        }}
                      >
                        {typeConfig.label}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 6 }}>
                      {notif.message}
                    </div>

                    <div style={{ fontSize: 11, color: '#93979f', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} />
                      <span>{getRelativeTime(notif.created_at)}</span>
                    </div>
                  </div>
                </div>

                {notif.order_id && (
                  <div style={{ display: 'flex', alignItems: 'center', color: '#0069e0', fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 4 }}>
                    <span>Track</span>
                    <ChevronRight size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
