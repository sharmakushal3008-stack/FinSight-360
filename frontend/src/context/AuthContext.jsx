import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('finsight_token');
      const storedUser = localStorage.getItem('finsight_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('finsight_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid. Clearing credentials.');
          localStorage.removeItem('finsight_token');
          localStorage.removeItem('finsight_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('finsight_token', userData.token);
      localStorage.setItem('finsight_user', JSON.stringify(userData));
      return userData;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const newUser = res.data.data;
      setUser(newUser);
      localStorage.setItem('finsight_token', newUser.token);
      localStorage.setItem('finsight_user', JSON.stringify(newUser));
      return newUser;
    }
  };

  const demoLogin = async () => {
    return login('rm@finsight.demo', 'Demo@123');
  };

  const logout = () => {
    localStorage.removeItem('finsight_token');
    localStorage.removeItem('finsight_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, isAuthenticated: !!user }}>
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
