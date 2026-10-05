import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { Navbar } from './components/layout/Navbar';
import { SiteFooter } from './components/layout/SiteFooter';
import { SearchHero } from './components/search/SearchHero';
import { SearchResults } from './components/search/SearchResults';
import { ProductCatalog } from './components/products/ProductCatalog';
import { ProductDetail } from './components/detail/ProductDetail';
import { ProductCompare } from './components/compare/ProductCompare';
import { ProductSelectorModal } from './components/common/ProductSelectorModal';
import { ToastContainer } from './components/common/Toast';
import { searchProductsApi } from './services/api';
import { IconContext } from '@phosphor-icons/react';

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


// ─── URLs ─────────────────────────────────────────────────────────────────────
// Components navigate with page names (onNavigate('products'), 'detail:CS655',
// 'account-order:REECO-1001', ...). These helpers translate between those names and URLs,
// so components keep their API while every page has its own address.

// Models can contain "/" (e.g. AM16/32B-ST): keep the slashes, encode each part
const modelPath = (model) => String(model).split('/').map(encodeURIComponent).join('/');

const PAGE_PATHS = {
  products: '/products',
  compare: '/compare',
  login: '/login',
  favorites: '/favorites',
  cart: '/cart',
  checkout: '/checkout',
  account: '/account',
  'account-orders': '/account/orders',
  'account-notifications': '/account/notifications',
  'account-profile': '/account/profile',
  admin: '/admin/orders',
  'admin-orders': '/admin/orders',
  'vnpay-return': VNPAY_RETURN_PATH,
};

export function pathForPage(page) {
  if (!page || page === 'search' || page === 'home') return '/';
  if (page.startsWith('order-success:')) {
    return `/orders/${encodeURIComponent(page.slice('order-success:'.length))}/success`;
  }
  if (page.startsWith('detail:')) return `/products/${modelPath(page.slice('detail:'.length))}`;
  if (page.startsWith('account-order:')) {
    return `/account/orders/${encodeURIComponent(page.slice('account-order:'.length))}`;
  }
  return PAGE_PATHS[page] || '/';
}

// Page name for a URL: drives the navbar's active link, the home/theme switch and titles
export function pageForPath(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/search') return 'search';
  if (pathname.startsWith('/products/')) return 'detail';
  if (/^\/orders\/[^/]+\/success$/.test(pathname)) return 'order-success';
  if (/^\/account\/orders\/[^/]+$/.test(pathname)) return 'account-order-detail';
  if (pathname === VNPAY_RETURN_PATH) return 'vnpay-return';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin-orders';
  const match = Object.entries(PAGE_PATHS).find(([, path]) => path === pathname);
  return match ? match[0] : 'not-found';
}

const PAGE_TITLES = {
  home: 'Campbell AI Search',
  search: 'AI Search',
  products: 'Products',
  detail: 'Product',
  compare: 'Compare',
  login: 'Sign in',
  favorites: 'Favorites',
  cart: 'Cart',
  checkout: 'Checkout',
  'order-success': 'Order placed',
  'vnpay-return': 'Payment',
  account: 'My account',
  'account-orders': 'My orders',
  'account-order-detail': 'Order',
  'account-notifications': 'Notifications',
  'account-profile': 'Profile',
  'admin-orders': 'Orders admin',
};

// ─── Route wrappers: read URL parameters and hand them to the page components ──
function ProductDetailRoute({ onNavigate, ...props }) {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const model = params['*'];
  const from = location.state?.from;
  return (
    <ProductDetail
      key={model}
      model={model}
      previousPage={from === 'search' ? 'search' : 'products'}
      // Back returns to wherever the visitor came from inside the app, else to Products
      onBack={() => (from ? navigate(-1) : navigate('/products'))}
      onNavigate={onNavigate}
      {...props}
    />
  );
}

