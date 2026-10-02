import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_CREDENTIALS, signInUser } from '../services/authService';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'reeco_auth_user';

export { DEMO_CREDENTIALS };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored =
        (typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_STORAGE_KEY)) ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(AUTH_STORAGE_KEY));
      if (stored) {
        const saved = JSON.parse(stored);
        if (saved?.token && !saved.token.startsWith('demo-token-')) return saved;
      }

      return null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    try {
      if (user) {
        const serialized = JSON.stringify(user);
        if (typeof localStorage !== 'undefined') localStorage.setItem(AUTH_STORAGE_KEY, serialized);
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
        if (user.token) {
          if (typeof localStorage !== 'undefined') localStorage.setItem('reeco_auth_token', user.token);
          if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('reeco_auth_token', user.token);
        }
      } else {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem('reeco_auth_token');
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
          sessionStorage.removeItem('reeco_auth_token');
        }
      }
    } catch {}
  }, [user]);

  const login = async (role, username, password) => {
    setAuthError(null);
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('reeco_logged_out');
    } catch {}
    const result = await signInUser(role, username, password);

    if (result.success) {
      setUser(result.user);
      return { success: true, user: result.user };
    }

    setAuthError(result.message);
    return { success: false, message: result.message };
  };

  const logout = () => {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('reeco_logged_out', '1');
    } catch {}
    setUser(null);
    setAuthError(null);
  };

  const isAuthenticated = !!user;
  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated,
        isCustomer,
        isAdmin,
        authError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
