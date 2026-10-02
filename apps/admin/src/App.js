import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductManagementView } from './components/products/ProductManagementView';
import { AdminProductDetailView } from './components/detail/AdminProductDetailView';
import { ProductImportView } from './components/import/ProductImportView';
import { UserManagementView } from './components/users/UserManagementView';
import { OrderManagementView } from './components/orders/OrderManagementView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { LoginView } from './components/auth/LoginView';
import { ToastContainer } from './components/common/Toast';
import { getAdminProductsApi, getStoredUser, logoutAdminApi } from './services/api';
import './index.css';

const VALID_TABS = ['dashboard', 'products', 'import', 'users', 'orders', 'reports', 'detail'];

const getInitialTab = () => {
  try {
    // 1. Prioritize URL hash (e.g. #users, #orders, #reports)
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) {
      const tabName = hash.split('?')[0];
      if (VALID_TABS.includes(tabName)) {
        return tabName;
      }
    }
    // 2. Query param ?tab=users
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (VALID_TABS.includes(tabParam)) {
      return tabParam;
    }
    // 3. Saved in localStorage
    const saved = localStorage.getItem('reeco_admin_active_tab');
    if (VALID_TABS.includes(saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'dashboard';
};

const getInitialProductId = () => {
  try {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash.startsWith('detail')) {
      const query = hash.split('?')[1] || '';
      const params = new URLSearchParams(query);
      const id = params.get('id');
      if (id) return id;
    }
    return localStorage.getItem('reeco_admin_selected_product') || null;
  } catch {
    return null;
  }
};

export function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [currentTab, setCurrentTab] = useState(getInitialTab);
  const [selectedProductId, setSelectedProductId] = useState(getInitialProductId);

  // Products from API
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  // Stats derived from API products
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0 });

  // Recent import results from the last POST /admin/import
  const [lastImportReport, setLastImportReport] = useState(() => {
    try {
      const raw = localStorage.getItem('reeco_admin_last_import');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Sync hash and storage when tab or selectedProductId changes
  useEffect(() => {
    if (currentUser) {
      if (currentTab === 'detail' && selectedProductId) {
        window.location.hash = `detail?id=${encodeURIComponent(selectedProductId)}`;
      } else if (window.location.hash.replace('#', '') !== currentTab) {
        window.location.hash = currentTab;
      }
    }

    const handleHashChange = () => {
      const raw = window.location.hash.replace('#', '').trim();
      if (!raw) return;
      const [tabName, query] = raw.split('?');
      if (VALID_TABS.includes(tabName)) {
        setCurrentTab(tabName);
        try {
          localStorage.setItem('reeco_admin_active_tab', tabName);
        } catch {}

        if (tabName === 'detail') {
          const p = new URLSearchParams(query || '');
          const id = p.get('id');
          if (id) {
            setSelectedProductId(id);
            try {
              localStorage.setItem('reeco_admin_selected_product', id);
            } catch {}
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, currentTab, selectedProductId]);

  // ─── Load admin products from API ───────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    if (!currentUser) return;
    setProductsLoading(true);
    setProductsError(null);
    const result = await getAdminProductsApi({ limit: 100 });
    if (result && result.error) {
      setProductsError(result.message || 'Không thể tải sản phẩm.');
      if (result.error === 'unauthorized') {
        showToast('error', 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setCurrentUser(null);
        logoutAdminApi();
      }
    } else if (result && result.items) {
      const mapped = result.items.map((p) => ({
        id: p.product_id,
        model: p.model,
        name: p.name_en || p.name_vi || p.model,
        category: p.category || 'Sensors',
        subcategory: p.subcategory || 'General',
        deviceType: p.device_type || 'Sensor',
        status: p.status === 'active' ? 'Active' : 'Review',
      }));
      setProducts(mapped);
      setStats({
        totalProducts: mapped.length,
        activeProducts: mapped.filter((x) => x.status === 'Active').length,
      });
    }
    setProductsLoading(false);
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser) {
      loadProducts();
    }
  }, [currentUser, loadProducts]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast('success', `Chào mừng ${user.email} quay trở lại!`);
  };

  const handleLogout = () => {
    logoutAdminApi();
    setCurrentUser(null);
    try {
      localStorage.removeItem('reeco_admin_active_tab');
      localStorage.removeItem('reeco_admin_selected_product');
    } catch {}
    window.location.hash = '';
    showToast('info', 'Đã đăng xuất thành công.');
  };

  const handleSelectTab = (tab) => {
    setCurrentTab(tab);
    try {
      localStorage.setItem('reeco_admin_active_tab', tab);
      if (tab !== 'detail') {
        localStorage.removeItem('reeco_admin_selected_product');
      }
    } catch {}
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetail = (model) => {
    setSelectedProductId(model);
    setCurrentTab('detail');
    try {
      localStorage.setItem('reeco_admin_active_tab', 'detail');
      localStorage.setItem('reeco_admin_selected_product', model);
    } catch {}
    window.location.hash = `detail?id=${encodeURIComponent(model)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProducts = () => {
    handleSelectTab('products');
  };

  // Called by ProductImportView when import completes (success or error)
  const handleImportComplete = (report) => {
    setLastImportReport(report);
    try {
      localStorage.setItem('reeco_admin_last_import', JSON.stringify(report));
    } catch {
      // ignore
    }
    if (report.success) {
      showToast('success', 'Import hoàn tất! Đang cập nhật danh sách sản phẩm...');
      loadProducts(); // Refresh product list after successful import
    }
  };

  // Auth Guard: If not logged in, render LoginView
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-app">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {currentTab === 'dashboard' && (
        <DashboardView
          stats={stats}
          lastImportReport={lastImportReport}
          onSelectProduct={handleViewDetail}
        />
      )}

      {currentTab === 'products' && (
        <ProductManagementView
          products={products}
          isLoading={productsLoading}
          error={productsError}
          onViewDetail={handleViewDetail}
          onRefresh={loadProducts}
        />
      )}

      {currentTab === 'detail' && (
        <AdminProductDetailView
          productId={selectedProductId}
          onBack={handleBackToProducts}
        />
      )}

      {currentTab === 'import' && (
        <ProductImportView onImportComplete={handleImportComplete} />
      )}

      {currentTab === 'users' && <UserManagementView />}

      {currentTab === 'orders' && <OrderManagementView />}

      {currentTab === 'reports' && <ReportsAnalyticsView />}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;

