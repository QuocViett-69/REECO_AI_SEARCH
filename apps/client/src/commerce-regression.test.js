import React, { useEffect, useState } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './context/CartContext';
import { FavoriteProvider, useFavorite } from './context/FavoriteContext';
import { ToastContainer } from './components/common/Toast';
import { CheckoutPage } from './components/commerce/CheckoutPage';
import { getProductDetailApi } from './services/api';
import { orderService } from './services/orderService';
import { updateProductPrices } from './services/commercialService';
const mockAuth = { isAuthenticated: true, user: { id: 'pricing-customer', email: 'customer@example.com' } };
jest.mock('./context/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('./services/api', () => ({ getProductDetailApi: jest.fn() }));
jest.mock('./services/orderService', () => ({
  ...jest.requireActual('./services/orderService'), orderService: { createOrder: jest.fn() },
}));
const product = { product_id: 'price-regression', model: 'Product A', price: 100, currency: 'VND', quantity: 2 };
function Probe() {
  const cart = useCart(), favorites = useFavorite();
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const listener = event => setToasts(prev => [...prev, { id: prev.length, ...event.detail }]);
    window.addEventListener('reeco:commerce-notice', listener);
    return () => window.removeEventListener('reeco:commerce-notice', listener);
  }, []);
  return <><button onClick={() => cart.addToCart(product)}>Add cart</button>
    <button onClick={() => favorites.toggleFavorite(product)}>Favorite</button>
    <output data-testid="subtotal">{cart.cartSubtotal}</output>
    <ToastContainer toasts={toasts} /></>;
}
function wrap(child) { return <CartProvider><FavoriteProvider>{child}</FavoriteProvider></CartProvider>; }
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); jest.clearAllMocks();
  updateProductPrices([{ ...product, price: 100 }]);
  getProductDetailApi.mockResolvedValue({ ...product, price: 200 });
  HTMLElement.prototype.scrollIntoView = jest.fn();
});
test('cart/favorite actions show one product-specific popup, including under StrictMode', async () => {
  render(<React.StrictMode>{wrap(<Probe />)}</React.StrictMode>);
  fireEvent.click(screen.getByText('Add cart'));
  expect(screen.getAllByText('Đã thêm sản phẩm Product A vào giỏ hàng.')).toHaveLength(1);
  fireEvent.click(screen.getByText('Favorite'));
  expect(screen.getAllByText('Đã thêm sản phẩm Product A vào mục yêu thích.')).toHaveLength(1);
  fireEvent.click(screen.getByText('Favorite'));
  expect(screen.getAllByText('Đã thêm sản phẩm Product A vào mục yêu thích.')).toHaveLength(1);
  act(() => updateProductPrices([{ ...product, price: 250 }]));
  expect(screen.getByTestId('subtotal')).toHaveTextContent('250');
});
test('checkout refreshes a saved cart before rendering its final summary, and requires reconfirmation after another price change', async () => {
  localStorage.setItem('reeco_cart_pricing-customer', JSON.stringify([product]));
  sessionStorage.setItem('reeco_checkout_draft', JSON.stringify({ fullName: 'A', email: 'customer@example.com', phone: '0912345678', address: 'Street', city: 'City' }));
  sessionStorage.setItem('reeco_payment_method', 'cod');
  orderService.createOrder.mockResolvedValue({ id: 'test-order' });
  render(wrap(<CheckoutPage />));
  const submit = await screen.findByRole('button', { name: 'Place order (COD)' });
  await waitFor(() => expect(submit).not.toBeDisabled());
  expect(document.querySelector('.cm-item__price').textContent).toContain('400');
  getProductDetailApi.mockResolvedValue({ ...product, price: 300 });
  fireEvent.click(submit);
  expect(await screen.findByRole('alert')).toHaveTextContent('Giá sản phẩm đã được cập nhật');
  expect(document.querySelector('.cm-item__price').textContent).toContain('600');
  expect(orderService.createOrder).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Place order (COD)' }));
  await waitFor(() => expect(orderService.createOrder).toHaveBeenCalledTimes(1));
  expect(orderService.createOrder.mock.calls[0][0].items).toEqual([{ product_id: product.product_id, quantity: 2, expected_unit_price: 300 }]);
});
test('missing required input scrolls and focuses the first invalid field without sending an order', async () => {
  localStorage.setItem('reeco_cart_pricing-customer', JSON.stringify([product]));
  render(wrap(<CheckoutPage />));
  const submit = await screen.findByRole('button', { name: /Place order and pay/ });
  await waitFor(() => expect(submit).not.toBeDisabled());
  fireEvent.click(submit);
  expect(document.activeElement.id).toBe('checkout-fullName');
  expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  expect(orderService.createOrder).not.toHaveBeenCalled();
});
