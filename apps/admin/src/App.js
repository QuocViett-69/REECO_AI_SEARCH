import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductManagementView } from './components/products/ProductManagementView';
import { AdminProductDetailView } from './components/detail/AdminProductDetailView';
import { ProductImportView } from './components/import/ProductImportView';
import { LoginView } from './components/auth/LoginView';
import { ToastContainer } from './components/common/Toast';
import { getAdminProductsApi, getStoredUser, logoutAdminApi } from './services/api';
import './index.css';

export function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(null);

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
    showToast('info', 'Đã đăng xuất thành công.');
  };

  const handleSelectTab = (tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetail = (model) => {
    setSelectedProductId(model);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProducts = () => {
    setCurrentTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;

