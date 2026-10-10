import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorite } from '../../context/FavoriteContext';
import { orderService, formatCurrency } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { sizedImage } from '../../services/images';
import {
  ArrowClockwise,
  Bell,
  Buildings,
  CaretRight,
  CircleNotch,
  EnvelopeSimple,
  Heart,
  Package,
  Shield,
  ShoppingBag,
  SignOut,
  User,
  WarningCircle,
} from '../common/SkyIconSet';
import { OrderStatusBadge } from './orderStatusBadge';
import '../../styles/studio/account.css';

const OPEN_STATUSES = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'FORWARDED_TO_MANUFACTURER', 'SHIPPED'];

function orderLabel(order) {
  if (order.order_code) return order.order_code;
  if (order.order_number) return `REECO-${order.order_number}`;
  return `#${order.id}`;
}

export function AccountDashboard({ onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoriteCount } = useFavorite();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
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
        // ponytail: status counts cover the newest 100 orders (API page max); add a stats endpoint if customers exceed that.
        orderService.getMyOrders(1, 100),
        notificationService.getUnreadCount(),
      ]);

      const orders = ordersRes?.items || ordersRes?.data || (Array.isArray(ordersRes) ? ordersRes : []);
      const pending = orders.filter((o) => OPEN_STATUSES.includes(o.status)).length;
      const completed = orders.filter((o) => o.status === 'DELIVERED').length;

      setOrderMetrics({
        total: typeof ordersRes?.total === 'number' ? ordersRes.total : orders.length,
        pending,
        completed,
      });
      setRecentOrders(
        [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)
      );
      setUnreadNotifs(unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Your account overview could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const go = (target) => onNavigate && onNavigate(target);

  if (!isAuthenticated || !user) {
    return (
      <div className="st-page st-page--narrow ac-page">
        <div className="st-state">
          <div className="st-orb st-orb--live" aria-hidden="true">
            <span className="st-orb__icon"><User size={20} /></span>
          </div>
          <h1 className="st-state__title">Sign in to see your account</h1>
          <p className="st-state__desc">
            Use your customer or partner account to track orders, favorites and notifications.
          </p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => go('login')}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const firstName = (user.full_name || '').split(/\s+/)[0];

  const figures = [
    { key: 'total', label: 'Orders placed', value: orderMetrics.total, tone: 'lilac' },
    { key: 'pending', label: 'On the way', value: orderMetrics.pending, tone: 'sky' },
    { key: 'completed', label: 'Delivered', value: orderMetrics.completed, tone: 'sun' },
    { key: 'unread', label: 'Unread notifications', value: unreadNotifs, tone: 'coral' },
  ];

  const links = [
    { key: 'orders', tone: 'lilac', target: 'account-orders', icon: Package, count: orderMetrics.total, title: 'My orders', desc: 'Track delivery progress and order history' },
    { key: 'favorites', tone: 'coral', target: 'favorites', icon: Heart, count: favoriteCount, title: 'Favorites', desc: 'Sensors and equipment you saved for later' },
    { key: 'notifications', tone: 'sky', target: 'account-notifications', icon: Bell, count: unreadNotifs, title: 'Notifications', desc: 'Updates on orders, payments and shipping' },
    { key: 'cart', tone: 'sun', target: 'cart', icon: ShoppingBag, count: cartCount, title: 'Cart', desc: 'Items ready for checkout' },
    { key: 'profile', tone: 'cream', target: 'account-profile', icon: User, title: 'Profile', desc: 'Name, email and organization' },
  ];

  return (
    <div className="st-page ac-page">
      <header className="ac-hero">
        <div className="ac-hero__text">
          <h1 className="st-display">Hello, {firstName}</h1>
          <p className="st-lede ac-hero__lede">Your orders, saved products and delivery updates from REECO.</p>
          <div className="ac-hello__meta">
            <span><EnvelopeSimple size={16} aria-hidden="true" /> {user.email}</span>
            {user.company && <span><Buildings size={16} aria-hidden="true" /> {user.company}</span>}
          </div>
          <div className="ac-actions">
            {roleLabel && (
              <span className="st-tag st-tag--outline">
                {isAdmin && <Shield size={13} aria-hidden="true" />}
                {roleLabel} account
              </span>
            )}
            {isAdmin && (
              <a
                href={process.env.REACT_APP_ADMIN_URL || 'http://localhost:5174'}
                className="st-btn st-btn--primary st-btn--sm"
                style={{ textDecoration: 'none' }}
              >
                <Shield size={14} aria-hidden="true" /> Order admin
              </a>
            )}
            <button type="button" className="st-btn st-btn--sm" onClick={logout}>
              <SignOut size={14} aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
        <div className="ac-hero__art" aria-hidden="true">
          <span className="st-orb st-orb--live ac-hero__sticker ac-hero__sticker--a" />
          <span className="st-orb st-orb--violet ac-hero__sticker ac-hero__sticker--b" />
          <span className="st-orb st-orb--ember ac-hero__sticker ac-hero__sticker--c" />
        </div>
      </header>

      {loading ? (
        <div className="st-loading" role="status">
          <CircleNotch size={20} className="spin" aria-hidden="true" /> Updating your orders and notifications
        </div>
      ) : error ? (
        <div className="st-state" role="alert">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><WarningCircle size={20} /></span>
          </div>
          <h2 className="st-state__title">Your overview could not load</h2>
          <p className="st-state__desc">{error}</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={loadDashboardData}>
              <ArrowClockwise size={16} aria-hidden="true" /> Try again
            </button>
          </div>
        </div>
      ) : (
        <>
          <dl className="ac-figures">
            {figures.map((f) => (
              <div key={f.key} className={`ac-figure ac-figure--${f.tone}`}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="ac-board">
            <section className="st-panel st-panel--lg ac-recent" aria-labelledby="ac-recent-title">
              <div className="ac-recent__head">
                <h2 className="st-heading" id="ac-recent-title">Recent orders</h2>
                {recentOrders.length > 0 && (
                  <button type="button" className="st-link" onClick={() => go('account-orders')}>
                    See all orders
                  </button>
                )}
              </div>

              {recentOrders.length === 0 ? (
                <div className="ac-recent__empty">
                  <p>You haven't placed an order yet. Instruments you order will be tracked here.</p>
                  <button type="button" className="st-btn st-btn--primary" onClick={() => go('products')}>
                    Browse products
                  </button>
                </div>
              ) : (
                <ul className="ac-recent__list">
                  {recentOrders.map((order) => {
                    const items = order.order_items || order.items || [];
                    const first = items[0];
                    const firstImage = first?.image_url || first?.image;
                    const itemCount = items.length;
                    const targetId = order.id || order.order_code;
                    return (
                      <li key={order.id || order.order_code}>
                        <button
                          type="button"
                          className="ac-recent__row"
                          onClick={() => go(`account-order:${targetId}`)}
                        >
                          <span className="st-thumb" aria-hidden="true">
                            {firstImage ? <img src={sizedImage(firstImage, 160)} alt="" /> : <Package size={20} />}
                          </span>
                          <span>
                            <span className="ac-recent__id">{orderLabel(order)}</span>
                            <span className="ac-recent__sub">
                              {first ? first.model || first.product_id : 'Order'}
                              {itemCount > 1 ? ` and ${itemCount - 1} more` : ''}
                              {', '}
                              {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </span>
                          <span className="ac-recent__side">
                            <OrderStatusBadge status={order.status} />
                            <span className="st-num st-caption">{formatCurrency(Number(order.total))}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section aria-labelledby="ac-links-title">
              <h2 className="st-subheading ac-board__title" id="ac-links-title">Go to</h2>
              <ul className="ac-links">
                {links.map(({ key, tone, target, icon: Icon, count, title, desc }) => (
                  <li key={key}>
                    <button type="button" className="ac-link" onClick={() => go(target)}>
                      <span className={`ac-icon ac-icon--${tone}`} aria-hidden="true"><Icon size={20} /></span>
                      <span>
                        <span className="ac-link__title">{title}</span>
                        <span className="ac-link__desc">{desc}</span>
                      </span>
                      <span className="ac-link__count" aria-label={count != null ? `${count} ${title.toLowerCase()}` : undefined}>
                        {count != null ? count : ''}
                      </span>
                      <CaretRight size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default AccountDashboard;
