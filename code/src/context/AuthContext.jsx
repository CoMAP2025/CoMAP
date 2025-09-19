// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, checkAuthStatus } from '../api/login';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 组件加载时检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await checkAuthStatus();
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email) => {
    try {
      await apiLogin(email);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("登录失败:", error);
      setIsLoggedIn(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  const value = {
    isLoggedIn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);