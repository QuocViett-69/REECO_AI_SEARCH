import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Eye, RefreshCw, Search } from 'lucide-react';
import {
  DEFAULT_PAGE_SIZE,
  ORDER_STATUSES,
  formatDateTime,
  formatVnd,
  listOrders,
} from '../../services/ordersApi';
import { StatusBadge } from './StatusBadge';

export const SEARCH_DEBOUNCE_MS = 300;

// Filters live in the URL (?search=&status=&page=) so F5 and the back button keep them.
export function OrderListView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'ALL';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateParams = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value === '' || value === 'ALL' || value === 1 || value == null) next.delete(key);
        else next.set(key, String(value));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Back/forward can change ?search= without typing
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce typing; a new search always starts from page 1.
  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = setTimeout(() => updateParams({ search: searchInput, page: 1 }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listOrders({ search, status, page, pageSize: DEFAULT_PAGE_SIZE });
      setOrders(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
  const firstRow = total === 0 ? 0 : (page - 1) * DEFAULT_PAGE_SIZE + 1;
  const lastRow = Math.min(total, page * DEFAULT_PAGE_SIZE);

  return (
    <main className="main-content">
      <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Đơn hàng</span>
        <button type="button" className="btn" onClick={load} disabled={loading} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Làm mới
        </button>
      </div>

      <div className="toolbar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="search"
            className="search-input"
            aria-label="Tìm đơn hàng"
            placeholder="Mã đơn, tên khách, email, SĐT..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ paddingLeft: 34, width: '100%' }}
          />
        </div>
        <select
          className="filter-select"
          aria-label="Lọc trạng thái"
          value={status}
          onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
        >
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUSES).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 14 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', minWidth: 900 }}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th style={{ textAlign: 'center' }}>Sản phẩm</th>
              <th style={{ textAlign: 'center' }}>Thanh toán</th>
              <th style={{ textAlign: 'right' }}>Tổng tiền</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                  Đang tải đơn hàng...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                  {error ? 'Không tải được đơn hàng.' : 'Không có đơn hàng phù hợp.'}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${encodeURIComponent(order.order_code)}`} style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {order.order_code}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{order.customer_email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{order.customer_phone}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{formatDateTime(order.created_at)}</td>
                  <td style={{ textAlign: 'center' }}>{order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)}</td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{order.payment_method === 'vnpay' ? 'VNPay' : 'COD'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{order.payment_status}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatVnd(order.total)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/orders/${encodeURIComponent(order.order_code)}`} className="btn" style={{ display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: 12, padding: '6px 10px' }}>
                      <Eye size={13} /> Xem
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-light)' }}>
        <span>
          {firstRow}–{lastRow} / {total} đơn
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn" aria-label="Trang trước" disabled={page <= 1 || loading} onClick={() => updateParams({ page: page - 1 })}>
            <ChevronLeft size={14} />
          </button>
          <span>
            Trang {page} / {totalPages}
          </span>
          <button type="button" className="btn" aria-label="Trang sau" disabled={page >= totalPages || loading} onClick={() => updateParams({ page: page + 1 })}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
