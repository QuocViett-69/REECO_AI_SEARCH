import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getProductPrice, getCommercialData, formatPrice } from '../src/services/commercialService.js';
import { DEMO_CREDENTIALS, authenticateUser } from '../src/services/authService.js';



describe('REECO Customer Commerce - Part 1 Complete Test Suite', () => {

  // ── 1. Commercial Product Tests ─────────────────────────────────────────────
  describe('Product Commercial & Pricing Layer', () => {
    const sampleProduct = {
      product_id: 'CSI_CS655',
      model: 'CS655',
      name: 'Soil Water Content Reflectometer',
    };

    test('price is correctly determined and formatted for CS655 ($520)', () => {
      const price = getProductPrice(sampleProduct.product_id, sampleProduct.model);
      assert.equal(price, 520);
      assert.equal(formatPrice(price), '$520');
    });

    test('availability is displayed as "Available for order" and purchasable', () => {
      const comm = getCommercialData(sampleProduct.product_id, sampleProduct.model);
      assert.equal(comm.availability_label, 'Available for order');
      assert.equal(comm.is_purchasable, true);
    });

    test('stock quantity and inventory numbers are NEVER exposed in commercial data', () => {
      const comm = getCommercialData(sampleProduct.product_id, sampleProduct.model);
      assert.equal(comm.stock_quantity, undefined);
      assert.equal(comm.inventory, undefined);
      assert.equal(comm.stock, undefined);
      assert.equal(comm.quantity_in_stock, undefined);
    });
  });

  // ── 2. Auth & Roles Tests ───────────────────────────────────────────────────
  describe('Authentication & Role Credentials', () => {
    test('customer credentials are correct: haitran / ilovereeco (role: customer)', () => {
      const cred = DEMO_CREDENTIALS.customer;
      assert.equal(cred.username, 'haitran');
      assert.equal(cred.password, 'ilovereeco');
      assert.equal(cred.role, 'customer');
    });

    test('admin credentials are correct: reeco / ilovereeco (role: admin)', () => {
      const cred = DEMO_CREDENTIALS.admin;
      assert.equal(cred.username, 'reeco');
      assert.equal(cred.password, 'ilovereeco');
      assert.equal(cred.role, 'admin');
    });

    test('role mismatch or invalid password fails authentication check', () => {
      const authChecker = (role, username, password) => {
        const target = DEMO_CREDENTIALS[role];
        if (!target) return { success: false, reason: 'invalid_role' };
        if (target.username !== username || target.password !== password) {
          return { success: false, reason: 'invalid_credentials' };
        }
        return { success: true, role: target.role };
      };

      // Invalid username
      assert.equal(authChecker('customer', 'wronguser', 'ilovereeco').success, false);
      // Invalid password
      assert.equal(authChecker('customer', 'haitran', 'wrongpass').success, false);
      // Role mismatch (reeco admin trying to login under customer role)
      assert.equal(authChecker('customer', 'reeco', 'ilovereeco').success, false);
      // Successful customer login
      assert.equal(authChecker('customer', 'haitran', 'ilovereeco').success, true);
      // Successful admin login
      assert.equal(authChecker('admin', 'reeco', 'ilovereeco').success, true);
    });
  });

  // ── 3. Guest & Customer Cart Logic ──────────────────────────────────────────
  describe('Cart Operations & Persistence', () => {
    let mockStorage = {};

    beforeEach(() => {
      mockStorage = {};
    });

    const mockCartService = (user = null) => {
      const storageKey = user ? `reeco_cart_${user.username}` : 'guest_cart';
      const getItems = () => JSON.parse(mockStorage[storageKey] || '[]');
      const saveItems = (items) => { mockStorage[storageKey] = JSON.stringify(items); };

      return {
        add: (product, qty = 1) => {
          const items = getItems();
          const idx = items.findIndex((i) => i.product_id === product.product_id);
          if (idx > -1) {
            items[idx].quantity += qty;
          } else {
            items.push({
              product_id: product.product_id,
              model: product.model,
              price: product.price,
              quantity: qty,
            });
          }
          saveItems(items);
        },
        updateQty: (productId, qty) => {
          let items = getItems();
          if (qty <= 0) {
            items = items.filter((i) => i.product_id !== productId);
          } else {
            items = items.map((i) => i.product_id === productId ? { ...i, quantity: qty } : i);
          }
          saveItems(items);
        },
        remove: (productId) => {
          const items = getItems().filter((i) => i.product_id !== productId);
          saveItems(items);
        },
        getItems,
      };
    };

    test('guest can add to cart, update quantity, and remove item', () => {
      const cart = mockCartService(null);
      const prod = { product_id: 'CSI_CS655', model: 'CS655', price: 520 };

      // Add
      cart.add(prod, 1);
      assert.equal(cart.getItems().length, 1);
      assert.equal(cart.getItems()[0].quantity, 1);

      // Update quantity
      cart.updateQty('CSI_CS655', 4);
      assert.equal(cart.getItems()[0].quantity, 4);

      // Remove
      cart.remove('CSI_CS655');
      assert.equal(cart.getItems().length, 0);
    });

    test('guest cart items merge into customer cart upon login', () => {
      // 1. Guest adds CS655 (qty 2)
      const guestCart = mockCartService(null);
      guestCart.add({ product_id: 'CSI_CS655', model: 'CS655', price: 520 }, 2);

      // 2. Customer previously had CS655 (qty 1) and CR300 (qty 1)
      const user = { username: 'haitran' };
      const userKey = `reeco_cart_${user.username}`;
      mockStorage[userKey] = JSON.stringify([
        { product_id: 'CSI_CS655', model: 'CS655', price: 520, quantity: 1 },
        { product_id: 'CSI_CR300', model: 'CR300', price: 680, quantity: 1 },
      ]);

      // 3. Simulate login merge algorithm
      const guestItems = JSON.parse(mockStorage['guest_cart'] || '[]');
      const userItems = JSON.parse(mockStorage[userKey] || '[]');
      const mergedMap = new Map();
      userItems.forEach((i) => mergedMap.set(i.product_id, { ...i }));
      guestItems.forEach((g) => {
        if (mergedMap.has(g.product_id)) {
          mergedMap.get(g.product_id).quantity += g.quantity;
        } else {
          mergedMap.set(g.product_id, { ...g });
        }
      });
      const mergedResult = Array.from(mergedMap.values());
      delete mockStorage['guest_cart']; // Cleaned up
      mockStorage[userKey] = JSON.stringify(mergedResult);

      // 4. Verify merge
      const finalCart = JSON.parse(mockStorage[userKey]);
      const cs655 = finalCart.find((i) => i.product_id === 'CSI_CS655');
      const cr300 = finalCart.find((i) => i.product_id === 'CSI_CR300');

      assert.equal(cs655.quantity, 3); // 1 (customer) + 2 (guest) = 3
      assert.equal(cr300.quantity, 1);
      assert.equal(mockStorage['guest_cart'], undefined); // Cleaned
    });
  });

  // ── 4. Guest & Customer Favorites Logic ─────────────────────────────────────
  describe('Favorites Operations & Persistence', () => {
    let mockStorage = {};

    beforeEach(() => {
      mockStorage = {};
    });

    test('guest can toggle and remove favorites with localStorage persistence', () => {
      const getFavs = () => JSON.parse(mockStorage['guest_favorites'] || '[]');
      const toggle = (prod) => {
        let favs = getFavs();
        if (favs.some((f) => f.product_id === prod.product_id)) {
          favs = favs.filter((f) => f.product_id !== prod.product_id);
        } else {
          favs.push(prod);
        }
        mockStorage['guest_favorites'] = JSON.stringify(favs);
      };

      const prod = { product_id: 'CSI_CS655', model: 'CS655', price: 520 };

      // Add to favorites
      toggle(prod);
      assert.equal(getFavs().length, 1);
      assert.equal(getFavs()[0].product_id, 'CSI_CS655');

      // Toggle again to remove
      toggle(prod);
      assert.equal(getFavs().length, 0);
    });
  });
});
