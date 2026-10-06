import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowClockwise,
  ArrowsLeftRight,
  Check,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  Warning,
} from '@phosphor-icons/react';
import { getProductsApi } from '../../services/api';
import { FavoriteButton } from '../commerce/FavoriteButton';
import { AddToCartButton } from '../commerce/AddToCartButton';
import { formatPrice } from '../../services/commercialService';
import { sizedImage } from '../../services/images';
import '../../styles/studio/discovery.css';
import '../../styles/studio/products-cafe.css';

function countBy(items, key) {
  const counts = new Map();
  items.forEach((item) => {
    if (item[key]) counts.set(item[key], (counts.get(item[key]) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function ProductCatalog({ onViewDetail, onToggleCompare, isInCompare }) {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProductsApi({ limit: 100 });
      if (result && result.items) {
        setAllProducts(result.items);
      } else {
        setError('The product server did not respond. Check that the API is running, then try again.');
      }
    } catch (e) {
      setError('Could not connect to the product API. Check your connection, then try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = countBy(allProducts, 'category');
  const subcategories = countBy(
    allProducts.filter((p) => !category || p.category === category),
    'subcategory',
  ).sort((a, b) => a[0].localeCompare(b[0]));

  const term = searchTerm.trim().toLowerCase();
  const filtered = allProducts.filter((p) => {
    if (term) {
      const matchModel = p.model.toLowerCase().includes(term);
      const matchName = (p.name || '').toLowerCase().includes(term);
      if (!matchModel && !matchName) return false;
    }
    if (category && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });

  // One product from each of the first categories, for the hero polaroids
  const polaroids = categories
    .map(([name]) => allProducts.find((p) => p.category === name && p.image))
    .filter(Boolean)
    .slice(0, 4);

  const isFiltered = Boolean(term || category || subcategory);
  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSubcategory('');
  };

  const selectCategory = (value) => {
    setCategory(value);
    setSubcategory('');
  };

  return (
    <section className="page active st-page cat-page" id="page-products">
      {/* Sky hero: blue eyebrow, bold headline, a row of blue-check category facts and a
          few product sheets floating in the margins (decorative, wide screens only) */}
      <header className="cat-hero">
        <p className="cat-hero__label">
          Campbell Scientific{allProducts.length > 0 ? ` · ${allProducts.length} instruments` : ''}
        </p>
        <h1 className="cat-hero__title">Products</h1>
        <p className="cat-hero__lede">
          Sensors, dataloggers, communications and power for weather, soil and water stations.
        </p>
        {categories.length > 0 && (
          <ul className="cat-hero__facts">
            {categories.slice(0, 3).map(([name, count]) => (
              <li key={name}>
                <span className="cat-hero__check" aria-hidden="true"><Check size={12} weight="bold" /></span>
                {name} <span className="cat-hero__count">{count}</span>
              </li>
            ))}
          </ul>
        )}
        {polaroids.length > 0 && (
          <div className="cat-hero__polaroids" aria-hidden="true">
            {polaroids.map((p, index) => (
              <figure key={p.model} className={`cat-polaroid cat-polaroid--${index + 1}`}>
                <figcaption>
                  <span>Model no</span>
                  {p.model}
                </figcaption>
                <img src={sizedImage(p.image, 320)} alt="" loading="lazy" />
              </figure>
            ))}
          </div>
        )}
      </header>

      <div className="cat-toolbar">
        <div className="cat-toolbar__row">
          <label className="st-search">
            <MagnifyingGlass size={18} aria-hidden="true" />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              placeholder="Search by model or name, e.g. CR1000X"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          <label className="cat-select">
            <span className="sr-only">Subcategory</span>
            <select className="st-select" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
              <option value="">All subcategories ({subcategories.length})</option>
              {subcategories.map(([name, count]) => (
                <option key={name} value={name}>
                  {name} ({count})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="st-tabs cat-tabs" role="group" aria-label="Category">
          <button type="button" className="st-tab" aria-pressed={!category} onClick={() => selectCategory('')}>
            All <span className="st-tab__count">{allProducts.length}</span>
          </button>
          {categories.map(([name, count]) => (
            <button
              key={name}
              type="button"
              className="st-tab"
              aria-pressed={category === name}
              onClick={() => selectCategory(category === name ? '' : name)}
            >
              {name} <span className="st-tab__count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {isFiltered && !isLoading && (
        <p className="cat-status" aria-live="polite">
          Showing {filtered.length} of {allProducts.length}
          <button type="button" className="st-link" onClick={clearFilters}>
            Clear filters
          </button>
        </p>
      )}

      {isLoading ? (
        <ul className="cat-grid" aria-busy="true" aria-label="Loading products">
          {Array.from({ length: 8 }, (_, n) => (
            <li key={n} className="cat-tile">
              <span className="st-skeleton cat-tile__skeleton-plate" />
              <span className="st-skeleton cat-tile__skeleton-line" />
              <span className="st-skeleton cat-tile__skeleton-line cat-tile__skeleton-line--short" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="st-state" role="alert">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><Warning size={20} /></span>
          </div>
          <h2 className="st-state__title">Products could not load</h2>
          <p className="st-state__desc">{error}</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={loadProducts}>
              <ArrowClockwise size={16} /> Try again
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="st-state">
          <div className="st-orb st-orb--stone" aria-hidden="true">
            <span className="st-orb__icon"><MagnifyingGlassMinus size={20} /></span>
          </div>
          <h2 className="st-state__title">No products match these filters</h2>
          <p className="st-state__desc">Check the model number spelling, or clear the filters to see every product.</p>
          <div className="st-state__actions">
            <button type="button" className="st-btn" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <ul className="cat-grid">
          {filtered.map((p) => {
            const inCompare = isInCompare(p.model);
            return (
              <li key={p.model} className="cat-tile" data-model={p.model}>
                {/* Invoice-sheet layout: model number header, product photo, then a
                    two-column type / price block and the actions */}
                <div className="cat-tile__head">
                  <div>
                    <span className="cat-tile__eyebrow">Model no</span>
                    <h2 className="cat-tile__model">
                      <button type="button" className="cat-tile__link" onClick={() => onViewDetail(p.model)}>
                        {p.model}
                      </button>
                    </h2>
                  </div>
                  {p.category && <span className="cat-tile__chip">{p.category}</span>}
                </div>

                <div className="st-plate cat-tile__plate">
                  {p.image ? (
                    <img
                      src={sizedImage(p.image, 640)}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.st-plate__fallback');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="st-plate__fallback" style={{ display: p.image ? 'none' : 'flex' }}>
                    {p.model}
                  </div>
                </div>

                <div className="cat-tile__body">
                  <p className="cat-tile__name" title={p.name}>
                    {p.name}
                  </p>

                  <dl className="cat-tile__meta">
                    <div>
                      <dt>Type</dt>
                      <dd className="cat-tile__type">{p.subcategory || '—'}</dd>
                    </div>
                    <div>
                      <dt>Price</dt>
                      <dd className="cat-tile__price">
                        {p.price != null ? formatPrice(p.price, p.currency) : 'On request'}
                      </dd>
                    </div>
                  </dl>

                  <div className="cat-tile__actions" role="group" aria-label={`Actions for ${p.model}`}>
                    <AddToCartButton product={p} className="st-btn--sm cat-tile__buy" label="Add to cart" size={15} />
                    <button
                      type="button"
                      className={`st-btn st-btn--icon st-btn--sm ${inCompare ? 'is-on' : ''}`}
                      onClick={() => onToggleCompare(p.model)}
                      aria-pressed={inCompare}
                      aria-label={inCompare ? `Remove ${p.model} from compare` : `Add ${p.model} to compare`}
                      title={inCompare ? 'Remove from compare' : 'Add to compare'}
                    >
                      {inCompare ? <Check size={15} /> : <ArrowsLeftRight size={15} />}
                    </button>
                    <FavoriteButton product={p} className="st-btn--icon st-btn--sm" size={15} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
