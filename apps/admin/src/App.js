import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductManagementView } from './components/products/ProductManagementView';
import { AdminProductDetailView } from './components/detail/AdminProductDetailView';
import { OrderListView } from './components/orders/OrderListView';
import { OrderDetailView } from './components/orders/OrderDetailView';
import { DataQualityView } from './components/quality/DataQualityView';
import { PaymentOperationsView } from './components/payments/PaymentOperationsView';
import { ClientOperationsView } from './components/clients/ClientOperationsView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { LoginView } from './components/auth/LoginView';
import { ToastContainer } from './components/common/Toast';
import { getAdminProductsApi, getStoredUser, logoutAdminApi } from './services/api';
import { UNAUTHORIZED_EVENT } from './services/http';
import './index.css';

const productPath = (productId) => `/products/${encodeURIComponent(productId)}`;

function RequireAuth({ user, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function LoginRoute({ user, onLoginSuccess }) {
  const location = useLocation();
  const from = location.state?.from;
  const target = from && from.pathname !== '/login' ? `${from.pathname}${from.search || ''}` : '/';
  if (user) {
    return <Navigate to={target} replace />;
  }
  return <LoginView onLoginSuccess={onLoginSuccess} />;
}

function AdminLayout({ user, onLogout }) {
  return (
    <div className="admin-app">
      <Sidebar currentUser={user} onLogout={onLogout} />
      <Outlet />
    </div>
  );
}

function ProductDetailRoute() {
  const { productId } = useParams();
  const navigate = useNavigate();
  return <AdminProductDetailView productId={productId} onBack={() => navigate('/products')} />;
}

export function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [stats, setStats] = useState({ totalProducts: 0, activeProducts: 0 });

  // Result of the last POST /admin/import in this browser tab

  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // http.js clears the session and fires this when a token can no longer be refreshed
  useEffect(() => {
    if (!currentUser) return undefined;
    const handleUnauthorized = () => {
      setCurrentUser(null);
      showToast('error', 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [currentUser, showToast]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    // The API caps a page at 100, and the list/KPIs filter client-side, so fetch every page.
    // ponytail: client-side over the full catalog; switch to server-side q/page if it grows to thousands.
    const result = await getAdminProductsApi({ limit: 100 });
    for (let page = 2; !result.error && page <= (result.pagination.total_pages || 1); page += 1) {
      const next = await getAdminProductsApi({ limit: 100, page });
      if (next.error) Object.assign(result, next);
      else result.items.push(...next.items);
    }
    if (result.error) {
      setProductsError(result.message || 'Không thể tải sản phẩm.');
    } else {
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
  }, []);

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
    navigate('/login', { replace: true });
    showToast('info', 'Đã đăng xuất thành công.');
  };

  const handleViewDetail = (productId) => navigate(productPath(productId));

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginRoute user={currentUser} onLoginSuccess={handleLoginSuccess} />} />
        <Route
          element={
            <RequireAuth user={currentUser}>
              <AdminLayout user={currentUser} onLogout={handleLogout} />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <DashboardView
                stats={stats}
                onNavigateToOrders={(status) => navigate(status ? `/orders?status=${status}` : '/orders')}
              />
            }
          />
          <Route
            path="products"
            element={
              <ProductManagementView
                products={products}
                isLoading={productsLoading}
                error={productsError}
                onViewDetail={handleViewDetail}
                onRefresh={loadProducts}
              />
            }
          />
          <Route path="products/:productId" element={<ProductDetailRoute />} />
          <Route path="orders" element={<OrderListView />} />
          <Route path="orders/:orderId" element={<OrderDetailView />} />
          <Route path="import" element={<Navigate to="/products" replace />} />
          <Route path="quality" element={<DataQualityView onSelectProduct={handleViewDetail} />} />
          <Route path="payments" element={<PaymentOperationsView />} />
          <Route path="clients" element={<ClientOperationsView />} />
          <Route path="reports" element={<ReportsAnalyticsView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default App;