function OrderSuccessRoute({ onNavigate }) {
  const { orderId } = useParams();
  return <OrderSuccessPage key={orderId} orderId={orderId} onNavigate={onNavigate} />;
}

function OrderDetailRoute() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  return <OrderDetail key={orderId} orderId={orderId} onBack={() => navigate('/account/orders')} />;
}

function VnpayReturnRoute({ onNavigate }) {
  const location = useLocation();
  return <VnpayReturnPage search={location.search} onNavigate={onNavigate} />;
}

function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageForPath(location.pathname);
  const isHomeLocked = page === 'home';

  // Search State (the chat thread lives here so it survives visits to product pages)
  const [conversationTurns, setConversationTurns] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  // Chat thread on the AI Search page: one entry per question, newest last
  const [searchThread, setSearchThread] = useState([]);
  const autoSearchedQuery = useRef(null);

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

  // Each page starts at the top, and the tab title names it
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const title = PAGE_TITLES[page];
    document.title = !title || page === 'home' ? 'Campbell AI Search' : `${title} · Campbell AI Search`;
  }, [page]);

  const resetSearch = useCallback(() => {
    setConversationTurns([]);
    setSearchThread([]);
    autoSearchedQuery.current = null;
  }, []);

  // Navigate by page name (see pathForPage). "detail:" remembers where the visitor came
  // from so the product page can label and handle its Back button.
  const handleNavigate = useCallback((target) => {
    if (target === 'search' || target === 'home') resetSearch();
    const state = target && target.startsWith('detail:') ? { from: page } : undefined;
    navigate(pathForPage(target), state ? { state } : undefined);
  }, [navigate, page, resetSearch]);

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
    setIsSearching(true);
    // A new search starts a fresh thread at /search?q=...; a follow-up is appended to it
    const turnId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pendingTurn = { id: turnId, query, status: 'loading' };
    setSearchThread((prev) => (followUp ? [...prev, pendingTurn] : [pendingTurn]));
    if (!followUp) {
      autoSearchedQuery.current = query;
      const target = `/search?q=${encodeURIComponent(query)}`;
      if (`${location.pathname}${location.search}` !== target) navigate(target);
    }

    const response = await searchProductsApi(query, 10, context);
    const finishTurn = (fields) =>
      setSearchThread((prev) => prev.map((turn) => (turn.id === turnId ? { ...turn, status: 'done', ...fields } : turn)));
    if (response && response.error) {
      finishTurn({ results: [], error: response });
    } else if (response && response.results) {
      finishTurn({
        results: response.results,
        guidance: response.guidance || null,
        mode: response.mode,
        resolvedQuery: response.resolved_query,
      });
      const turn = { text: query, resolved_query: response.resolved_query };
      const firstProduct = response.results[0];
      const scope = firstProduct?.matched_features?.some((item) => item.startsWith('identity:'))
        ? [firstProduct.product_id]
        : response.results.slice(0, 5).map((item) => item.product_id);
      setConversationTurns(prev => context && response.context_applied
        ? [...prev.map((item, index) => selectedProductIds && index === 0 ? { ...item, product_ids: selectedProductIds } : item), turn]
        : [{ ...turn, product_ids: scope }]);
    } else {
      finishTurn({ results: [] });
    }
    setIsSearching(false);
  };

  // Opening /search?q=... directly (shared link, refresh, Back/Forward to another query)
  // runs that search when the current thread is not already about it.
  const urlQuery = page === 'search' ? (new URLSearchParams(location.search).get('q') || '').trim() : '';
  useEffect(() => {
    if (page !== 'search') return;
    if (!urlQuery) {
      navigate('/', { replace: true });
      return;
    }
    if (searchThread[0]?.query === urlQuery || autoSearchedQuery.current === urlQuery) return;
    autoSearchedQuery.current = urlQuery;
    handleRunSearch(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, urlQuery]);

  const handleEditSearch = () => {
    resetSearch();
    navigate('/');
  };

  // View Detail
  const handleViewDetail = (model) => handleNavigate(`detail:${model}`);

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

  // VNPay may return to any path with vnp_* parameters; send those to the return page
  if (location.search.includes('vnp_') && location.pathname !== VNPAY_RETURN_PATH) {
    return <Navigate to={`${VNPAY_RETURN_PATH}${location.search}`} replace />;
  }

  const viewOrder = (id) => navigate(`/account/orders/${encodeURIComponent(id)}`);
  const commerceProps = { onToggleCompare: handleToggleCompare, isInCompare };

  return (
    <div className={`app-container ${isHomeLocked ? 'is-home-locked' : 'theme-shop'}`}>
      <BackgroundEffects />

      <Navbar
        // The home hero is the AI Search entry, so its nav link shows as active there
        currentPage={page === 'home' ? 'search' : page}
        onNavigate={handleNavigate}
        compareCount={compareList.length}
      />

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={(
              <section className="page active" id="page-search">
                <SearchHero onSearch={handleRunSearch} onViewDetail={handleViewDetail} />
              </section>
            )}
          />
          <Route
            path="/search"
            element={(
              <section className="page active" id="page-search">
                <SearchResults
                  thread={searchThread}
                  isLoading={isSearching}
                  onEditSearch={handleEditSearch}
                  onFollowUp={(query) => handleRunSearch(query, true)}
                  onViewDetail={handleViewDetail}
                  {...commerceProps}
                />
              </section>
            )}
          />
          <Route path="/products" element={<ProductCatalog onViewDetail={handleViewDetail} {...commerceProps} />} />
          <Route
            path="/products/*"
            element={<ProductDetailRoute onSelectProduct={handleViewDetail} onNavigate={handleNavigate} {...commerceProps} />}
          />
          <Route
            path="/compare"
            element={(
              <ProductCompare
                compareList={compareList}
                onOpenAddModal={handleOpenAddModal}
                onOpenReplaceModal={handleOpenReplaceModal}
                onRemoveFromCompare={handleRemoveFromCompare}
                onClearCompare={handleClearCompare}
                onNavigate={handleNavigate}
              />
            )}
          />
          <Route path="/login" element={<LoginPage onNavigate={handleNavigate} returnTo="account" />} />
          <Route path="/favorites" element={<FavoriteList onNavigate={handleNavigate} onViewDetail={handleViewDetail} />} />
          <Route path="/cart" element={<CartPage onNavigate={handleNavigate} />} />
          <Route path="/checkout" element={<CheckoutPage onNavigate={handleNavigate} />} />
          <Route path="/orders/:orderId/success" element={<OrderSuccessRoute onNavigate={handleNavigate} />} />
          <Route path={VNPAY_RETURN_PATH} element={<VnpayReturnRoute onNavigate={handleNavigate} />} />
          <Route path="/account" element={<AccountDashboard onNavigate={handleNavigate} />} />
          <Route path="/account/orders" element={<OrderList onNavigate={handleNavigate} onViewOrder={viewOrder} />} />
          <Route path="/account/orders/:orderId" element={<OrderDetailRoute />} />
          <Route path="/account/notifications" element={<NotificationCenter onNavigate={handleNavigate} />} />
          <Route path="/account/profile" element={<ProfilePage onNavigate={handleNavigate} />} />
          <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
          <Route path="/admin/orders" element={<AdminOrders onViewOrder={viewOrder} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isHomeLocked && <SiteFooter onNavigate={handleNavigate} />}

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

// Phosphor icons app-wide: bold strokes hold up next to the heavy UI type at small sizes.
const ICON_DEFAULTS = { weight: 'bold' };

export function App() {
  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      <AuthProvider>
        <CartProvider>
          <FavoriteProvider>
            <BrowserRouter>
              <AppInner />
            </BrowserRouter>
          </FavoriteProvider>
        </CartProvider>
      </AuthProvider>
    </IconContext.Provider>
  );
}

export default App;
