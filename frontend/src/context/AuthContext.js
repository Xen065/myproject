/**
 * ============================================
 * Authentication Context
 * ============================================
 * Manages user authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.me();
        setUser(response.data.user);
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      // Save token and user
      localStorage.setItem('token', token);
      setUser(user);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (username, email, password, fullName) => {
    try {
      setError(null);
      const response = await authAPI.register(username, email, password, fullName);
      const { user, token } = response.data;

      // Save token and user
      localStorage.setItem('token', token);
      setUser(user);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
