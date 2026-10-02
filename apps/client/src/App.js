import React, { useState, useEffect, useCallback } from 'react';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { Navbar } from './components/layout/Navbar';
import { SearchHero } from './components/search/SearchHero';
import { SearchResults } from './components/search/SearchResults';
import { ProductCatalog } from './components/products/ProductCatalog';
import { ProductDetail } from './components/detail/ProductDetail';
import { ProductCompare } from './components/compare/ProductCompare';
import { ProductSelectorModal } from './components/common/ProductSelectorModal';
import { ToastContainer } from './components/common/Toast';
import { searchProductsApi } from './services/api';

// Auth & Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoriteProvider } from './context/FavoriteContext';

// Commerce Pages
import { LoginPage } from './components/auth/LoginPage';
import { CartPage } from './components/commerce/CartPage';
import { CheckoutPage } from './components/commerce/CheckoutPage';
import { OrderSuccessPage } from './components/commerce/OrderSuccessPage';
import { VnpayReturnPage } from './components/commerce/VnpayReturnPage';
import { VNPAY_RETURN_PATH } from './services/paymentService';

// Account Pages
import { FavoriteList } from './components/account/FavoriteList';
import { AccountDashboard } from './components/account/AccountDashboard';
import { OrderList } from './components/account/OrderList';
import { OrderDetail } from './components/account/OrderDetail';
import { NotificationCenter } from './components/account/NotificationCenter';
import { ProfilePage } from './components/account/ProfilePage';

// Admin
import { AdminOrders } from './components/admin/AdminOrders';

import './index.css';

const vnpayReturnSearch = typeof window !== 'undefined' &&
  (window.location.pathname === VNPAY_RETURN_PATH || window.location.search.includes('vnp_'))
  ? window.location.search : null;
if (vnpayReturnSearch !== null) window.history.replaceState(null, '', '/');

