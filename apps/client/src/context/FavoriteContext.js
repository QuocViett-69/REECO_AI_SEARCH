import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getProductPrice, enrichProductWithCommercial } from '../services/commercialService';

const FavoriteContext = createContext(null);

const GUEST_FAVORITES_KEY = 'guest_favorites';

export function FavoriteProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const getStorageKey = useCallback(() => {
    return isAuthenticated && user ? `reeco_favorites_${user.username}` : GUEST_FAVORITES_KEY;
  }, [isAuthenticated, user]);

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load and merge favorites on authentication change
  useEffect(() => {
    if (isAuthenticated && user) {
      const userKey = `reeco_favorites_${user.username}`;
      const savedUserFavorites = localStorage.getItem(userKey);
      const userFavItems = savedUserFavorites ? JSON.parse(savedUserFavorites) : [];

      const guestFavsRaw = localStorage.getItem(GUEST_FAVORITES_KEY);
      const guestFavItems = guestFavsRaw ? JSON.parse(guestFavsRaw) : [];

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
        setFavorites(stored ? JSON.parse(stored) : []);
      } catch {
        setFavorites([]);
      }
    }
  }, [isAuthenticated, user]);

  // Save favorites whenever they change
  useEffect(() => {
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
          price: enriched.price || getProductPrice(productId, enriched.model),
          currency: enriched.currency || 'USD',
          availability_label: enriched.availability_label || 'Available for order',
        },
      ];
    });
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
