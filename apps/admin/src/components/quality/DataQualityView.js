import React, { useState, useEffect } from 'react';
import { AlertCircle, Database, AlertTriangle, CheckCircle, ShieldAlert, Eye, RefreshCw, FileText, Image, DollarSign, Sliders, Activity } from 'lucide-react';
import { getAdminQualityApi } from '../../services/api';

export function DataQualityView({ onSelectProduct }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterMissing, setFilterMissing] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminQualityApi();
      // call() resolves to { error, message } instead of throwing.
      if (res?.error) {
        setError(res.message || 'Lỗi khi tải dữ liệu Data Quality Center.');
        return;
      }
      setStats(res.stats);
      setProducts(res.products);
    } catch (err) {
      setError(err?.message || 'Lỗi khi tải dữ liệu Data Quality Center.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (filterMissing === 'ALL') return true;
    if (filterMissing === 'REVIEW') return p.needs_review;
    if (filterMissing === 'VI_NAME') return p.missing_fields.includes('Missing VI Name');
    if (filterMissing === 'PRICE') return p.missing_fields.includes('Missing Price');
    if (filterMissing === 'IMAGE') return p.missing_fields.includes('Missing Image');
    if (filterMissing === 'SPECS') return p.missing_fields.includes('Missing Structured Specs');
    return true;
  });

  return (
    <main className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            Catalog Data Quality Center
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-light)', fontSize: 14 }}>
            Giám sát chất lượng dữ liệu sản phẩm, phát hiện thông tin thiếu sót và kiểm tra sức khỏe chỉ mục tìm kiếm AI.
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
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Kiểm tra chất lượng
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
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Cần duyệt / Thiếu sót</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: stats.needsReview > 0 ? '#d97706' : '#059669', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.needsReview}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Trên tổng số {stats.totalProducts} sản phẩm</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Chưa có tên Tiếng Việt</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: stats.missingViName > 0 ? '#ef4444' : '#059669', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.missingViName}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Thiếu tên tiếng Việt hiển thị</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Chưa cập nhật giá (VND)</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: stats.missingPrice > 0 ? '#dc2626' : '#059669', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.missingPrice}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Hiển thị "Price unavailable"</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Chưa có ảnh sản phẩm</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: stats.missingImage > 0 ? '#d97706' : '#059669', margin: '8px 0 4px', lineHeight: 1 }}>
              {stats.missingImage}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Không có ảnh trong product_media</div>
          </div>
        </div>
      )}

      {/* Search & AI Health Section (Read-only Display) */}
      {stats?.searchIndexHealth && (
      <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#0284c7" /> Trạng thái đồng bộ Tìm kiếm AI & Embeddings (Search Health)
          </h3>
          {stats.searchIndexHealth.status === 'healthy' ? (
            <span style={{ fontSize: 12, padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: 12, fontWeight: 600 }}>
              Sync Health: Healthy
            </span>
          ) : (
            <span style={{ fontSize: 12, padding: '4px 10px', background: '#fffbeb', color: '#d97706', borderRadius: 12, fontWeight: 600 }}>
              Sync Health: Cần đồng bộ
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, fontSize: 13 }}>
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>Search documents không đồng bộ:</span>
            <strong style={{ marginLeft: 8, color: stats.searchIndexHealth.staleSearchDocument > 0 ? '#d97706' : '#0f172a' }}>{stats.searchIndexHealth.staleSearchDocument} tài liệu</strong>
          </div>
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>Embeddings chưa được backfill:</span>
            <strong style={{ marginLeft: 8, color: stats.searchIndexHealth.staleEmbedding > 0 ? '#d97706' : '#0f172a' }}>{stats.searchIndexHealth.staleEmbedding} vector</strong>
          </div>
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>Làm giàu ngữ nghĩa (Enrichment):</span>
            {stats.searchIndexHealth.missingSemanticEnrichment === 0 ? (
              <strong style={{ marginLeft: 8, color: '#059669' }}>Hoàn tất</strong>
            ) : (
              <strong style={{ marginLeft: 8, color: '#d97706' }}>Thiếu {stats.searchIndexHealth.missingSemanticEnrichment} sản phẩm</strong>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Filters Bar */}
      <div style={{ background: '#fff', padding: '14px 20px', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginRight: 6 }}>Lọc sự cố:</span>
        {[
          { key: 'ALL', label: 'Tất cả sản phẩm' },
          { key: 'REVIEW', label: 'Cần xem xét / Có lỗi' },
          { key: 'VI_NAME', label: 'Thiếu tên VI' },
          { key: 'PRICE', label: 'Thiếu thương mại / Giá' },
          { key: 'IMAGE', label: 'Thiếu ảnh' },
          { key: 'SPECS', label: 'Thiếu thông số' },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={() => setFilterMissing(btn.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              fontSize: 12,
              fontWeight: filterMissing === btn.key ? 600 : 500,
              cursor: 'pointer',
              background: filterMissing === btn.key ? 'var(--primary)' : '#f1f5f9',
              color: filterMissing === btn.key ? '#1e293b' : '#475569',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Data Quality Table */}
      <div className="table-container" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="products-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '30%', textAlign: 'left', padding: '14px 16px' }}>Sản phẩm</th>
              <th style={{ width: '15%', textAlign: 'left', padding: '14px 16px' }}>Model</th>
              <th style={{ width: '15%', textAlign: 'left', padding: '14px 16px' }}>Danh mục</th>
              <th style={{ width: '25%', textAlign: 'left', padding: '14px 16px' }}>Các trường thông tin thiếu</th>
              <th style={{ width: '10%', textAlign: 'center', padding: '14px 16px' }}>Chất lượng</th>
              <th style={{ width: '10%', textAlign: 'right', padding: '14px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                  <RefreshCw size={18} className="spin" style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
                  Đang phân tích chất lượng dữ liệu catalog...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                  Tất cả sản phẩm đã đạt chuẩn chất lượng dữ liệu!
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const scoreColor = p.data_quality_score >= 80 ? '#059669' : p.data_quality_score >= 60 ? '#d97706' : '#dc2626';

                return (
                  <tr key={p.product_id || p.model}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {p.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#334155' }}>
                      {p.model}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                      {p.category || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.missing_fields.length === 0 ? (
                        <span style={{ fontSize: 12, color: '#059669', fontWeight: 500 }}>✓ Đầy đủ</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {p.missing_fields.map((f) => (
                            <span key={f} style={{ fontSize: 11, padding: '2px 6px', background: '#fee2e2', color: '#dc2626', borderRadius: 4, fontWeight: 500 }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: scoreColor }}>
                        {p.data_quality_score}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(p.model)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          color: '#1e293b',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} /> Review
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
