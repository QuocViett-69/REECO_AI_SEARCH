import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  adminOrderService,
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
} from '../../services/adminOrderService';

export function OrderManagementView() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusTab, setStatusTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderRes, statsRes] = await Promise.all([
        adminOrderService.getOrders({
          search: searchQuery,
          status: statusTab,
          limit: 100,
        }),
        adminOrderService.getOrderStats(),
      ]);
      setOrders(orderRes?.items || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredOrders = orders;

  const handleOpenDetail = async (order) => {
    setActionError(null);
    setSelectedOrder(order);
    setIsModalOpen(true);
    try {
      const freshOrder = await adminOrderService.getOrderById(
        order.id || order.order_id || order.order_code
      );
      if (freshOrder) setSelectedOrder(freshOrder);
    } catch (err) {
      console.warn('Could not fetch fresh order detail:', err);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder || updatingStatus) return;
    setActionError(null);
    setUpdatingStatus(true);

    try {
      const targetId = selectedOrder.id || selectedOrder.order_id || selectedOrder.order_code;
      const updated = await adminOrderService.updateOrderStatus(
        targetId,
        newStatus,
        `Cập nhật bởi Quản trị viên lúc ${new Date().toLocaleTimeString('vi-VN')}`
      );
      setSelectedOrder({ ...updated });
      await loadData();
      showNotification(
        `Đã chuyển trạng thái đơn #${selectedOrder.order_id || selectedOrder.order_code} sang "${ORDER_STATUSES[newStatus]?.label || newStatus}"!`
      );
    } catch (err) {
      setActionError(err.message || 'Lỗi khi cập nhật trạng thái đơn.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    if (typeof amount !== 'number') return '—';
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

  const allowedTransitions = selectedOrder ? (ORDER_STATUS_TRANSITIONS[selectedOrder.status] || []) : [];

  return (
    <main className="main-content">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <CheckCircle size={18} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Quản lý Đơn Hàng & Thanh Toán
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-light)', fontSize: 14 }}>
            Theo dõi, xác nhận thanh toán VNPay/COD và điều phối vận chuyển đơn hàng.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
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
          <RefreshCw size={15} /> Làm Mới Dữ Liệu
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 10,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
              Tổng đơn hàng
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.totalOrders}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Toàn bộ đơn đặt trong kỳ
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 10,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
              Doanh thu thực thu
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1.2 }}>
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Từ {stats.paidOrdersCount} đơn thanh toán thành công
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 10,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
              Đang xử lý tại kho
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.processingCount}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Đang chuẩn bị đóng gói & xuất hàng
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 10,
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
              Đang vận chuyển
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.shippedCount}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Đơn hàng đang trên đường giao
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Status Filter Tabs & Search */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid var(--border-color)',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-gray)', padding: 4, borderRadius: 8, gap: 4, flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
            { key: 'PROCESSING', label: 'Đang xử lý' },
            { key: 'SHIPPED', label: 'Đang giao' },
            { key: 'DELIVERED', label: 'Đã giao' },
            { key: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: statusTab === tab.key ? 600 : 500,
                cursor: 'pointer',
                background: statusTab === tab.key ? '#ffffff' : 'transparent',
                color: statusTab === tab.key ? 'var(--text-main)' : 'var(--text-light)',
                boxShadow: statusTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách, TxnRef..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="products-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '14%', textAlign: 'left', padding: '14px 16px' }}>Mã Đơn Hàng</th>
              <th style={{ width: '22%', textAlign: 'left', padding: '14px 16px' }}>Khách Hàng</th>
              <th style={{ width: '16%', textAlign: 'left', padding: '14px 16px' }}>Ngày Đặt</th>
              <th style={{ width: '16%', textAlign: 'center', padding: '14px 16px' }}>Phương thức</th>
              <th style={{ width: '12%', textAlign: 'right', padding: '14px 16px' }}>Tổng tiền</th>
              <th style={{ width: '16%', textAlign: 'center', padding: '14px 16px' }}>Trạng thái</th>
              <th style={{ width: '10%', textAlign: 'right', padding: '14px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-light)' }}>
                  <RefreshCw size={20} className="spin" style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
                  Đang tải danh sách đơn hàng từ máy chủ...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-light)' }}>
                  Không tìm thấy đơn hàng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const statusMeta = ORDER_STATUSES[o.status] || { label: o.status, color: '#64748b', bg: '#f1f5f9' };
                const isVNPay = o.payment_method === 'vnpay' || o.payment_provider === 'VNPAY_SANDBOX';

                return (
                  <tr key={o.order_id || o.id}>
                    {/* Order ID */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 14 }}>
                        #{o.order_id || o.order_code}
                      </span>
                      {o.vnpay_txn_ref && (
                        <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: 'monospace' }}>
                          Ref: {o.vnpay_txn_ref}
                        </div>
                      )}
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13 }}>
                        {o.customer_name || 'Khách hàng'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {o.customer_email}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-light)' }}>
                      {formatDate(o.created_at)}
                    </td>

                    {/* Payment Method */}
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
                        {isVNPay ? 'VNPay' : 'COD'}
                      </span>
                    </td>

                    {/* Total */}
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
                      {formatCurrency(o.total, o.currency)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: statusMeta.bg,
                          color: statusMeta.color,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(o)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border-color)',
                          background: '#fff',
                          color: 'var(--text-main)',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} /> Xem
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Order Detail Modal ────────────────────────────────────────────────── */}
      {isModalOpen && selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: 720,
              maxWidth: '100%',
              maxHeight: '90vh',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafafa',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
                  Chi Tiết Đơn Hàng #{selectedOrder.order_id || selectedOrder.order_code}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                  Ngày tạo: {formatDate(selectedOrder.created_at)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              {actionError && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    color: '#991b1b',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Status & Action Workflow Banner */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  background: 'rgba(249, 201, 8, 0.08)',
                  border: '1px solid rgba(249, 201, 8, 0.25)',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500 }}>TRẠNG THÁI HIỆN TẠI</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: ORDER_STATUSES[selectedOrder.status]?.color || '#0f172a' }}>
                    {ORDER_STATUSES[selectedOrder.status]?.label || selectedOrder.status}
                  </div>
                </div>

                {/* Workflow Transition Buttons */}
                {allowedTransitions.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500 }}>Chuyển sang:</span>
                    {allowedTransitions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        onClick={() => handleUpdateStatus(nextStatus)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: 'none',
                          background: nextStatus === 'CANCELLED' ? '#ef4444' : 'var(--primary)',
                          color: nextStatus === 'CANCELLED' ? '#fff' : '#1e293b',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {ORDER_STATUSES[nextStatus]?.label || nextStatus}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer & Shipping Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: 13, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px' }}>
                    Thông tin Khách Hàng
                  </h4>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                    {selectedOrder.customer_name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 2 }}>
                    Email: {selectedOrder.customer_email}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                    SĐT: {selectedOrder.customer_phone || '—'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: 13, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px' }}>
                    Giao Hàng & Thanh Toán
                  </h4>
                  <div style={{ fontSize: 13, color: 'var(--text-main)', display: 'flex', gap: 6, marginBottom: 4 }}>
                    <MapPin size={14} color="var(--text-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{selectedOrder.shipping_address}, {selectedOrder.city}, {selectedOrder.country}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>
                    Hình thức: <strong>{selectedOrder.shipping_method === 'express' ? 'Express Air Freight ($30)' : 'Standard Delivery ($10)'}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>
                    Thanh toán: <strong>{selectedOrder.payment_method === 'vnpay' ? 'VNPay Sandbox' : 'COD (Tiền mặt)'}</strong>
                    {selectedOrder.vnpay_txn_ref && ` (Mã: ${selectedOrder.vnpay_txn_ref})`}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                  Danh Sách Sản Phẩm Đã Mua ({(selectedOrder.items || []).length})
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px' }}>Sản phẩm</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Đơn giá</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Số lượng</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.model}
                                  style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                />
                              )}
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.model}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{item.product_name}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-light)' }}>
                            {formatCurrency(item.unit_price, selectedOrder.currency)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                            {formatCurrency(item.line_total || item.unit_price * item.quantity, selectedOrder.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & Total */}
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontSize: 13 }}>
                  <div>Tiền hàng: <strong>{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</strong></div>
                  <div>Phí vận chuyển: <strong>{formatCurrency(selectedOrder.shipping_fee, selectedOrder.currency)}</strong></div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                    Tổng cộng: {formatCurrency(selectedOrder.total, selectedOrder.currency)}
                  </div>
                </div>
              </div>

              {/* Status History Timeline */}
              {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                    Lịch Sử Chuyển Trạng Thái Đơn Hàng
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 12, borderLeft: '2px solid #e2e8f0' }}>
                    {selectedOrder.status_history.map((hist, idx) => (
                      <div key={idx} style={{ position: 'relative', fontSize: 13 }}>
                        <div
                          style={{
                            position: 'absolute',
                            left: -18,
                            top: 4,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: ORDER_STATUSES[hist.status]?.color || '#94a3b8',
                          }}
                        />
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {ORDER_STATUSES[hist.status]?.label || hist.status}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                          {formatDate(hist.timestamp)} • Bởi: {hist.changed_by}
                          {hist.note && ` — Ghi chú: ${hist.note}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#fafafa',
              }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
