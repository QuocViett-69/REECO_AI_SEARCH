import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Search, Package, GitCompare, Menu, X,
  Heart, ShoppingCart, User, Bell, Shield, ChevronDown, Minus, Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorite } from '../../context/FavoriteContext';

export function Navbar({ currentPage, onNavigate, compareCount }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, cartItems, cartSubtotal } = useCart();
  const { favoriteCount } = useFavorite();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const accountRef = useRef(null);
  const cartRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartPreviewOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const nav = page => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setAccountOpen(false);
    setCartPreviewOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    onNavigate('search');
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          {/* Brand */}
          <div className="nav-brand" onClick={() => nav('search')} style={{ cursor: 'pointer' }}>
            <div className="nav-brand-mark"><Sparkles size={18} /></div>
            <div className="nav-brand-text">Campbell <span>AI Search</span></div>
          </div>

          {/* Main Links */}
          <div className="nav-menu" id="navMenu">
            <button type="button" className={`nav-link ${currentPage === 'search' ? 'active' : ''}`} onClick={() => nav('search')}>
              <Search size={16} /> AI Search
            </button>
            <button type="button" className={`nav-link ${currentPage === 'products' ? 'active' : ''}`} onClick={() => nav('products')}>
              <Package size={16} /> Products
            </button>
          </div>

          {/* Compare */}
          <button type="button" className={`nav-compare-btn ${compareCount === 0 ? 'empty' : ''}`} onClick={() => nav('compare')}>
            <GitCompare size={16} />
            <span>Compare</span>
            <span className="count" id="compareCount">{compareCount}</span>
          </button>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Favorites */}
            <button type="button"
              className={`nav-icon-btn ${currentPage === 'favorites' ? 'active' : ''}`}
              onClick={() => nav('favorites')} aria-label="Favorites" title="Favorites">
              <Heart size={18} />
              {favoriteCount > 0 && <span className="nav-badge">{favoriteCount}</span>}
            </button>

            {/* Cart with mini-preview */}
            <div className="nav-cart-wrap" ref={cartRef}>
              <button type="button"
                className={`nav-icon-btn ${currentPage === 'cart' ? 'active' : ''}`}
                onClick={() => setCartPreviewOpen(v => !v)} aria-label="Cart" title="Cart">
                <ShoppingCart size={18} />
                {cartCount > 0 && <span className="nav-badge nav-badge--cart">{cartCount}</span>}
              </button>
              {cartPreviewOpen && (
                <div className="cart-drawer">
                  <div className="cart-drawer__header">
                    <span>Cart ({cartCount})</span>
                    <button type="button" onClick={() => setCartPreviewOpen(false)} aria-label="Close"><X size={16} /></button>
                  </div>
                  {cartItems.length === 0 ? (
                    <div className="cart-drawer__empty"><ShoppingCart size={28} /><span>Your cart is empty</span></div>
                  ) : (
                    <>
                      <div className="cart-drawer__items">
                        {cartItems.slice(0, 3).map(item => (
                          <div key={item.product_id} className="cart-drawer__item">
                            <div className="cart-drawer__item-img">
                              {item.image ? <img src={item.image} alt={item.model} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 10, fontWeight: 700 }}>{item.model}</span>}
                            </div>
                            <div className="cart-drawer__item-info">
                              <div className="cart-drawer__item-model">{item.model}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>×{item.quantity}</div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>${((item.price || 0) * item.quantity).toLocaleString()}</div>
                          </div>
                        ))}
                        {cartItems.length > 3 && <div className="cart-drawer__more">+{cartItems.length - 3} more</div>}
                      </div>
                      <div className="cart-drawer__footer">
                        <div className="cart-drawer__subtotal"><span>Subtotal</span><span>${cartSubtotal.toLocaleString()}</span></div>
                        <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: 6 }} onClick={() => nav('cart')}>View Cart</button>
                        <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => nav('checkout')}>Checkout</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Notifications (auth only) */}
            {isAuthenticated && (
              <button type="button"
                className={`nav-icon-btn ${currentPage === 'account-notifications' ? 'active' : ''}`}
                onClick={() => nav('account-notifications')} aria-label="Notifications" title="Notifications">
                <Bell size={18} />
              </button>
            )}

            {/* Account / Login */}
            {isAuthenticated ? (
              <div className="nav-account-wrap" ref={accountRef}>
                <button type="button"
                  className={`nav-account-btn ${accountOpen ? 'open' : ''}`}
                  onClick={() => setAccountOpen(v => !v)} aria-label="Account menu" aria-expanded={accountOpen}>
                  {isAdmin ? <Shield size={15} /> : <User size={15} />}
                  <span className="nav-account-name">{user.name || user.username}</span>
                  <ChevronDown size={14} />
                </button>
                {accountOpen && (
                  <div className="nav-dropdown" role="menu">
                    {isAdmin ? (
                      <>
                        <button type="button" className="nav-dropdown-item" role="menuitem" onClick={() => nav('admin')}><Shield size={14} /> Admin Dashboard</button>
                        <button type="button" className="nav-dropdown-item" role="menuitem" onClick={() => nav('admin-orders')}>All Orders</button>
                        <div className="nav-dropdown-divider" />
                      </>
                    ) : (
                      <>
                        <button type="button" className="nav-dropdown-item" role="menuitem" onClick={() => nav('account')}><User size={14} /> My Account</button>
                        <button type="button" className="nav-dropdown-item" role="menuitem" onClick={() => nav('account-orders')}>My Orders</button>
                        <button type="button" className="nav-dropdown-item" role="menuitem" onClick={() => nav('account-notifications')}>Notifications</button>
                        <button type="button" className="nav-dropdown-item" role="menuitem" onClick={() => nav('account-profile')}>Profile</button>
                        <div className="nav-dropdown-divider" />
                      </>
                    )}
                    <button type="button" className="nav-dropdown-item nav-dropdown-item--danger" role="menuitem" onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className={`nav-login-btn ${currentPage === 'login' ? 'active' : ''}`} onClick={() => nav('login')}>
                <User size={15} /> Login
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button type="button" className="menu-toggle" onClick={() => setMobileMenuOpen(p => !p)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <button type="button" className={`nav-link ${currentPage === 'search' ? 'active' : ''}`} onClick={() => nav('search')}><Search size={16} /> AI Search</button>
        <button type="button" className={`nav-link ${currentPage === 'products' ? 'active' : ''}`} onClick={() => nav('products')}><Package size={16} /> Products</button>
        <button type="button" className={`nav-link ${currentPage === 'compare' ? 'active' : ''}`} onClick={() => nav('compare')}><GitCompare size={16} /> Compare ({compareCount})</button>
        <button type="button" className={`nav-link ${currentPage === 'favorites' ? 'active' : ''}`} onClick={() => nav('favorites')}><Heart size={16} /> Favorites {favoriteCount > 0 && `(${favoriteCount})`}</button>
        <button type="button" className={`nav-link ${currentPage === 'cart' ? 'active' : ''}`} onClick={() => nav('cart')}><ShoppingCart size={16} /> Cart {cartCount > 0 && `(${cartCount})`}</button>
        <div className="mobile-nav-divider" />
        {isAuthenticated ? (
          isAdmin ? (
            <>
              <button type="button" className="nav-link" onClick={() => nav('admin')}><Shield size={16} /> Admin Panel</button>
              <button type="button" className="nav-link" style={{ color: 'var(--danger)' }} onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <button type="button" className="nav-link" onClick={() => nav('account')}><User size={16} /> My Account</button>
              <button type="button" className="nav-link" style={{ color: 'var(--danger)' }} onClick={handleLogout}>Sign Out</button>
            </>
          )
        ) : (
          <button type="button" className="nav-link" onClick={() => nav('login')}><User size={16} /> Login</button>
        )}
      </div>
    </>
  );
}
