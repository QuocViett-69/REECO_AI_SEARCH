import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getDisplayPrice, enrichProductWithCommercial, parseStoredItems, CURRENCY, PRICE_UPDATED_EVENT, updateProductPrices, notifyCommerce } from '../services/commercialService';
import { getProductDetailApi } from '../services/api';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'guest_cart';

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const getStorageKey = useCallback(() => {
    return isAuthenticated && user ? `reeco_cart_${user.id}` : GUEST_CART_KEY;
  }, [isAuthenticated, user]);

  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      return stored ? parseStoredItems(stored) : [];
    } catch {
      return [];
    }
  });

  const skipNextSave = useRef(false);
  useEffect(() => {
    const refresh = () => setItems(prev => prev.map(item => ({ ...item, price: getDisplayPrice(item) })));
    window.addEventListener(PRICE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PRICE_UPDATED_EVENT, refresh);
  }, []);

  const refreshPrices = useCallback(async (cartItems) => {
    const products = await Promise.all(cartItems.map(item => getProductDetailApi(item.product_id)));
    if (products.some(product => !product || !Number.isFinite(product.price) || product.price <= 0)) {
      throw new Error('Không thể xác nhận giá hiện tại. Vui lòng thử lại trước khi đặt hàng.');
    }
    updateProductPrices(products);
    return cartItems.map(item => ({ ...item, price: getDisplayPrice(item) }));
  }, []);

  // Load items when user changes (guest vs authenticated) & handle merge
  useEffect(() => {
    if (isAuthenticated && user) {
      const userKey = `reeco_cart_${user.id}`;
      const savedUserCart = localStorage.getItem(userKey);
      const userCartItems = savedUserCart ? parseStoredItems(savedUserCart) : [];

      // Check if there are guest items to merge
      const guestCartRaw = localStorage.getItem(GUEST_CART_KEY);
      const guestItems = guestCartRaw ? parseStoredItems(guestCartRaw) : [];

      if (guestItems.length > 0) {
        // Merge guest items into customer cart
        const mergedMap = new Map();
        userCartItems.forEach((item) => mergedMap.set(item.product_id, { ...item }));
        guestItems.forEach((gItem) => {
          if (mergedMap.has(gItem.product_id)) {
            const existing = mergedMap.get(gItem.product_id);
            existing.quantity += gItem.quantity;
          } else {
            mergedMap.set(gItem.product_id, { ...gItem });
          }
        });
        const mergedItems = Array.from(mergedMap.values());
        setItems(mergedItems);
        localStorage.setItem(userKey, JSON.stringify(mergedItems));
        localStorage.removeItem(GUEST_CART_KEY); // Clean up guest cart after merge
      } else {
        setItems(userCartItems);
      }
    } else {
      // Guest mode
      try {
        const stored = localStorage.getItem(GUEST_CART_KEY);
        setItems(stored ? parseStoredItems(stored) : []);
      } catch {
        setItems([]);
      }
    }
    // The save effect below runs in this same commit with the previous key's state; skip
    // that write so it cannot overwrite what was just loaded (StrictMode re-runs this load).
    skipNextSave.current = true;
  }, [isAuthenticated, user]);

  // Save items whenever cart items change
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, getStorageKey]);

  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const enriched = enrichProductWithCommercial(product);
    const productId = enriched.product_id || enriched.id;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product_id === productId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          product_id: productId,
          model: enriched.model,
          name: enriched.name || enriched.name_en || enriched.model,
          category: enriched.category || 'Sensors',
          device_type: enriched.deviceType || enriched.device_type || 'Hardware',
          image: enriched.image || enriched.image_url || null,
          price: enriched.price,
          currency: enriched.currency || CURRENCY,
          availability_label: enriched.availability_label || 'Available for order',
          quantity: qty,
        },
      ];
    });
    notifyCommerce({ type: 'success', title: 'Đã thêm vào giỏ hàng', desc: `Đã thêm sản phẩm ${enriched.model || enriched.name} vào giỏ hàng.` });
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshPrices,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
