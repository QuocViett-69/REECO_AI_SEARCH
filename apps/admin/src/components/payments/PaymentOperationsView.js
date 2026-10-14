import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, CreditCard, RefreshCw, Search, Filter, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { getAdminPaymentsApi } from '../../services/api';

const PAGE_SIZE = 20;

export function PaymentOperationsView() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  // '' = no filter; values match the API enums (cod | vnpay, PaymentStatus).
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Responses can arrive out of order (e.g. an older filter after a newer one); only the latest request wins.
  const latestRequest = useRef(0);

  const loadPayments = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const res = await getAdminPaymentsApi({
        method: methodFilter,
        status: statusFilter,
        search: searchQuery.trim(),
        page,
        page_size: PAGE_SIZE,
      });
      if (requestId !== latestRequest.current) return;
      // call() resolves to { error, message } instead of throwing.
      if (res?.error) {
        setError(res.message || 'Không tải được giao dịch thanh toán.');
        return;
      }
      setError(null);
      setPayments(res.items);
      setTotal(res.total);
      setStats(res.stats);
    } catch (err) {
      if (requestId === latestRequest.current) setError(err?.message || 'Không tải được giao dịch thanh toán.');
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [methodFilter, statusFilter, searchQuery, page]);

  // Any filter change starts again from page 1.
  useEffect(() => {
    setPage(1);
  }, [methodFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadPayments]);

  const formatCurrency = (amount, currency = 'VND') => {
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <main className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Quản lý Giao Dịch Thanh Toán (Payments Center)
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-light)', fontSize: 14 }}>
            Theo dõi tính xác thực giao dịch qua cổng VNPay & thu hộ COD từ nhà vận chuyển.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPayments}
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
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Làm mới danh sách
        </button>
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 14 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Tổng số giao dịch</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.totalPayments}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Ghi nhận từ khách hàng</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Cổng VNPay</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#0066b3', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.vnpayCount}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Xác thực chữ ký checksum</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Thanh toán COD</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#475569', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.codCount}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Chuyển PAID khi giao xong</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Thất bại / Hủy</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#dc2626', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.failedCount}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Giao dịch không thành công</div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        {/* Method Filter */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 8, gap: 4 }}>
          {[
            { key: '', label: 'Tất cả kênh' },
            { key: 'vnpay', label: 'Cổng VNPay' },
            { key: 'cod', label: 'Thanh toán COD' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMethodFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: methodFilter === tab.key ? 600 : 500,
                cursor: 'pointer',
                background: methodFilter === tab.key ? '#ffffff' : 'transparent',
                color: methodFilter === tab.key ? '#0f172a' : '#64748b',
                boxShadow: methodFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, TxnRef..."
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              background: '#fff',
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PAID">Đã thanh toán (PAID)</option>
            <option value="PENDING_PAYMENT">Chờ thanh toán VNPay (PENDING_PAYMENT)</option>
            <option value="COD_PENDING">Chờ thu COD (COD_PENDING)</option>
            <option value="FAILED">Thất bại (FAILED)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="products-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '16%', textAlign: 'left', padding: '14px 16px' }}>Mã Đơn Hàng</th>
              <th style={{ width: '22%', textAlign: 'left', padding: '14px 16px' }}>Khách Hàng</th>
              <th style={{ width: '15%', textAlign: 'center', padding: '14px 16px' }}>Phương thức</th>
              <th style={{ width: '20%', textAlign: 'left', padding: '14px 16px' }}>VNPay Ref / Txn No</th>
              <th style={{ width: '15%', textAlign: 'right', padding: '14px 16px' }}>Số tiền</th>
              <th style={{ width: '12%', textAlign: 'center', padding: '14px 16px' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                  <RefreshCw size={18} className="spin" style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
                  Đang tải nhật ký giao dịch thanh toán...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                  Không có giao dịch thanh toán nào phù hợp.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const isVNPay = p.payment_method === 'vnpay';
                const isPaid = p.payment_status === 'PAID';

                return (
                  <tr key={p.id}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                        #{p.order_code || p.order_number}
                      </span>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {formatDate(p.created_at)}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                        {p.customer_name || 'Khách hàng'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {p.customer_email}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: isVNPay ? 'rgba(0, 102, 179, 0.08)' : '#f1f5f9',
                          color: isVNPay ? '#0066b3' : '#475569',
                        }}
                      >
                        {isVNPay ? 'VNPay Sandbox' : 'COD (Thu hộ)'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12 }}>
                      {p.vnpay_txn_ref ? (
                        <>
                          <div style={{ color: '#0f172a' }}>Ref: {p.vnpay_txn_ref}</div>
                          {p.vnpay_transaction_no && <div style={{ color: '#64748b' }}>No: {p.vnpay_transaction_no}</div>}
                        </>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                      {formatCurrency(p.total, p.currency)}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: isPaid ? '#d1fae5' : p.payment_status === 'FAILED' ? '#fecaca' : '#fef3c7',
                          color: isPaid ? '#059669' : p.payment_status === 'FAILED' ? '#dc2626' : '#d97706',
                        }}
                      >
                        {isPaid ? 'Thành công' : p.payment_status === 'FAILED' ? 'Thất bại' : 'Chờ xử lý'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-light)' }}>
        <span>
          {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(total, page * PAGE_SIZE)} / {total} giao dịch
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn" aria-label="Trang trước" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={14} />
          </button>
          <span>
            Trang {page} / {totalPages}
          </span>
          <button type="button" className="btn" aria-label="Trang sau" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
