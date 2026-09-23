import React, { useState, useMemo } from 'react';
import { Eye, Search, RefreshCw, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductManagementView({ products, isLoading, error, onViewDetail, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dynamic filters from API data
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
  }, [products]);

  const subcategories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .filter((p) => !selectedCategory || p.category === selectedCategory)
          .map((p) => p.subcategory)
          .filter(Boolean)
      )
    ).sort();
  }, [products, selectedCategory]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchModel = p.model.toLowerCase().includes(q);
        const matchName = p.name.toLowerCase().includes(q);
        if (!matchModel && !matchName) return false;
      }
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSubcategory && p.subcategory !== selectedSubcategory) return false;
      if (selectedStatus && p.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      return true;
    });
  }, [products, searchTerm, selectedCategory, selectedSubcategory, selectedStatus]);

  // Reset to page 1 when filter or search changes
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setSelectedSubcategory('');
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (val) => {
    setSelectedSubcategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Calculate paginated slice
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  
  const startIndex = (pageIndex - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  if (isLoading) {
    return (
      <div className="main-content">
        <div className="page-title">Products</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0', color: 'var(--text-light)' }}>
          <Loader size={22} className="spin" />
          Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="page-title">Products</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0', color: 'var(--danger, red)' }}>
          <AlertCircle size={22} />
          {error}
          <button type="button" className="btn" onClick={onRefresh} style={{ marginLeft: 12 }}>
            <RefreshCw size={14} /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Products ({totalItems})</span>
        <button type="button" className="btn" onClick={onRefresh} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="toolbar">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="search-input"
            style={{ width: '100%', paddingLeft: '40px' }}
            placeholder="Search model or product name..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
            }}
          />
        </div>

        <div className="filters">
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="filter-select"
            value={selectedSubcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Review">Review</option>
          </select>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '45%' }}>Product</th>
            <th style={{ width: '18%' }}>Model</th>
            <th style={{ width: '17%' }}>Category</th>
            <th style={{ width: '10%' }}>Status</th>
            <th style={{ width: '10%', textAlign: 'right', paddingRight: '20px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                No products match your search or filters.
              </td>
            </tr>
          ) : (
            currentItems.map((p) => (
              <tr key={p.model}>
                <td>
                  <div className="product-info" style={{ display: 'flex', alignItems: 'center', gap: '15px', overflow: 'hidden' }}>
                    <div
                      className="product-img"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'var(--text-main)',
                        flexShrink: 0,
                      }}
                    >
                      {p.model.slice(0, 3)}
                    </div>
                    <span
                      title={p.name}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {p.name}
                    </span>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{p.model}</td>
                <td>{p.category}</td>
                <td>
                  <span
                    className={`status-badge ${
                      p.status === 'Active' ? 'status-active' : 'status-draft'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '8px 18px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => onViewDetail(p.model)}
                  >
                    <Eye size={15} /> View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ─── Pagination Bar ─────────────────────────────────────────────────── */}
      {totalItems > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '20px',
            padding: '16px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius)',
            fontSize: '14px',
            color: 'var(--text-main)',
          }}
        >
          {/* Info & Page Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-light)' }}>
              Hiển thị <strong>{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</strong> trên <strong>{totalItems}</strong> sản phẩm
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '13px' }}>Số dòng / trang:</span>
              <select
                className="filter-select"
                style={{ padding: '6px 12px', minWidth: 'auto', fontSize: '13px' }}
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              disabled={pageIndex <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                opacity: pageIndex <= 1 ? 0.5 : 1,
                cursor: pageIndex <= 1 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={16} /> Trang trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                className="btn"
                onClick={() => setCurrentPage(pNum)}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: pNum === pageIndex ? 700 : 500,
                  backgroundColor: pNum === pageIndex ? 'var(--primary)' : 'var(--bg-gray)',
                  color: 'var(--text-main)',
                }}
              >
                {pNum}
              </button>
            ))}

            <button
              type="button"
              className="btn"
              disabled={pageIndex >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                opacity: pageIndex >= totalPages ? 0.5 : 1,
                cursor: pageIndex >= totalPages ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Trang sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