function AppInner() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (
      vnpayReturnSearch !== null
    ) {
      return 'vnpay-return';
    }
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem('reeco_current_page');
        if (saved) return saved;
      }
    } catch {}
    return 'search';
  });
  const [previousPage, setPreviousPage] = useState('search');
  const [currentDetailModel, setCurrentDetailModel] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem('reeco_current_detail_model') || null;
      }
    } catch {}
    return null;
  });
  const [currentOrderId, setCurrentOrderId] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem('reeco_current_order_id') || null;
      }
    } catch {}
    return null;
  });
  const [orderSuccessId, setOrderSuccessId] = useState(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem('reeco_order_success_id') || null;
      }
    } catch {}
    return null;
  });

  // Sync state to sessionStorage
  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined' && currentPage) {
        sessionStorage.setItem('reeco_current_page', currentPage);
      }
    } catch {}
  }, [currentPage]);

  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (currentOrderId) {
          sessionStorage.setItem('reeco_current_order_id', currentOrderId);
        }
      }
    } catch {}
  }, [currentOrderId]);

  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (orderSuccessId) {
          sessionStorage.setItem('reeco_order_success_id', orderSuccessId);
        }
      }
    } catch {}
  }, [orderSuccessId]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvedQuery, setResolvedQuery] = useState('');
  const [conversationTurns, setConversationTurns] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchGuidance, setSearchGuidance] = useState(null);
  const [searchMode, setSearchMode] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Compare State
  const [compareList, setCompareList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState(0);

  // Toast State
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, desc) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, desc }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      showToast('info', 'Welcome', 'Describe what you need to find the right Campbell product');
    }, 500);
    return () => clearTimeout(timer);
  }, [showToast]);

  const isHomeLocked = currentPage === 'search' && !hasSearched;

  useEffect(() => {
    document.documentElement.style.overflow = isHomeLocked ? 'hidden' : '';
    document.body.style.overflow = isHomeLocked ? 'hidden' : '';
    document.body.style.height = isHomeLocked ? '100vh' : '';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isHomeLocked]);

  // Navigate handler — supports "order-success:ID" and "account-order:ID" patterns
  const handleNavigate = useCallback((page) => {
    if (page === 'search' || page === 'home') {
      setCurrentPage('search');
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('reeco_current_page', 'search');
        }
      } catch {}
      setHasSearched(false);
      setSearchError(null);
      setSearchMode(null);
      setSearchGuidance(null);
      setSearchQuery('');
      setResolvedQuery('');
      setConversationTurns([]);
    } else if (page.startsWith('order-success:')) {
      const id = page.replace('order-success:', '');
      setOrderSuccessId(id);
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('reeco_order_success_id', id);
          sessionStorage.setItem('reeco_current_page', 'order-success');
        }
      } catch {}
      setCurrentPage('order-success');
    } else if (page.startsWith('account-order:')) {
      const id = page.replace('account-order:', '');
      setCurrentOrderId(id);
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('reeco_current_order_id', id);
          sessionStorage.setItem('reeco_current_page', 'account-order-detail');
        }
      } catch {}
      setCurrentPage('account-order-detail');
    } else {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('reeco_current_page', page);
        }
      } catch {}
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Search Handler
  const handleRunSearch = async (query, followUp = false, selectedProductIds = null) => {
    if (!query) return;
    const context = followUp && conversationTurns[0]?.product_ids?.length > 0
      ? {
          base_query: conversationTurns[0].resolved_query,
          previous_query: conversationTurns[conversationTurns.length - 1].resolved_query,
          product_ids: selectedProductIds || conversationTurns[0].product_ids,
        }
      : null;
    setSearchQuery(query);
    setHasSearched(true);
    setIsSearching(true);
    setSearchError(null);
    setSearchMode(null);
    setSearchGuidance(null);
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const response = await searchProductsApi(query, 10, context);
    if (response && response.error) {
      setSearchResults([]);
      setSearchError(response);
    } else if (response && response.results) {
      setSearchResults(response.results);
      setSearchGuidance(response.guidance);
      setSearchMode(response.mode);
      setResolvedQuery(response.resolved_query);
      const turn = { text: query, resolved_query: response.resolved_query };
      const firstProduct = response.results[0];
      const scope = firstProduct?.matched_features?.some((item) => item.startsWith('identity:'))
        ? [firstProduct.product_id]
        : response.results.slice(0, 5).map((item) => item.product_id);
      setConversationTurns(prev => context && response.context_applied
        ? [...prev.map((item, index) => selectedProductIds && index === 0 ? { ...item, product_ids: selectedProductIds } : item), turn]
        : [{ ...turn, product_ids: scope }]);
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleEditSearch = () => {
    setSearchGuidance(null);
    setHasSearched(false);
    setSearchError(null);
    setSearchMode(null);
    setConversationTurns([]);
    setResolvedQuery('');
  };

  // View Detail
  const handleViewDetail = (model) => {
    setPreviousPage(currentPage === 'detail' ? previousPage : currentPage);
    setCurrentDetailModel(model);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setCurrentPage(previousPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compare Handlers
  const isInCompare = (model) => compareList.includes(model);

  const handleToggleCompare = (model) => {
    if (isInCompare(model)) {
      setCompareList(prev => prev.filter(m => m !== model));
      showToast('info', 'Removed from compare', `${model} removed`);
    } else {
      if (compareList.length >= 2) {
        showToast('error', 'Compare limit reached', 'You can compare up to 2 products. Remove one before adding another.');
        return;
      }
      setCompareList(prev => [...prev, model]);
      showToast('success', 'Added to compare', `${model} added · ${compareList.length + 1}/2 selected`);
    }
  };

  const handleRemoveFromCompare = (model) => {
    setCompareList(prev => prev.filter(m => m !== model));
    showToast('info', 'Removed from compare', `${model} removed`);
  };

  const handleClearCompare = () => {
    setCompareList([]);
    showToast('info', 'Compare cleared', 'All products removed');
  };

  const handleOpenAddModal = (slot) => { setModalSlot(slot); setModalOpen(true); };
  const handleOpenReplaceModal = (slot) => { setModalSlot(slot); setModalOpen(true); };

  const handleSelectProductInModal = (model) => {
    const otherSlot = 1 - modalSlot;
    if (compareList[otherSlot] === model) {
      const updated = [...compareList];
      const temp = updated[modalSlot]; updated[modalSlot] = updated[otherSlot]; updated[otherSlot] = temp;
      setCompareList(updated);
    } else {
      const updated = [...compareList];
      updated[modalSlot] = model;
      setCompareList(updated);
    }
    setModalOpen(false);
    showToast('success', 'Product selected', `${model} added to comparison`);
  };

  return (
    <div className={`app-container ${isHomeLocked ? 'is-home-locked' : ''}`}>
      <BackgroundEffects />

      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        compareCount={compareList.length}
      />

      <main className="main">
        {/* ── Search Page ────────────────────────────────────────────────────────── */}
        {currentPage === 'search' && (
          <section className="page active" id="page-search">
            {!hasSearched ? (
              <SearchHero onSearch={handleRunSearch} onViewDetail={handleViewDetail} />
            ) : (
              <SearchResults
                guidance={searchGuidance}
                query={searchQuery}
                resolvedQuery={resolvedQuery}
                conversationTurns={conversationTurns}
                results={searchResults}
                mode={searchMode}
                searchError={searchError}
                isLoading={isSearching}
                onEditSearch={handleEditSearch}
                onFollowUp={(query) => handleRunSearch(query, true)}
                onExplainProduct={(product) => handleRunSearch(product.explanation?.language === 'vi'
                  ? 'Tại sao sản phẩm này phù hợp với nhu cầu của tôi?' : 'Why is this product suitable for my application?', true, [product.product_id])}
                onViewDetail={handleViewDetail}
                onToggleCompare={handleToggleCompare}
                isInCompare={isInCompare}
              />
            )}
          </section>
        )}

        {/* ── Products Page ──────────────────────────────────────────────────────── */}
        {currentPage === 'products' && (
          <ProductCatalog
            onViewDetail={handleViewDetail}
            onToggleCompare={handleToggleCompare}
            isInCompare={isInCompare}
          />
        )}

        {/* ── Product Detail ─────────────────────────────────────────────────────── */}
        {currentPage === 'detail' && (
          <ProductDetail
            model={currentDetailModel}
            previousPage={previousPage}
            onBack={handleBackFromDetail}
            onToggleCompare={handleToggleCompare}
            isInCompare={isInCompare}
            onSelectProduct={handleViewDetail}
            onNavigate={handleNavigate}
          />
        )}

        {/* ── Compare Page ───────────────────────────────────────────────────────── */}
        {currentPage === 'compare' && (
          <ProductCompare
            compareList={compareList}
            onOpenAddModal={handleOpenAddModal}
            onOpenReplaceModal={handleOpenReplaceModal}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={handleClearCompare}
            onNavigate={handleNavigate}
          />
        )}

        {/* ── Login ──────────────────────────────────────────────────────────────── */}
        {currentPage === 'login' && (
          <LoginPage onNavigate={handleNavigate} returnTo="account" />
        )}

        {/* ── Favorites ──────────────────────────────────────────────────────────── */}
        {currentPage === 'favorites' && (
          <FavoriteList onNavigate={handleNavigate} onViewDetail={handleViewDetail} />
        )}

        {/* ── Cart ───────────────────────────────────────────────────────────────── */}
        {currentPage === 'cart' && (
          <CartPage onNavigate={handleNavigate} />
        )}

        {/* ── Checkout ───────────────────────────────────────────────────────────── */}
        {currentPage === 'checkout' && (
          <CheckoutPage onNavigate={handleNavigate} />
        )}

        {/* ── Order Success ──────────────────────────────────────────────────────── */}
        {currentPage === 'order-success' && (
          <OrderSuccessPage orderId={orderSuccessId} onNavigate={handleNavigate} />
        )}

        {/* ── VNPay Return ───────────────────────────────────────────────────────── */}
        {currentPage === 'vnpay-return' && (
          <VnpayReturnPage search={vnpayReturnSearch} onNavigate={handleNavigate} />
        )}

        {/* ── Account Dashboard ──────────────────────────────────────────────────── */}
        {currentPage === 'account' && (
          <AccountDashboard onNavigate={handleNavigate} />
        )}

        {/* ── Order History ──────────────────────────────────────────────────────── */}
        {currentPage === 'account-orders' && (
          <OrderList
            onNavigate={handleNavigate}
            onViewOrder={(id) => { setCurrentOrderId(id); setCurrentPage('account-order-detail'); window.scrollTo({ top: 0 }); }}
          />
        )}

        {/* ── Order Detail ───────────────────────────────────────────────────────── */}
        {currentPage === 'account-order-detail' && (
          <OrderDetail
            orderId={currentOrderId}
            onBack={() => { setCurrentPage('account-orders'); window.scrollTo({ top: 0 }); }}
          />
        )}

        {/* ── Notifications ──────────────────────────────────────────────────────── */}
        {currentPage === 'account-notifications' && (
          <NotificationCenter onNavigate={handleNavigate} />
        )}

        {/* ── Profile ────────────────────────────────────────────────────────────── */}
        {currentPage === 'account-profile' && (
          <ProfilePage onNavigate={handleNavigate} />
        )}

        {/* ── Admin: Orders ──────────────────────────────────────────────────────── */}
        {(currentPage === 'admin' || currentPage === 'admin-orders') && (
          <AdminOrders
            onViewOrder={(id) => { setCurrentOrderId(id); setCurrentPage('account-order-detail'); window.scrollTo({ top: 0 }); }}
          />
        )}
      </main>

      <ProductSelectorModal
        isOpen={modalOpen}
        modalSlot={modalSlot}
        compareList={compareList}
        onClose={() => setModalOpen(false)}
        onSelectProduct={handleSelectProductInModal}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoriteProvider>
          <AppInner />
        </FavoriteProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
