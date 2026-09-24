import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationService, NOTIFICATION_TYPES } from '../../services/notificationService';
import { orderService } from '../../services/orderService';
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
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationCenter({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    if (user && user.username) {
      // Run daily notification job simulator check
      const userOrders = orderService.getCustomerOrders(user.username);
      notificationService.runDailyNotificationJob(user.username, userOrders);

      const list = notificationService.getNotifications(user.username);
      setNotifications(list);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: 40, borderRadius: 16 }}>
          <Bell size={40} style={{ color: 'var(--text-3, #777)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, marginBottom: 20 }}>
            Sign in to view commercial notifications and delivery status alerts.
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

  const handleMarkAsRead = (id) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(user.username);
    loadNotifications();
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      notificationService.markAsRead(notif.id);
    }
    if (notif.order_id && onNavigate) {
      onNavigate(`account-order:${notif.order_id}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
          color: 'var(--text-3, #888)',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Back to Account Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1, #fff)', margin: 0 }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(0, 210, 255, 0.15)',
                  color: 'var(--accent, #00d2ff)',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3, #888)', margin: '4px 0 0' }}>
            Daily fulfillment logs, payment authorizations, and delivery milestones
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <CheckCheck size={15} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3, #888)' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, borderRadius: 16, textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-3, #666)',
              marginBottom: 16,
            }}
          >
            <Bell size={28} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
            You're all caught up
          </h3>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, margin: 0 }}>
            There are no unread notifications for your account.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((notif) => {
            const typeConfig = NOTIFICATION_TYPES[notif.type] || {
              label: notif.type,
              color: '#00d2ff',
            };

            let TypeIcon = Package;
            if (notif.type === 'PAYMENT_UPDATED') TypeIcon = CreditCard;
            else if (notif.type === 'DELIVERY_UPDATED') TypeIcon = Truck;
            else if (notif.type === 'DAILY_ORDER_UPDATE') TypeIcon = Sparkles;

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
                  border: notif.is_read ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0, 210, 255, 0.25)',
                  background: notif.is_read ? 'rgba(255,255,255,0.01)' : 'rgba(0, 210, 255, 0.04)',
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
                      background: notif.is_read ? 'transparent' : 'var(--accent, #00d2ff)',
                      border: notif.is_read ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      flexShrink: 0,
                    }}
                  />

                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${typeConfig.color}18`,
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
                          fontWeight: notif.is_read ? 600 : 700,
                          color: notif.is_read ? 'var(--text-1, #eee)' : '#fff',
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

                    <div style={{ fontSize: 13, color: 'var(--text-2, #bbb)', lineHeight: 1.5, marginBottom: 6 }}>
                      {notif.message}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-3, #777)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} />
                      <span>{getRelativeTime(notif.created_at)}</span>
                    </div>
                  </div>
                </div>

                {notif.order_id && (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent, #00d2ff)', fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 4 }}>
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
