import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth state on mount
    const savedToken = localStorage.getItem('agilify_token');
    const savedUser = localStorage.getItem('agilify_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data; // Since spring boot controller directly returns AuthResponse
      
      setToken(data.token);
      setUser({ id: data.userId, email: data.email, fullName: data.fullName });
      
      localStorage.setItem('agilify_token', data.token);
      localStorage.setItem('agilify_user', JSON.stringify({ id: data.userId, email: data.email, fullName: data.fullName }));
      
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error.response?.data?.message || 'Invalid credentials';
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const response = await api.post('/auth/register', { email, password, fullName });
      const data = response.data;
      
      setToken(data.token);
      setUser({ id: data.userId, email: data.email, fullName: data.fullName });
      
      localStorage.setItem('agilify_token', data.token);
      localStorage.setItem('agilify_user', JSON.stringify({ id: data.userId, email: data.email, fullName: data.fullName }));
      
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agilify_token');
    localStorage.removeItem('agilify_user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
