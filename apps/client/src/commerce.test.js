import { getProductPrice, getCommercialData, formatPrice } from './services/commercialService';
import { DEMO_CREDENTIALS, authenticateUser } from './services/authService';
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

  // ── 2. Auth & Roles Tests ───────────────────────────────────────────────────
  describe('Authentication & Role Credentials', () => {
    test('customer credentials are correct: haitran / ilovereeco (role: customer)', () => {
      const cred = DEMO_CREDENTIALS.customer;
      expect(cred.username).toBe('haitran');
      expect(cred.password).toBe('ilovereeco');
      expect(cred.role).toBe('customer');
    });

    test('admin credentials are correct: reeco / ilovereeco (role: admin)', () => {
      const cred = DEMO_CREDENTIALS.admin;
      expect(cred.username).toBe('reeco');
      expect(cred.password).toBe('ilovereeco');
      expect(cred.role).toBe('admin');
    });

    test('role mismatch or invalid password fails authentication check', () => {
      expect(authenticateUser('customer', 'wronguser', 'ilovereeco').success).toBe(false);
      expect(authenticateUser('customer', 'haitran', 'wrongpass').success).toBe(false);
      expect(authenticateUser('customer', 'reeco', 'ilovereeco').success).toBe(false);
      expect(authenticateUser('customer', 'haitran', 'ilovereeco').success).toBe(true);
      expect(authenticateUser('admin', 'reeco', 'ilovereeco').success).toBe(true);
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
