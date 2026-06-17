import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('userInfo');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Refresh user profile in background
          const updatedProfile = await api.getProfile();
          setUser(updatedProfile);
          localStorage.setItem('userInfo', JSON.stringify(updatedProfile));
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      
      const { token, ...userInfo } = data;
      setUser(userInfo);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      return userInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await api.register(name, email, password);
      localStorage.setItem('token', data.token);
      
      const { token, ...userInfo } = data;
      setUser(userInfo);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      return userInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const data = await api.updateProfile(profileData);
      localStorage.setItem('token', data.token);
      
      const { token, ...userInfo } = data;
      setUser(userInfo);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      return userInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
