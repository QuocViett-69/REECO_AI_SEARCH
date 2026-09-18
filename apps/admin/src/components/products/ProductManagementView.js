import React, { useState } from 'react';
import { Eye, Search, RefreshCw, Loader, AlertCircle } from 'lucide-react';

export function ProductManagementView({ products, isLoading, error, onViewDetail, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Dynamic filters from API data
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
  const subcategories = Array.from(
    new Set(products.filter((p) => !selectedCategory || p.category === selectedCategory).map((p) => p.subcategory).filter(Boolean))
  ).sort();

  const filtered = products.filter((p) => {
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
        <span>Products ({products.length})</span>
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
            onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="filter-select"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
            <th>Product</th>
            <th>Model</th>
            <th>Category</th>
            <th>Status</th>
            <th style={{ textAlign: 'right', paddingRight: '30px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                No products match your search or filters.
              </td>
            </tr>
          ) : (
            filtered.map((p) => (
              <tr key={p.model}>
                <td>
                  <div className="product-info">
                    <div
                      className="product-img"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'var(--text-main)',
                      }}
                    >
                      {p.model.slice(0, 3)}
                    </div>
                    <span>{p.name}</span>
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
    </div>
  );
}
