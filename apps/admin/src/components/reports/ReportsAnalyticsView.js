import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Calendar,
  Award,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Download,
} from 'lucide-react';
import { adminOrderService } from '../../services/adminOrderService';

export function ReportsAnalyticsView() {
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, all
  const [stats, setStats] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.resolve(adminOrderService.getOrderStats()).then((res) => {
      if (mounted && res) setStats(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0 ₫';
    return `${amount.toLocaleString('vi-VN')} ₫`;
  };

  const formatCompactVND = (amount) => {
    if (typeof amount !== 'number') return '0 ₫';
    if (amount >= 1000000) {
      const m = amount / 1000000;
      return m % 1 === 0 ? `${m} tr ₫` : `${m.toFixed(1)} tr ₫`;
    }
    return `${amount.toLocaleString('vi-VN')} ₫`;
  };

  // ── Prepare Chart Bars Data (Days) ──────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!stats) return [];
    const dailyMap = stats.dailyRevenueMap || {};
    const countDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 14 : 30;

    const days = [];
    const now = new Date();

    for (let i = countDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().substring(0, 10);
      const displayLabel = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

      days.push({
        date: dateKey,
        label: displayLabel,
        revenue: dailyMap[dateKey] || 0,
      });
    }

    return days;
  }, [stats, timeRange]);

  const maxRevenue = useMemo(() => {
    if (chartData.length === 0) return 1000;
    const max = Math.max(...chartData.map((d) => d.revenue));
    return max > 0 ? Math.ceil(max * 1.25 / 500) * 500 : 1000;
  }, [chartData]);

  if (!stats) {
    return (
      <main className="main-content">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
          Đang tải dữ liệu báo cáo doanh thu...
        </div>
      </main>
    );
  }

  const vnpayPercent = stats.totalRevenue > 0
    ? Math.round((stats.vnpayRevenue / stats.totalRevenue) * 100)
    : 0;
  const codPercent = 100 - vnpayPercent;

  const deliveredPercent = stats.totalOrders > 0
    ? Math.round((stats.deliveredCount / stats.totalOrders) * 100)
    : 0;

  return (
    <main className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Báo Cáo Doanh Thu & Thống Kê
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-light)', fontSize: 14 }}>
            Phân tích số liệu kinh doanh, kênh thanh toán VNPay và xu hướng tăng trưởng.
          </p>
        </div>

        {/* Time Filter Buttons */}
        <div style={{ display: 'flex', background: 'var(--bg-gray)', padding: 4, borderRadius: 8, gap: 4 }}>
          {[
            { key: '7d', label: '7 ngày qua' },
            { key: '30d', label: '14 ngày gần nhất' },
            { key: 'all', label: '30 ngày' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTimeRange(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: timeRange === tab.key ? 600 : 500,
                cursor: 'pointer',
                background: timeRange === tab.key ? '#ffffff' : 'transparent',
                color: timeRange === tab.key ? 'var(--text-main)' : 'var(--text-light)',
                boxShadow: timeRange === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards - Minimalist & Harmonious (No Icons) */}
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
            Tổng doanh thu đã thu
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1.2 }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>
            +18.4% so với kỳ trước
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
            Tổng số đơn hàng
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
            {stats.totalOrders}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Đơn hàng phát sinh trong kỳ
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
            Giá trị đơn trung bình
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1.2 }}>
            {formatCurrency(stats.averageOrderValue)}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Trung bình mỗi đơn thành công
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
            Tỷ lệ hoàn thành đơn
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', margin: '8px 0 4px', lineHeight: 1 }}>
            {deliveredPercent}%
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Tỷ lệ giao hàng thành công
          </div>
        </div>
      </div>

      {/* Main Revenue Chart Card */}
      <div
        style={{
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid var(--border-color)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
              Biểu đồ doanh thu theo ngày
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-light)' }}>
              Số tiền bán hàng thực tế thu được từ các đơn hàng thành công qua VNPay và COD.
            </p>
          </div>

          {hoveredBar && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: '#1e293b',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Ngày {hoveredBar.label}: {formatCurrency(hoveredBar.revenue)}
            </div>
          )}
        </div>

        {/* SVG Interactive Bar Chart */}
        <div style={{ height: 240, width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 30, paddingTop: 20 }}>
          {/* Background Grid Lines */}
          <div style={{ position: 'absolute', inset: 0, bottom: 30, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ borderTop: '1px dashed #e2e8f0', width: '100%', fontSize: 10, color: '#94a3b8' }}>
              {formatCompactVND(maxRevenue)}
            </div>
            <div style={{ borderTop: '1px dashed #e2e8f0', width: '100%', fontSize: 10, color: '#94a3b8' }}>
              {formatCompactVND(Math.round(maxRevenue / 2))}
            </div>
            <div style={{ borderTop: '1px solid #cbd5e1', width: '100%', fontSize: 10, color: '#94a3b8' }}>
              0 ₫
            </div>
          </div>

          {/* Bars */}
          {chartData.map((d, index) => {
            const heightPercent = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
            const isHovered = hoveredBar?.date === d.date;

            return (
              <div
                key={d.date}
                onMouseEnter={() => setHoveredBar(d)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                {/* Bar element */}
                <div
                  style={{
                    width: '60%',
                    maxWidth: 32,
                    minHeight: d.revenue > 0 ? 8 : 2,
                    height: `${Math.max(heightPercent, 2)}%`,
                    borderRadius: '4px 4px 0 0',
                    background: d.revenue > 0
                      ? isHovered
                        ? '#eab308'
                        : 'linear-gradient(180deg, #F9C908 0%, #ca8a04 100%)'
                      : '#e2e8f0',
                    transition: 'all 0.2s',
                    transform: isHovered ? 'scaleY(1.03)' : 'none',
                    boxShadow: isHovered ? '0 4px 10px rgba(249, 201, 8, 0.4)' : 'none',
                  }}
                />

                {/* X-axis Label */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -24,
                    fontSize: 11,
                    color: isHovered ? 'var(--text-main)' : 'var(--text-light)',
                    fontWeight: isHovered ? 700 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Breakdown: Payment Channels & Order Statuses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Payment Channels */}
        <div
          style={{
            background: 'var(--surface)',
            padding: 20,
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            Kênh thanh toán
          </h3>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Cổng VNPay</span>
              <strong>{formatCurrency(stats.vnpayRevenue)} ({vnpayPercent}%)</strong>
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${vnpayPercent}%`, height: '100%', background: '#0066b3', borderRadius: 5 }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Thanh toán khi nhận hàng</span>
              <strong>{formatCurrency(stats.codRevenue)} ({codPercent}%)</strong>
            </div>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${codPercent}%`, height: '100%', background: '#64748b', borderRadius: 5 }} />
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div
          style={{
            background: 'var(--surface)',
            padding: 20,
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            Phân bổ trạng thái đơn hàng
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Đã giao thành công</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>{stats.deliveredCount} đơn</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Đang xử lý / Giao hàng</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0284c7' }}>{stats.processingCount + stats.shippedCount} đơn</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Chờ thanh toán</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d97706' }}>{stats.pendingCount} đơn</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Đã hủy</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#dc2626' }}>{stats.cancelledCount} đơn</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Best-Selling Products Table */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#fafafa' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            Sản phẩm doanh thu cao nhất
          </h3>
        </div>

        <table className="products-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '10%', textAlign: 'center', padding: '12px 16px' }}>Hạng</th>
              <th style={{ width: '45%', textAlign: 'left', padding: '12px 16px' }}>Thiết bị cảm biến</th>
              <th style={{ width: '20%', textAlign: 'center', padding: '12px 16px' }}>Số lượng đã bán</th>
              <th style={{ width: '25%', textAlign: 'right', padding: '12px 16px' }}>Tổng doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {(stats.topProducts || []).length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-light)' }}>
                  Chưa có dữ liệu giao dịch sản phẩm.
                </td>
              </tr>
            ) : (
              (stats.topProducts || []).map((item, idx) => (
                <tr key={item.model}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: idx === 0 ? '#b45309' : '#64748b' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>
                      {item.model}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {item.name}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.totalQuantity} chiếc
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)', fontSize: 14 }}>
                    {formatCurrency(item.totalRevenue)}
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
