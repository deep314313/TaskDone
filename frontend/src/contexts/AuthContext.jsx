import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

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
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/signup', {
        name,
        email,
        password,
        role
      });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/users/me', {
        headers: {
          'x-auth-token': token
        }
      });
      setUser(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Authentication failed');
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    loadUser,
    logout,
    clearError,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};