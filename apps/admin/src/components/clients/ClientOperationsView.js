import { useState, useEffect } from 'react';
import { AlertCircle, Users, RefreshCw, Search, ShoppingBag, DollarSign, Calendar, Mail, Phone } from 'lucide-react';
import { getAdminClientsApi } from '../../services/api';

export function ClientOperationsView() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await getAdminClientsApi();
      // call() resolves to { error, message } instead of throwing.
      if (res?.error) {
        setError(res.message || 'Không tải được danh sách khách hàng.');
        return;
      }
      setError(null);
      setClients(res);
    } catch (err) {
      setError(err?.message || 'Không tải được danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 ₫';
    return `${amount.toLocaleString('vi-VN')} ₫`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const filtered = clients.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  const totalClients = clients.length;
  const totalSpent = clients.reduce((acc, c) => acc + (c.total_spent || 0), 0);
  const activeOrders = clients.reduce((acc, c) => acc + (c.active_orders_count || 0), 0);

  return (
    <main className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Client Operations Center
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-light)', fontSize: 14 }}>
            Tổng quan khách hàng giao dịch thực tế, số lượng đơn đặt và tổng giá trị mua hàng (Order-Derived Client Data).
          </p>
        </div>
        <button
          type="button"
          onClick={loadClients}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            color: '#334155',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> làm mới
        </button>
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 14 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Tổng số khách hàng</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
            {totalClients}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Ghi nhận từ giao dịch đơn hàng</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Tổng giá trị mua hàng</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1.2 }}>
            {formatCurrency(totalSpent)}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Doanh số từ khách hàng</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Đơn hàng đang xử lý</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0284c7', margin: '8px 0 4px', lineHeight: 1 }}>
            {activeOrders}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Đơn hàng cần phục vụ</div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Tìm tên khách hàng, email, sđt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
        </div>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          Role authorization: <strong>client</strong>
        </span>
      </div>

      {/* Table */}
      <div className="table-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="products-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '25%', textAlign: 'left', padding: '14px 16px' }}>Khách Hàng (Client)</th>
              <th style={{ width: '25%', textAlign: 'left', padding: '14px 16px' }}>Email / Số điện thoại</th>
              <th style={{ width: '12%', textAlign: 'center', padding: '14px 16px' }}>Tổng số đơn</th>
              <th style={{ width: '18%', textAlign: 'right', padding: '14px 16px' }}>Tổng chi tiêu</th>
              <th style={{ width: '10%', textAlign: 'center', padding: '14px 16px' }}>Đơn active</th>
              <th style={{ width: '10%', textAlign: 'right', padding: '14px 16px' }}>Đơn mới nhất</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                  <RefreshCw size={18} className="spin" style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
                  Đang tổng hợp dữ liệu khách hàng từ đơn hàng...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                  Không tìm thấy thông tin khách hàng nào.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.email}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                      {c.name}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, color: '#0f172a' }}>{c.email}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{c.phone}</div>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                    {c.orders_count}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                    {formatCurrency(c.total_spent)}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        background: c.active_orders_count > 0 ? '#e0f2fe' : '#f1f5f9',
                        color: c.active_orders_count > 0 ? '#0284c7' : '#64748b',
                      }}
                    >
                      {c.active_orders_count}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                    {formatDate(c.last_order_date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
