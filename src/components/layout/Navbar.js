import React, { useState } from 'react';
import { Sparkles, Search, Package, GitCompare, Menu, X } from 'lucide-react';

export function Navbar({ currentPage, onNavigate, compareCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div
            className="nav-brand"
            onClick={() => handleNav('search')}
            style={{ cursor: 'pointer' }}
          >
            <div className="nav-brand-mark">
              <Sparkles size={18} />
            </div>
            <div className="nav-brand-text">
              Campbell <span>AI Search</span>
            </div>
          </div>

          <div className="nav-menu" id="navMenu">
            <button
              type="button"
              className={`nav-link ${currentPage === 'search' ? 'active' : ''}`}
              onClick={() => handleNav('search')}
            >
              <Search size={16} /> AI Search
            </button>
            <button
              type="button"
              className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
              onClick={() => handleNav('products')}
            >
              <Package size={16} /> Products
            </button>
          </div>

          <button
            type="button"
            className={`nav-compare-btn ${compareCount === 0 ? 'empty' : ''}`}
            onClick={() => handleNav('compare')}
          >
            <GitCompare size={16} />
            <span>Compare</span>
            <span className="count" id="compareCount">
              {compareCount}
            </span>
          </button>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          type="button"
          className={`nav-link ${currentPage === 'search' ? 'active' : ''}`}
          onClick={() => handleNav('search')}
        >
          <Search size={16} /> AI Search
        </button>
        <button
          type="button"
          className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
          onClick={() => handleNav('products')}
        >
          <Package size={16} /> Products
        </button>
        <button
          type="button"
          className={`nav-link ${currentPage === 'compare' ? 'active' : ''}`}
          onClick={() => handleNav('compare')}
        >
          <GitCompare size={16} /> Compare ({compareCount})
        </button>
      </div>
    </>
  );
}
