import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getMe, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }
    try {
      const res = await getMe();
      const payload = res.data?.data || res.data;
      setUser(payload.user || payload);
      setIsAuthenticated(true);
      setToken(storedToken);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const payload = res.data?.data || res.data;
    if (payload.token) {
      localStorage.setItem('token', payload.token);
      setToken(payload.token);
      setUser(payload.user || payload);
      setIsAuthenticated(true);
    }
    return payload;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    const payload = res.data?.data || res.data;
    if (payload.token) {
      localStorage.setItem('token', payload.token);
      setToken(payload.token);
      setUser(payload.user || payload);
      setIsAuthenticated(true);
    }
    return payload;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
