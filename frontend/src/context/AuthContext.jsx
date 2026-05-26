import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('ats_token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('ats_token');
          }
        } catch (error) {
          console.error('[Auth Init Error] Token validation failed:', error.message);
          localStorage.removeItem('ats_token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('ats_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign up handler
  const signup = async (name, email, password, role = 'user') => {
    try {
      const res = await api.post('/auth/signup', { name, email, password, role });
      if (res.success && res.token) {
        localStorage.setItem('ats_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Google OAuth Stub login handler
  const googleLogin = async (googleData) => {
    try {
      const res = await api.post('/auth/google', googleData);
      if (res.success && res.token) {
        localStorage.setItem('ats_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Google Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update Settings
  const updateSettings = async (settings) => {
    try {
      const res = await api.put('/auth/profile/settings', settings);
      if (res.success) {
        setUser(prev => ({
          ...prev,
          settings: res.user.settings
        }));
        return { success: true };
      }
      return { success: false, error: 'Failed to update settings' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('ats_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    googleLogin,
    updateSettings,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
