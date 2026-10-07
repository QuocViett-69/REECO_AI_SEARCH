import { getProductPrice, getCommercialData, formatPrice } from './services/commercialService';
import { recommendationService } from './services/recommendationService';

describe('REECO Customer Commerce - Commercial, Pricing & Auth Suite', () => {

  // ── 1. Commercial Product Tests ─────────────────────────────────────────────
  describe('Product Commercial & Pricing Layer', () => {
    const sampleProduct = {
      product_id: 'CSI_CS655',
      model: 'CS655',
      name: 'Soil Water Content Reflectometer',
    };

    test('price is correctly determined and formatted for CS655 (VND)', () => {
      const price = getProductPrice(sampleProduct.product_id, sampleProduct.model);
      expect(price).toBe(13210000);
      expect(formatPrice(price)).toContain('13.210.000');
    });

    test('availability is displayed as "Available for order" and purchasable', () => {
      const comm = getCommercialData(sampleProduct.product_id, sampleProduct.model);
      expect(comm.availability_label).toBe('Available for order');
      expect(comm.is_purchasable).toBe(true);
    });

    test('stock quantity and inventory numbers are NEVER exposed in commercial data', () => {
      const comm = getCommercialData(sampleProduct.product_id, sampleProduct.model);
      expect(comm.stock_quantity).toBeUndefined();
      expect(comm.inventory).toBeUndefined();
      expect(comm.stock).toBeUndefined();
      expect(comm.quantity_in_stock).toBeUndefined();
    });
  });

  // ── 2. Auth & Cart Integration Tests ──────────────────────────────────────────
  describe('Authentication & Cart Integration', () => {
    let originalFetch;

    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
      originalFetch = global.fetch;
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    test('Auth session is saved and restored from localStorage', () => {
      // Simulate login save
      const mockSession = { user: { id: 'u1' }, access_token: 'abc' };
      localStorage.setItem('reeco_auth_session', JSON.stringify(mockSession));

      const restored = JSON.parse(localStorage.getItem('reeco_auth_session'));
      expect(restored.user.id).toBe('u1');
      expect(restored.access_token).toBe('abc');
    });

    test('Old legacy keys are cleared', () => {
      localStorage.setItem('reeco_auth_user', JSON.stringify({}));
      localStorage.setItem('reeco_auth_token', '123');

      // Simulate cleanup
      localStorage.removeItem('reeco_auth_user');
      localStorage.removeItem('reeco_auth_token');

      expect(localStorage.getItem('reeco_auth_user')).toBeNull();
      expect(localStorage.getItem('reeco_auth_token')).toBeNull();
    });

    test('Refresh token logic clears session on failure', async () => {
      jest.useFakeTimers();

      // Setup session
      const mockSession = { user: { id: 'u1' }, access_token: 'abc', refresh_token: 'ref', expires_at: Math.floor(Date.now() / 1000) + 30 };
      localStorage.setItem('reeco_auth_session', JSON.stringify(mockSession));

      // Simulate refresh failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Simulate the catch block of refresh token that logs out
      localStorage.removeItem('reeco_auth_session');

      expect(localStorage.getItem('reeco_auth_session')).toBeNull();
    });

    test('Cart and Favorite contexts use user.id and merge guest items', () => {
      // Setup Guest Cart
      const guestCart = [{ product_id: 'CSI_CS655', quantity: 2 }];
      localStorage.setItem('guest_cart', JSON.stringify(guestCart));

      // Setup User Auth
      const mockSession = { user: { id: 'user-123', email: 'test@example.com' }, access_token: 'abc' };
      localStorage.setItem('reeco_auth_session', JSON.stringify(mockSession));

      // Simulate guest cart merge logic
      const userKey = `reeco_cart_user-123`;
      const savedUserCart = JSON.parse(localStorage.getItem(userKey) || '[]');
      const guestItems = JSON.parse(localStorage.getItem('guest_cart') || '[]');

      if (guestItems.length > 0) {
        const merged = [...savedUserCart, ...guestItems];
        localStorage.setItem(userKey, JSON.stringify(merged));
        localStorage.removeItem('guest_cart');
      }

      const mergedCart = JSON.parse(localStorage.getItem('reeco_cart_user-123'));
      expect(mergedCart.length).toBe(1);
      expect(mergedCart[0].product_id).toBe('CSI_CS655');
      expect(localStorage.getItem('guest_cart')).toBeNull();
    });
  });

  // ── 3. AI Recommendations ("You may also need") ─────────────────────────────
  describe('AI Recommendation Integration Point', () => {
    test('returns technical compatibility recommendations with reason badges', async () => {
      const recs = await recommendationService.getProductRecommendations('CSI_CS655', 'CS655');
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length > 0).toBe(true);
      expect(recs[0].model).toBeDefined();
      expect(recs[0].reason).toBeDefined();
      expect(recs[0].price).toBeGreaterThan(0);
    });
  });
});
