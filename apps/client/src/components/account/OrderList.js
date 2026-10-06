import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, formatCurrency } from '../../services/orderService';
import { sizedImage } from '../../services/images';
import {
  ArrowClockwise,
  ArrowLeft,
  CaretRight,
  CircleNotch,
  Package,
  SignIn,
  WarningCircle,
} from '../common/SkyIconSet';
import { OrderStatusBadge } from './orderStatusBadge';
import '../../styles/studio/account.css';

// Orders come from the API: identified by UUID, shown by their REECO-#### code.
function orderLabel(order) {
  if (order.order_code) return order.order_code;
  if (order.order_number) return `REECO-${order.order_number}`;
  return `#${order.id}`;
}

function formatDeliveryRange(from, to) {
  if (!from) return null;
  const start = new Date(from);
  const end = to ? new Date(to) : null;
  if (Number.isNaN(start.getTime())) return to ? `${from} – ${to}` : from;
  const short = { month: 'short', day: 'numeric' };
  if (!end || Number.isNaN(end.getTime())) {
    return start.toLocaleDateString('en-US', { ...short, year: 'numeric' });
  }
  return `${start.toLocaleDateString('en-US', short)} – ${end.toLocaleDateString('en-US', { ...short, year: 'numeric' })}`;
}

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
      setError(err.message || 'Your orders could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!isAuthenticated || !user) {
    return (
      <div className="st-page st-page--narrow ac-page">
        <div className="st-state">
          <div className="st-orb st-orb--live" aria-hidden="true">
            <span className="st-orb__icon"><SignIn size={20} /></span>
          </div>
          <h1 className="st-state__title">Sign in to see your orders</h1>
          <p className="st-state__desc">Your order history and delivery tracking appear here once you sign in.</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => onNavigate && onNavigate('login')}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openOrder = (order) => {
    const targetId = order.id || order.order_code;
    if (onViewOrder) {
      onViewOrder(targetId);
    } else if (onNavigate) {
      onNavigate(`account-order:${targetId}`);
    }
  };

  return (
    <div className="st-page ac-page">
      <button type="button" className="st-back" onClick={() => onNavigate && onNavigate('account')}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to account
      </button>

      <header className="st-header st-header--plain">
        <div className="st-header__title">
          <h1>My orders</h1>
        </div>
        <div className="st-header__aside">
          <p>Track your Campbell Scientific orders from payment to delivery.</p>
          <button type="button" className="st-btn st-btn--sm" onClick={() => onNavigate && onNavigate('products')}>
            Browse products
          </button>
        </div>
      </header>

      {loading ? (
        <div className="st-loading" role="status">
          <CircleNotch size={20} className="spin" aria-hidden="true" /> Loading orders
        </div>
      ) : error ? (
        <div className="st-state" role="alert">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><WarningCircle size={20} /></span>
          </div>
          <h2 className="st-state__title">Orders could not load</h2>
          <p className="st-state__desc">{error}</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={fetchOrders}>
              <ArrowClockwise size={16} aria-hidden="true" /> Try again
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="st-state">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><Package size={20} /></span>
          </div>
          <h2 className="st-state__title">No orders yet</h2>
          <p className="st-state__desc">When you order from REECO, each order and its delivery progress shows up here.</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => onNavigate && onNavigate('products')}>
              Browse products
            </button>
          </div>
        </div>
      ) : (
        <ul className="ac-orders">
          {orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const items = order.order_items || order.items || [];
            const itemCount = items.length;
            const first = items[0];
            const firstImage = first?.image_url || first?.image;
            const models = items.map((item) => item.model || item.product_id).join(', ');
            const label = orderLabel(order);
            const delivery = formatDeliveryRange(order.estimated_delivery_from, order.estimated_delivery_to);

            return (
              <li key={order.id || order.order_code} className="ac-order" onClick={() => openOrder(order)}>
                <span className="st-thumb st-thumb--lg" aria-hidden="true">
                  {firstImage ? <img src={sizedImage(firstImage, 200)} alt="" /> : <Package size={22} />}
                </span>

                <div>
                  <h2 className="ac-order__id">{label}</h2>
                  <p className="ac-order__items" title={models}>
                    {dateStr}, {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    {models ? `: ${models}` : ''}
                  </p>
                </div>

                <div className="ac-order__cell ac-order__status">
                  <span className="ac-order__label">Status</span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="ac-order__cell ac-order__delivery">
                  <span className="ac-order__label">Estimated delivery</span>
                  <span>{delivery || 'Not scheduled yet'}</span>
                </div>

                <div className="ac-order__cell ac-order__money">
                  <span className="ac-order__label">Total</span>
                  <span className="ac-order__total">{formatCurrency(Number(order.total))}</span>
                </div>

                <div className="ac-order__end">
                  <button
                    type="button"
                    className="st-btn st-btn--icon st-btn--sm"
                    aria-label={`View order ${label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openOrder(order);
                    }}
                  >
                    <CaretRight size={14} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default OrderList;
