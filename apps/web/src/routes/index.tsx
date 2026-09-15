import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { ImportPage } from '../pages/ImportPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { SearchPage } from '../pages/SearchPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/import" element={<ImportPage />} />
      </Route>
    </Routes>
  );
}
