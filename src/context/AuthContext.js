import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_CREDENTIALS, authenticateUser } from '../services/authService';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'reeco_auth_user';

export { DEMO_CREDENTIALS };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (role, username, password) => {
    setAuthError(null);
    const result = authenticateUser(role, username, password);

    if (result.success) {
      setUser(result.user);
      return { success: true, user: result.user };
    }

    setAuthError(result.message);
    return { success: false, message: result.message };
  };

  const logout = () => {
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
