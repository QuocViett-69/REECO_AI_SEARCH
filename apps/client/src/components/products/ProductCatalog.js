import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, GitCompare, Check, SearchX, Loader, Tag } from 'lucide-react';
import { getProductsApi } from '../../services/api';
import { FavoriteButton } from '../commerce/FavoriteButton';
import { AddToCartButton } from '../commerce/AddToCartButton';

export function ProductCatalog({ onViewDetail, onToggleCompare, isInCompare }) {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isFading, setIsFading] = useState(false);
  const filterTimeout = useRef(null);

  // Gọi hàm này mỗi khi filter thay đổi để tạo hiệu ứng fade mượt
  const applyFilter = useCallback((fn) => {
    setIsFading(true);
    if (filterTimeout.current) clearTimeout(filterTimeout.current);
    filterTimeout.current = setTimeout(() => {
      fn();
      setIsFading(false);
    }, 150);
  }, []);


  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProductsApi({ limit: 100 });
      if (result && result.items) {
        setAllProducts(result.items);
      } else {
        setError('Không thể tải danh sách sản phẩm từ server.');
      }
    } catch (e) {
      setError('Lỗi kết nối đến API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Dynamic categories & subcategories from API data
  const categories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  ).sort();

  const subcategories = Array.from(
    new Set(
      allProducts
        .filter((p) => !category || p.category === category)
        .map((p) => p.subcategory)
        .filter(Boolean)
    )
  ).sort();

  const filtered = allProducts.filter((p) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchModel = p.model.toLowerCase().includes(term);
      const matchName = (p.name || '').toLowerCase().includes(term);
      if (!matchModel && !matchName) return false;
    }
    if (category && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });

  return (
    <section className="page active" id="page-products">
      <div className="page-head">
        <h1>Products</h1>
        <p>
          Explore all <strong>{allProducts.length}</strong> Campbell Scientific products
          {filtered.length !== allProducts.length && ` (Showing ${filtered.length})`}.
        </p>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by model or product name..."
            value={searchTerm}
            onChange={(e) => {
              // Cập nhật giá trị input ngay lập tức, fade grid sau 150ms
              const val = e.target.value;
              setSearchTerm(val);
              setIsFading(true);
              if (filterTimeout.current) clearTimeout(filterTimeout.current);
              filterTimeout.current = setTimeout(() => setIsFading(false), 150);
            }}
          />
        </div>

        <select
          className="catalog-select"
          value={category}
          onChange={(e) => {
            const val = e.target.value;
            applyFilter(() => {
              setCategory(val);
              setSubcategory('');
            });
          }}
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="catalog-select"
          value={subcategory}
          onChange={(e) => {
            const val = e.target.value;
            applyFilter(() => setSubcategory(val));
          }}
        >
          <option value="">All Subcategories ({subcategories.length})</option>
          {subcategories.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div
        className="products-grid"
        style={{
          opacity: isFading ? 0 : 1,
          transition: 'opacity 0.15s ease',
        }}
      >
        {isLoading ? (
          <div className="state-empty" style={{ gridColumn: '1 / -1' }}>
            <div className="state-icon">
              <Loader size={32} className="spin" />
            </div>
            <div className="state-title">Đang tải sản phẩm...</div>
            <div className="state-desc">Đang kết nối đến API server.</div>
          </div>
        ) : error ? (
          <div className="state-empty" style={{ gridColumn: '1 / -1' }}>
            <div className="state-icon">⚠️</div>
            <div className="state-title">Không thể tải sản phẩm</div>
            <div className="state-desc">{error}</div>
            <button type="button" className="btn btn-primary" onClick={loadProducts} style={{ marginTop: 16 }}>
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="state-empty" style={{ gridColumn: '1 / -1' }}>
            <div className="state-icon">
              <SearchX size={32} />
            </div>
            <div className="state-title">No products found</div>
            <div className="state-desc">Try adjusting your search or filters.</div>
          </div>
        ) : (
          filtered.map((p) => {
            const inCompare = isInCompare(p.model);
            return (
              <div
                key={p.model}
                className="product-card"
                data-model={p.model}
                onClick={() => onViewDetail(p.model)}
                title={`Bấm để xem chi tiết ${p.model}`}
              >
                <div className="product-card-img">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.model}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '8px',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.img-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="img-placeholder"
                    style={{ display: p.image ? 'none' : 'flex' }}
                  >
                    {p.model}
                  </div>
                </div>

                <div className="product-card-body">
                  <div className="product-card-model">{p.model}</div>
                  <div className="product-card-name" title={p.name}>
                    {p.name}
                  </div>
                  <div className="product-card-meta">
                    {p.category && <span className="product-tag-cat">{p.category}</span>}
                    {p.subcategory && <span className="product-tag-subcat">{p.subcategory}</span>}
                  </div>

                  {/* Commercial info — no stock quantity */}
                  <div className="product-card-commerce">
                    {p.price != null ? (
                      <div className="product-card-price">
                        ${p.price.toLocaleString()}
                        <span className="product-card-currency">{p.currency || 'USD'}</span>
                      </div>
                    ) : null}
                    <div className="availability-badge">
                      <Tag size={11} /> Available for order
                    </div>
                  </div>

                  <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
                    <AddToCartButton product={p} className="add-cart-btn" />
                    
                    <button type="button"
                      className={`btn btn-secondary compare-btn ${inCompare ? 'btn-added' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(p.model);
                      }}
                      title={inCompare ? 'Remove from Compare' : 'Add to Compare'}>
                      {inCompare ? <Check size={16} /> : <GitCompare size={16} />}
                    </button>
                    
                    <FavoriteButton product={p} className="favorite-btn" size={16} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
