import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, CreditCard, MapPin, RefreshCw, User } from 'lucide-react';
import {
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUSES,
  formatDateTime,
  formatVnd,
  getOrder,
  statusLabel,
  updateOrderStatus,
} from '../../services/ordersApi';
import { StatusBadge } from './StatusBadge';

const NOTE_MAX_LENGTH = 500;

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 12,
  padding: 20,
};

const cardTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  fontWeight: 700,
  margin: '0 0 12px',
  color: 'var(--text-main)',
};

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.7 }}>
      <span style={{ color: 'var(--text-light)', minWidth: 110 }}>{label}</span>
      <span style={{ color: 'var(--text-main)', wordBreak: 'break-word' }}>{children || '—'}</span>
    </div>
  );
}

export function StatusEditor({ order, onUpdated }) {
  const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setNextStatus('');
    setNote('');
    setError(null);
  }, [order.status]);

  if (allowed.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>
        Đơn ở trạng thái cuối ({statusLabel(order.status)}), không thể chuyển tiếp.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nextStatus || saving) return;
    if (
      nextStatus === 'CANCELLED' &&
      !window.confirm(`Hủy đơn ${order.order_code}? Thao tác này không thể hoàn tác.`)
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateOrderStatus(order.order_code, nextStatus, note);
      await onUpdated(nextStatus);
    } catch (err) {
      const allowedNow = err.data?.allowed_statuses;
      setError(
        Array.isArray(allowedNow)
          ? `${err.message} Trạng thái hợp lệ: ${allowedNow.map(statusLabel).join(', ') || 'không có'}.`
          : err.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }} htmlFor="next-status">
        Chuyển sang trạng thái
      </label>
      <select
        id="next-status"
        className="filter-select"
        value={nextStatus}
        onChange={(e) => setNextStatus(e.target.value)}
        disabled={saving}
      >
        <option value="">— Chọn trạng thái —</option>
        {allowed.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status)}
          </option>
        ))}
      </select>
      <label style={{ fontSize: 13, fontWeight: 600 }} htmlFor="status-note">
        Ghi chú (không bắt buộc)
      </label>
      <textarea
        id="status-note"
        value={note}
        maxLength={NOTE_MAX_LENGTH}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        disabled={saving}
        placeholder="Ví dụ: mã vận đơn, lý do hủy..."
        style={{ padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
      />
      {error && (
        <div role="alert" style={{ display: 'flex', gap: 6, alignItems: 'flex-start', color: '#991b1b', fontSize: 13 }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
        </div>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!nextStatus || saving}
        style={nextStatus === 'CANCELLED' ? { background: 'var(--danger)', color: '#fff' } : undefined}
      >
        {saving ? 'Đang lưu...' : 'Lưu trạng thái'}
      </button>
    </form>
  );
}

export function OrderDetailView() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await getOrder(orderId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdated = async (status) => {
    await load();
    setNotice(`Đã chuyển đơn sang "${statusLabel(status)}".`);
    setTimeout(() => setNotice(null), 4000);
  };

  const back = (
    <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-light)', fontSize: 14, marginBottom: 16 }}>
      <ArrowLeft size={15} /> Danh sách đơn hàng
    </Link>
  );

  if (loading && !order) {
    return (
      <main className="main-content">
        {back}
        <div style={cardStyle}>Đang tải đơn hàng...</div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="main-content">
        {back}
        <div role="alert" style={{ ...cardStyle, display: 'flex', gap: 8, alignItems: 'center', color: '#991b1b' }}>
          <AlertCircle size={16} /> {error}
        </div>
      </main>
    );
  }

  const address = [order.shipping_address, order.city, order.province, order.country, order.postal_code]
    .filter(Boolean)
    .join(', ');

  return (
    <main className="main-content">
      {back}

      <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          Đơn {order.order_code} <StatusBadge status={order.status} />
        </span>
        <button type="button" className="btn" onClick={load} disabled={loading} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Tải lại
        </button>
      </div>
      <p style={{ margin: '-12px 0 20px', color: 'var(--text-light)', fontSize: 13 }}>
        Đặt lúc {formatDateTime(order.created_at)} · Cập nhật {formatDateTime(order.updated_at)}
      </p>

      {notice && (
        <div role="status" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', marginBottom: 16, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#065f46', fontSize: 14 }}>
          <CheckCircle size={16} /> {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section style={cardStyle}>
            <h2 style={cardTitleStyle}>Sản phẩm ({order.items.length})</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style={{ textAlign: 'right' }}>Đơn giá</th>
                    <th style={{ textAlign: 'center' }}>SL</th>
                    <th style={{ textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id || item.product_id}>
                      <td>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          {item.image_url && (
                            <img src={item.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                          )}
                          <div>
                            <Link to={`/products/${encodeURIComponent(item.product_id)}`} style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {item.model || item.product_id}
                            </Link>
                            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{item.product_name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatVnd(item.unit_price)}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatVnd(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginTop: 12, fontSize: 13 }}>
              <div>Tạm tính: <strong>{formatVnd(order.subtotal)}</strong></div>
              <div>Phí vận chuyển ({order.shipping_method}): <strong>{formatVnd(order.shipping_fee)}</strong></div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Tổng cộng: {formatVnd(order.total)}</div>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitleStyle}>Lịch sử trạng thái</h2>
            {order.history.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>Chưa có lịch sử.</p>
            ) : (
              <ol style={{ listStyle: 'none', margin: 0, padding: '0 0 0 14px', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.history.map((entry, index) => (
                  <li key={`${entry.created_at}-${index}`} style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>
                      {entry.from_status ? `${statusLabel(entry.from_status)} → ` : ''}
                      {statusLabel(entry.status)}
                    </div>
                    <div style={{ color: 'var(--text-light)', fontSize: 12 }}>{formatDateTime(entry.created_at)}</div>
                    {entry.note && <div style={{ marginTop: 2 }}>{entry.note}</div>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section style={{ ...cardStyle, borderColor: 'var(--primary)' }}>
            <h2 style={cardTitleStyle}>Cập nhật trạng thái</h2>
            <StatusEditor order={order} onUpdated={handleUpdated} />
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitleStyle}>
              <User size={16} /> Khách hàng
            </h2>
            <Row label="Họ tên">{order.customer_name}</Row>
            <Row label="Email">{order.customer_email}</Row>
            <Row label="Điện thoại">{order.customer_phone}</Row>
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitleStyle}>
              <MapPin size={16} /> Giao hàng
            </h2>
            <Row label="Địa chỉ">{address}</Row>
            <Row label="Hình thức">{order.shipping_method === 'express' ? 'Express' : 'Standard'}</Row>
            {order.estimated_delivery_from && (
              <Row label="Dự kiến">
                {new Date(order.estimated_delivery_from).toLocaleDateString('vi-VN')} –{' '}
                {new Date(order.estimated_delivery_to).toLocaleDateString('vi-VN')}
              </Row>
            )}
            {order.notes && <Row label="Ghi chú">{order.notes}</Row>}
          </section>

          <section style={cardStyle}>
            <h2 style={cardTitleStyle}>
              <CreditCard size={16} /> Thanh toán
            </h2>
            <Row label="Phương thức">{order.payment_method === 'vnpay' ? 'VNPay' : 'COD'}</Row>
            <Row label="Trạng thái">{PAYMENT_STATUSES[order.payment_status] || order.payment_status}</Row>
            {order.paid_at && <Row label="Thanh toán lúc">{formatDateTime(order.paid_at)}</Row>}
            {order.vnpay_txn_ref && <Row label="Mã giao dịch">{order.vnpay_transaction_no || order.vnpay_txn_ref}</Row>}
          </section>
        </div>
      </div>
    </main>
  );
}
