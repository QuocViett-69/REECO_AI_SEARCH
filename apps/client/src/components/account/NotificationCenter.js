import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationService, NOTIFICATION_TYPES } from '../../services/notificationService';
import {
  ArrowClockwise,
  ArrowLeft,
  Bell,
  Check,
  Checks,
  CircleNotch,
  CreditCard,
  Package,
  Truck,
  WarningCircle,
} from '../common/SkyIconSet';
import '../../styles/studio/account.css';

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

// Inbox sections: the day a notification arrived, relative to today.
function dayGroup(isoString) {
  if (!isoString) return 'Today';
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const created = new Date(isoString);
  const days = Math.floor((startOfToday - new Date(created).setHours(0, 0, 0, 0)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'Earlier this week';
  return 'Older';
}

const DAY_GROUPS = ['Today', 'Yesterday', 'Earlier this week', 'Older'];

const TYPE_ICONS = {
  ORDER_CREATED: Package,
  ORDER_STATUS_CHANGED: Truck,
  PAYMENT_UPDATED: CreditCard,
};

// The chosen tab survives a page refresh within the session.
const NOTIF_TAB_KEY = 'reeco_notifications_tab';

export function NotificationCenter({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  // Start from the session cache so the inbox paints immediately, then refresh from the API.
  const [notifications, setNotifications] = useState(() => notificationService.getCachedNotifications());
  const [loading, setLoading] = useState(() => notificationService.getCachedNotifications().length === 0);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(() => {
    try {
      return sessionStorage.getItem(NOTIF_TAB_KEY) || 'all';
    } catch {
      return 'all';
    }
  });

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    if (notificationService.getCachedNotifications().length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const list = await notificationService.getMyNotifications();
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      if (notificationService.getCachedNotifications().length === 0) {
        setError(err.message || 'Notifications could not be loaded.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const changeFilter = (next) => {
    setFilter(next);
    try {
      sessionStorage.setItem(NOTIF_TAB_KEY, next);
    } catch {}
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="st-page st-page--narrow ac-page">
        <div className="st-state">
          <div className="st-orb st-orb--live" aria-hidden="true">
            <span className="st-orb__icon"><Bell size={20} /></span>
          </div>
          <h1 className="st-state__title">Sign in to see notifications</h1>
          <p className="st-state__desc">Order, payment and shipping updates appear here.</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => onNavigate && onNavigate('login')}>
              Sign in
            </button>
          </div>
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
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
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
  const visible = filter === 'unread' ? notifications.filter((n) => !n.read_at) : notifications;
  const groups = DAY_GROUPS.map((label) => ({
    label,
    items: visible.filter((n) => dayGroup(n.created_at) === label),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="st-page st-page--mid ac-page">
      <button type="button" className="st-back" onClick={() => onNavigate && onNavigate('account')}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to account
      </button>

      <header className="st-header st-header--plain ac-header--stack">
        <div className="st-header__title">
          <h1 className="ac-title--long">Notifications</h1>
        </div>
        <div className="st-header__aside">
          <p>
            {unreadCount > 0
              ? `${unreadCount} unread. New orders, shipping updates and payment confirmations.`
              : 'New orders, shipping updates and payment confirmations.'}
          </p>
        </div>
      </header>

      {loading ? (
        <div className="st-loading" role="status">
          <CircleNotch size={20} className="spin" aria-hidden="true" /> Loading notifications
        </div>
      ) : error ? (
        <div className="st-state" role="alert">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><WarningCircle size={20} /></span>
          </div>
          <h2 className="st-state__title">Notifications could not load</h2>
          <p className="st-state__desc">{error}</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={loadNotifications}>
              <ArrowClockwise size={16} aria-hidden="true" /> Try again
            </button>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="st-state">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><Bell size={20} /></span>
          </div>
          <h2 className="st-state__title">No notifications yet</h2>
          <p className="st-state__desc">Updates about your orders will arrive here.</p>
        </div>
      ) : (
        <>
          <div className="ac-inbox-bar">
            <div className="st-tabs" role="group" aria-label="Show">
              <button type="button" className="st-tab" aria-pressed={filter === 'all'} onClick={() => changeFilter('all')}>
                All <span className="st-tab__count">{notifications.length}</span>
              </button>
              <button type="button" className="st-tab" aria-pressed={filter === 'unread'} onClick={() => changeFilter('unread')}>
                Unread <span className="st-tab__count">{unreadCount}</span>
              </button>
            </div>
            {unreadCount > 0 && (
              <button type="button" className="st-btn st-btn--sm" onClick={handleMarkAllRead}>
                <Checks size={14} aria-hidden="true" /> Mark all as read
              </button>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="st-state">
              <div className="st-orb st-orb--stone" aria-hidden="true">
                <span className="st-orb__icon"><Checks size={20} /></span>
              </div>
              <h2 className="st-state__title">No unread notifications</h2>
              <p className="st-state__desc">You've caught up with every order update. Show all to see past notifications.</p>
              <div className="st-state__actions">
                <button type="button" className="st-btn" onClick={() => changeFilter('all')}>
                  Show all
                </button>
              </div>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.label} className="ac-day" aria-label={group.label}>
                <h2 className="ac-day__label">
                  {group.label} <span>{group.items.length}</span>
                </h2>
                <ul className="ac-notes">
                  {group.items.map((notif) => {
                    const isRead = Boolean(notif.read_at);
                    const typeConfig = NOTIFICATION_TYPES[notif.type] || { label: notif.type };
                    const typeLabel = typeConfig.label
                      ? typeConfig.label.charAt(0).toUpperCase() + typeConfig.label.slice(1).toLowerCase()
                      : '';
                    const TypeIcon = TYPE_ICONS[notif.type] || Package;

                    return (
                      <li key={notif.id} className={`ac-note ${isRead ? 'is-read' : 'is-unread'}`}>
                        <span className="ac-note__icon" aria-hidden="true">
                          <span className="ac-icon"><TypeIcon size={18} /></span>
                          {!isRead && <span className="ac-note__dot" />}
                        </span>

                        <button type="button" className="ac-note__main" onClick={() => handleNotificationClick(notif)}>
                          <span className="ac-note__title">
                            {!isRead && <span className="sr-only">Unread: </span>}
                            {notif.title}
                          </span>
                          <span className="ac-note__msg">{notif.message}</span>
                          <span className="ac-note__meta">
                            {typeLabel && <span>{typeLabel}</span>}
                            <span>{getRelativeTime(notif.created_at)}</span>
                          </span>
                        </button>

                        <span className="ac-note__actions">
                          {!isRead && (
                            <button
                              type="button"
                              className="st-btn st-btn--icon st-btn--sm"
                              onClick={() => handleMarkAsRead(notif.id)}
                              aria-label={`Mark "${notif.title}" as read`}
                              title="Mark as read"
                            >
                              <Check size={14} aria-hidden="true" />
                            </button>
                          )}
                          {notif.order_id && (
                            <button
                              type="button"
                              className="st-btn st-btn--sm"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              Track order
                            </button>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default NotificationCenter;
