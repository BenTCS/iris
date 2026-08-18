import React, { createContext, useState, useContext, useEffect } from 'react';

// Mock/fallback local user management replacing the old Base44 SDK dependency
const DEFAULT_USER = {
  id: "user_local_1",
  email: "developer@example.com",
  role: "admin",
  credits: 100,
  created_date: new Date().toISOString(),
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: "iris-local", name: "Iris AI" });

  useEffect(() => {
    // Check local storage for existing session
    try {
      const savedUser = localStorage.getItem('iris_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } else {
        // Default to logged-in mock user for smooth standalone experience
        setUser(DEFAULT_USER);
        setIsAuthenticated(true);
        localStorage.setItem('iris_user', JSON.stringify(DEFAULT_USER));
      }
    } catch (e) {
      setUser(DEFAULT_USER);
      setIsAuthenticated(true);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const checkAppState = async () => {
    setIsLoadingPublicSettings(false);
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      const savedUser = localStorage.getItem('iris_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('iris_user');
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};