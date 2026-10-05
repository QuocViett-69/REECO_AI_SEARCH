import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderService, ORDER_STATUSES, SHIPPING_METHODS } from '../../services/orderService';
import { formatPrice } from '../../services/commercialService';
import {
  ArrowLeft,
  CaretRight,
  CheckCircle,
  FloppyDisk,
  MagnifyingGlass,
  Shield,
  WarningCircle,
} from '@phosphor-icons/react';
import { getPaymentMethodLabel } from '../../services/paymentService';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  getOrderStatusBadge,
} from '../account/orderStatusBadge';
import '../../styles/studio/compare-login-admin.css';

export function AdminOrders({ onViewOrder }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [inlineNotice, setInlineNotice] = useState(null);

  const orderKey = (o) => o.id || o.order_id || o.order_code;
  // API rows carry order_code / order_number; older local rows carry order_id
  const orderLabel = (o) => o.order_id || o.order_number || o.order_code || o.id;
  const sameOrder = (a, b) => Boolean(a && b) && ((a.id && a.id === b.id) || (a.order_id && a.order_id === b.order_id));

  const loadOrders = async () => {
    if (user && user.role === 'admin') {
      try {
        // One unfiltered call feeds the summary figures; the filtered one feeds the table
        const [everything, res] = await Promise.all([
          orderService.getAllOrdersForAdmin(user, {}),
          orderService.getAllOrdersForAdmin(user, { search: searchQuery, status: statusFilter }),
        ]);
        if (everything.orders) setAllOrders(everything.orders);
        if (res.orders) {
          setOrders(res.orders);
          if (selectedOrder) {
            const updated = res.orders.find((o) => sameOrder(o, selectedOrder));
            if (updated) setSelectedOrder(updated);
          }
        }
      } catch (err) {
        console.error('Failed to load admin orders', err);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user, searchQuery, statusFilter]);

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="st-page st-page--narrow ad-page">
        <div className="st-state">
          <span className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><Shield size={20} /></span>
          </span>
          <h2 className="st-state__title">Admin access required</h2>
          <p className="st-state__desc">
            Sign in with an administrator account to manage orders.
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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setActionError(null);
    setSaveSuccess(false);

    if (!selectedOrder) return;

    try {
      const res = await orderService.updateOrderStatus(orderKey(selectedOrder), editStatus, 'Admin update');
      setSelectedOrder(res?.order || res);
      setSaveSuccess(true);
      await loadOrders();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setActionError(err.message || 'Could not update the order status.');
    }
  };

  // Status changes straight from the table row, without opening the order
  const handleInlineStatus = async (order, status) => {
    if (status === order.status) return;
    try {
      await orderService.updateOrderStatus(orderKey(order), status, 'Admin update');
      setInlineNotice({ tone: 'ok', text: `Order #${orderLabel(order)} moved to ${getOrderStatusBadge(status).label.toLowerCase()}.` });
      await loadOrders();
    } catch (err) {
      setInlineNotice({ tone: 'error', text: err.message || 'Could not update the order status.' });
    }
    setTimeout(() => setInlineNotice(null), 3000);
  };

  const countOf = (statuses) => allOrders.filter((o) => statuses.includes(o.status)).length;
  const figures = [
    { label: 'All orders', value: allOrders.length, accent: 'lilac' },
    { label: 'Awaiting payment', value: countOf(['PENDING_PAYMENT']), accent: 'sun' },
    { label: 'In fulfillment', value: countOf(['PAID', 'PROCESSING', 'FORWARDED_TO_MANUFACTURER', 'SHIPPED']), accent: 'sky' },
    { label: 'Delivered', value: countOf(['DELIVERED']), accent: 'coral' },
  ];
  const statusTabs = Object.keys(ORDER_STATUSES)
    .map((key) => ({ key, count: countOf([key]) }))
    .filter((tab) => tab.count > 0 || tab.key === statusFilter);

  return (
    <div className="st-page ad-page">
      <header className="st-header ad-header">
        <div className="st-header__title">
          <h1>Orders</h1>
        </div>
        <div className="st-header__aside">
          <p>Review commercial orders, move them through fulfillment and keep customers up to date.</p>
        </div>
      </header>

      <dl className="ad-figures">
        {figures.map((f) => (
          <div key={f.label} className={`ad-figure ad-figure--${f.accent}`}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      {selectedOrder ? (
        /* ── Admin order detail and status editor ── */
        <div className="ad-detail">
          <button type="button" className="st-back" onClick={() => setSelectedOrder(null)}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to all orders
          </button>

          {saveSuccess && (
            <p className="st-note ad-note" role="status">
              <CheckCircle size={18} aria-hidden="true" />
              <span>
                Order status updated to <strong>{getOrderStatusBadge(editStatus).label}</strong>.
              </span>
            </p>
          )}

          {actionError && (
            <p className="st-note st-note--error ad-note" role="alert">
              <WarningCircle size={18} aria-hidden="true" />
              <span>{actionError}</span>
            </p>
          )}

          <div className="ad-detail__head">
            <div>
              <h2 className="st-heading">Order #{orderLabel(selectedOrder)}</h2>
              <p className="st-caption">{selectedOrder.customer_name}, {selectedOrder.city}</p>
            </div>
            <OrderStatusBadge status={selectedOrder.status} />
          </div>

          <div className="ad-split">
            <div className="ad-split__main">
              <section className="st-panel ad-status" aria-labelledby="ad-status-title">
                <h3 className="st-label" id="ad-status-title">Update fulfillment status</h3>
                <form onSubmit={handleUpdateStatus} className="ad-status__form">
                  <select
                    className="st-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    aria-labelledby="ad-status-title"
                  >
                    {Object.keys(ORDER_STATUSES).map((key) => (
                      <option key={key} value={key}>
                        {getOrderStatusBadge(key).label}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="st-btn st-btn--primary">
                    <FloppyDisk size={16} aria-hidden="true" /> Save status
                  </button>
                </form>
              </section>

              <section className="ad-items" aria-labelledby="ad-items-title">
                <h3 className="st-subheading" id="ad-items-title">
                  Ordered products <span className="st-muted">({selectedOrder.items?.length || 0})</span>
                </h3>
                <ul className="ad-items__list">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx} className="ad-item">
                      <span className="st-thumb">
                        {item.image ? (
                          <img src={item.image} alt="" />
                        ) : (
                          <span className="st-thumb__fallback">{(item.model || '').slice(0, 4)}</span>
                        )}
                      </span>
                      <div className="ad-item__info">
                        <div className="ad-item__model">{item.model}</div>
                        <div className="ad-item__name">{item.product_name}</div>
                        <div className="ad-item__qty st-num">
                          {formatPrice(item.unit_price, selectedOrder.currency)} × {item.quantity}
                        </div>
                      </div>
                      <div className="ad-item__total st-num">
                        {formatPrice(item.line_total, selectedOrder.currency)}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="st-sum ad-sum">
                  <div className="st-sum__row">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</span>
                  </div>
                  <div className="st-sum__row">
                    <span>Shipping fee</span>
                    <span>{formatPrice(selectedOrder.shipping_fee, selectedOrder.currency)}</span>
                  </div>
                  <div className="st-sum__total">
                    <span>Total</span>
                    <strong>{formatPrice(selectedOrder.total, selectedOrder.currency)}</strong>
                  </div>
                </div>
              </section>
            </div>

            <aside className="ad-split__aside">
              <section aria-labelledby="ad-cust-title">
                <h3 className="ad-aside-title" id="ad-cust-title">Customer</h3>
                <dl className="st-dl">
                  <div><dt>Name</dt><dd>{selectedOrder.customer_name}</dd></div>
                  <div><dt>Username</dt><dd className="st-mono">{selectedOrder.customer_id}</dd></div>
                  <div><dt>Email</dt><dd>{selectedOrder.customer_email}</dd></div>
                  <div><dt>Phone</dt><dd>{selectedOrder.customer_phone}</dd></div>
                </dl>
              </section>

              <section aria-labelledby="ad-ship-title">
                <h3 className="ad-aside-title" id="ad-ship-title">Shipping and delivery</h3>
                <dl className="st-dl">
                  <div>
                    <dt>Method</dt>
                    <dd>
                      {SHIPPING_METHODS[selectedOrder.shipping_method]?.name || selectedOrder.shipping_method}{' '}
                      ({formatPrice(selectedOrder.shipping_fee, selectedOrder.currency)})
                    </dd>
                  </div>
                  <div><dt>Destination</dt><dd>{selectedOrder.shipping_address}, {selectedOrder.city}</dd></div>
                  <div><dt>Estimated</dt><dd>{selectedOrder.estimated_delivery?.display}</dd></div>
                </dl>
              </section>

              <section aria-labelledby="ad-pay-title">
                <h3 className="ad-aside-title" id="ad-pay-title">Payment</h3>
                <dl className="st-dl">
                  <div><dt>Method</dt><dd>{getPaymentMethodLabel(selectedOrder.payment_method)}</dd></div>
                  <div><dt>Status</dt><dd><PaymentStatusBadge status={selectedOrder.payment_status} /></dd></div>
                </dl>
              </section>
            </aside>
          </div>
        </div>
      ) : (
        /* ── Admin order table ── */
        <div>
          <div className="ad-toolbar">
            <div className="st-tabs ad-filters" role="group" aria-label="Filter by status">
              <button
                type="button"
                className="st-tab"
                aria-pressed={statusFilter === 'ALL'}
                onClick={() => setStatusFilter('ALL')}
              >
                All <span className="st-tab__count">{allOrders.length}</span>
              </button>
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className="st-tab"
                  aria-pressed={statusFilter === tab.key}
                  onClick={() => setStatusFilter(statusFilter === tab.key ? 'ALL' : tab.key)}
                >
                  {getOrderStatusBadge(tab.key).label} <span className="st-tab__count">{tab.count}</span>
                </button>
              ))}
            </div>
            <label className="st-search ad-search">
              <MagnifyingGlass size={17} aria-hidden="true" />
              <span className="sr-only">Search orders</span>
              <input
                type="search"
                placeholder="Order ID, name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
          </div>

          {inlineNotice && (
            <p
              className={`st-note ad-note ${inlineNotice.tone === 'error' ? 'st-note--error' : ''}`}
              role={inlineNotice.tone === 'error' ? 'alert' : 'status'}
            >
              {inlineNotice.tone === 'error' ? <WarningCircle size={18} aria-hidden="true" /> : <CheckCircle size={18} aria-hidden="true" />}
              <span>{inlineNotice.text}</span>
            </p>
          )}

          {orders.length === 0 ? (
            <div className="st-state">
              <span className="st-orb st-orb--stone" aria-hidden="true" />
              <h2 className="st-state__title">No orders match</h2>
              <p className="st-state__desc">Try a different search, or show every status.</p>
              <div className="st-state__actions">
                <button
                  type="button"
                  className="st-btn"
                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                >
                  Show all orders
                </button>
              </div>
            </div>
          ) : (
            <div className="st-table-wrap">
              <table className="st-table st-table--hover ad-table">
                <caption className="sr-only">All customer orders</caption>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col" className="ad-table__right">Total</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Fulfillment</th>
                    <th scope="col" className="ad-table__action">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id || order.order_id}>
                      <td data-label="Order" className="ad-table__id">#{orderLabel(order)}</td>
                      <td data-label="Customer">
                        <div className="ad-table__name">{order.customer_name}</div>
                        <div className="ad-table__email">{order.customer_email}</div>
                      </td>
                      <td data-label="Total" className="ad-table__right st-num">
                        {formatPrice(order.total, order.currency)}
                      </td>
                      <td data-label="Payment">
                        <PaymentStatusBadge status={order.payment_status} />
                      </td>
                      <td data-label="Fulfillment">
                        <label className="ad-inline">
                          <span className="sr-only">Status of order #{orderLabel(order)}</span>
                          <span className={`ad-inline__dot ad-inline__dot--${getOrderStatusBadge(order.status).tone}`} aria-hidden="true" />
                          <select
                            className="ad-inline__select"
                            value={order.status}
                            onChange={(e) => handleInlineStatus(order, e.target.value)}
                          >
                            {Object.keys(ORDER_STATUSES).map((key) => (
                              <option key={key} value={key}>
                                {getOrderStatusBadge(key).label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </td>
                      <td className="ad-table__action">
                        <button
                          type="button"
                          className="st-btn st-btn--sm"
                          onClick={() => handleSelectOrder(order)}
                          aria-label={`Manage order #${orderLabel(order)}`}
                        >
                          Open <CaretRight size={14} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
