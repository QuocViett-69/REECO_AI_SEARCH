import { Route, Routes } from 'react-router-dom';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { ImportPage } from '../pages/ImportPage';
import { ProductPage } from '../pages/ProductPage';
import { SearchPage } from '../pages/SearchPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/admin/products" element={<AdminProductsPage />} />
      <Route path="/admin/import" element={<ImportPage />} />
    </Routes>
  );
}
