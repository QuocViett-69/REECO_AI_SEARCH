import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getDisplayPrice, enrichProductWithCommercial, parseStoredItems, CURRENCY, PRICE_UPDATED_EVENT, notifyCommerce } from '../services/commercialService';

const FavoriteContext = createContext(null);

const GUEST_FAVORITES_KEY = 'guest_favorites';

export function FavoriteProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const getStorageKey = useCallback(() => {
    return isAuthenticated && user ? `reeco_favorites_${user.id}` : GUEST_FAVORITES_KEY;
  }, [isAuthenticated, user]);

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
      return stored ? parseStoredItems(stored) : [];
    } catch {
      return [];
    }
  });

  const skipNextSave = useRef(false);
  useEffect(() => {
    const refresh = () => setFavorites(prev => prev.map(item => ({ ...item, price: getDisplayPrice(item) })));
    window.addEventListener(PRICE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PRICE_UPDATED_EVENT, refresh);
  }, []);

  // Load and merge favorites on authentication change
  useEffect(() => {
    if (isAuthenticated && user) {
      const userKey = `reeco_favorites_${user.id}`;
      const savedUserFavorites = localStorage.getItem(userKey);
      const userFavItems = savedUserFavorites ? parseStoredItems(savedUserFavorites) : [];

      const guestFavsRaw = localStorage.getItem(GUEST_FAVORITES_KEY);
      const guestFavItems = guestFavsRaw ? parseStoredItems(guestFavsRaw) : [];

      if (guestFavItems.length > 0) {
        // Merge guest favorites into customer favorites
        const map = new Map();
        userFavItems.forEach((f) => map.set(f.product_id, f));
        guestFavItems.forEach((f) => {
          if (!map.has(f.product_id)) {
            map.set(f.product_id, f);
          }
        });
        const merged = Array.from(map.values());
        setFavorites(merged);
        localStorage.setItem(userKey, JSON.stringify(merged));
        localStorage.removeItem(GUEST_FAVORITES_KEY); // Clean up guest favorites after merge
      } else {
        setFavorites(userFavItems);
      }
    } else {
      // Guest mode
      try {
        const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
        setFavorites(stored ? parseStoredItems(stored) : []);
      } catch {
        setFavorites([]);
      }
    }
    // The save effect below runs in this same commit with the previous key's state; skip
    // that write so it cannot overwrite what was just loaded (StrictMode re-runs this load).
    skipNextSave.current = true;
  }, [isAuthenticated, user]);

  // Save favorites whenever they change
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites, getStorageKey]);

  const isFavorite = (productId) => {
    if (!productId) return false;
    return favorites.some((item) => item.product_id === productId);
  };

  const toggleFavorite = (product) => {
    if (!product) return;
    const enriched = enrichProductWithCommercial(product);
    const productId = enriched.product_id || enriched.id;
    const adding = !favorites.some(item => item.product_id === productId);

    setFavorites((prevFavorites) => {
      const exists = prevFavorites.some((item) => item.product_id === productId);
      if (exists) {
        return prevFavorites.filter((item) => item.product_id !== productId);
      }
      return [
        ...prevFavorites,
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
        },
      ];
    });
    if (adding) notifyCommerce({ type: 'success', title: 'Đã thêm vào mục yêu thích', desc: `Đã thêm sản phẩm ${enriched.model || enriched.name} vào mục yêu thích.` });
  };

  const removeFavorite = (productId) => {
    setFavorites((prevFavorites) => prevFavorites.filter((item) => item.product_id !== productId));
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        favoriteCount: favorites.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorite must be used within a FavoriteProvider');
  }
  return context;
}
