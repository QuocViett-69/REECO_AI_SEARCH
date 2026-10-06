import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, refreshSession, updateMe } from '../services/authService';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'reeco_auth_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('reeco_auth_user');
        localStorage.removeItem('reeco_auth_token');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('reeco_auth_user');
        sessionStorage.removeItem('reeco_auth_token');
      }

      const stored =
        (typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_STORAGE_KEY)) ||
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(AUTH_STORAGE_KEY));
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);

  const saveSession = useCallback((newSession) => {
    setSession(newSession);
    try {
      if (newSession) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
        }
      } else {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch {}
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setAuthError(null);
  }, [saveSession]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('reeco:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('reeco:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (!session?.expires_at || !session?.refresh_token) return;

    const checkRefresh = async () => {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at - now < 60) {
        try {
          const newSession = await refreshSession(session.refresh_token);
          saveSession(newSession);
        } catch {
          logout();
        }
      }
    };

    const intervalId = setInterval(checkRefresh, 30000); // Check every 30s
    return () => clearInterval(intervalId);
  }, [session, saveSession, logout]);

  // Sync state if another tab modifies storage or apiFetch interceptor refreshes it
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === AUTH_STORAGE_KEY) {
        if (e.newValue) {
          try {
            setSession(JSON.parse(e.newValue));
          } catch {}
        } else {
          setSession(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const result = await loginUser(email, password);
      if (result.user.role === 'admin') {
        return { success: true, user: result.user, isAdminRedirect: true };
      }
      saveSession(result);
      return { success: true, user: result.user };
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (data) => {
    setAuthError(null);
    try {
      const result = await registerUser(data);
      saveSession(result);
      return { success: true, user: result.user };
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const updateProfile = async (data) => {
    try {
      const updatedUser = await updateMe(data);
      saveSession({ ...session, user: updatedUser });
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, message: err.message || 'Update failed' };
    }
  };

  const user = session?.user || null;
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
        register,
        updateProfile,
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
