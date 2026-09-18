import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { AdminLayout } from '../components/AdminLayout';
import { PublicLayout } from '../components/PublicLayout';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminProductPage } from '../pages/AdminProductPage';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { ComparePage } from '../pages/ComparePage';
import { ImportPage } from '../pages/ImportPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductPage } from '../pages/ProductPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SearchPage } from '../pages/SearchPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<SearchPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="compare" element={<ComparePage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/:id" element={<AdminProductPage />} />
          <Route path="import" element={<ImportPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
