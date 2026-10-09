import React from 'react';
import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppInner } from './App';
import { searchProductsApi } from './services/api';
jest.mock('./services/api', () => ({ searchProductsApi: jest.fn() }));
jest.mock('./components/search/SearchHero', () => ({ SearchHero: ({ onSearch }) => <button onClick={() => onSearch('CS655')}>Search</button> }));
jest.mock('./components/search/SearchResults', () => ({ SearchResults: ({ thread, onEditSearch, onFollowUp, isLoading }) => <div>
  <button onClick={onEditSearch}>Reset</button><button onClick={() => onFollowUp('USB')}>Refine</button>
  <pre data-testid="thread">{JSON.stringify(thread)}</pre><span>{isLoading ? 'loading' : 'ready'}</span>
</div> }));
jest.mock('./components/layout/BackgroundEffects', () => ({ BackgroundEffects: () => null }));
jest.mock('./components/layout/Navbar', () => ({ Navbar: () => null }));
jest.mock('./components/layout/SiteFooter', () => ({ SiteFooter: () => null }));
jest.mock('./components/products/ProductCatalog', () => ({ ProductCatalog: () => null }));
jest.mock('./components/detail/ProductDetail', () => ({ ProductDetail: () => null }));
jest.mock('./components/compare/ProductCompare', () => ({ ProductCompare: () => null }));
jest.mock('./components/common/ProductSelectorModal', () => ({ ProductSelectorModal: () => null }));
jest.mock('./components/common/Toast', () => ({ ToastContainer: () => null }));
jest.mock('./components/auth/LoginPage', () => ({ LoginPage: () => null }));
jest.mock('./components/auth/RegisterPage', () => ({ RegisterPage: () => null }));
jest.mock('./components/commerce/CartPage', () => ({ CartPage: () => null }));
jest.mock('./components/commerce/CheckoutPage', () => ({ CheckoutPage: () => null }));
jest.mock('./components/commerce/OrderSuccessPage', () => ({ OrderSuccessPage: () => null }));
jest.mock('./components/commerce/VnpayReturnPage', () => ({ VnpayReturnPage: () => null }));
jest.mock('./components/account/FavoriteList', () => ({ FavoriteList: () => null }));
jest.mock('./components/account/AccountDashboard', () => ({ AccountDashboard: () => null }));
jest.mock('./components/account/OrderList', () => ({ OrderList: () => null }));
jest.mock('./components/account/OrderDetail', () => ({ OrderDetail: () => null }));
jest.mock('./components/account/NotificationCenter', () => ({ NotificationCenter: () => null }));
jest.mock('./components/account/ProfilePage', () => ({ ProfilePage: () => null }));
beforeEach(() => { searchProductsApi.mockReset(); window.scrollTo = jest.fn(); });
afterEach(cleanup);
const result = (query, id = query) => ({ query, resolved_query: query, mode: 'hybrid', results: [{ product_id: id, model: id, matched_features: ['identity:exact'] }] });
const renderApp = (path = '/') => render(<MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AppInner /></MemoryRouter>);

test('submit and URL synchronization send only one request', async () => {
  searchProductsApi.mockResolvedValue(result('CS655'));
  renderApp();
  fireEvent.click(screen.getByText('Search'));
  await screen.findByText('ready');
  expect(searchProductsApi).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('thread').textContent).toContain('CS655');
});

test('opening a search URL triggers exactly one search', async () => {
  searchProductsApi.mockResolvedValue(result('CS655'));
  renderApp('/search?q=CS655');
  await screen.findByText('ready');
  expect(searchProductsApi).toHaveBeenCalledTimes(1);
});

test('reset invalidates old responses and preserves the new conversation scope', async () => {
  let resolveOld;
  searchProductsApi.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  renderApp();
  fireEvent.click(screen.getByText('Search'));
  fireEvent.click(screen.getByText('Reset'));
  searchProductsApi.mockResolvedValueOnce(result('CS655', 'new-product'));
  fireEvent.click(screen.getByText('Search'));
  await screen.findByText('ready');
  await act(async () => { resolveOld(result('CS655', 'old-product')); });
  expect(screen.getByTestId('thread').textContent).not.toContain('old-product');
  searchProductsApi.mockResolvedValueOnce(result('USB'));
  fireEvent.click(screen.getByText('Refine'));
  await screen.findByText('ready');
  expect(searchProductsApi.mock.calls[2][2].product_ids).toEqual(['new-product']);
});
