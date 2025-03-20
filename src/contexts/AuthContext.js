// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('spotify_tokens'));
    
    if (tokens) {
      const now = new Date();
      
      if (tokens.expiresAt && new Date(tokens.expiresAt) > now) {
        // Token still valid
        setAuth({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (tokens.refreshToken) {
        // Token expired, refresh it
        refreshAccessToken(tokens.refreshToken);
      } else {
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);
  
  // Function to refresh the access token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/refresh`, {
        refresh_token: refreshToken,
      });
      
      const { access_token, expires_in } = response.data;
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
      
      // Update state and local storage
      const newTokens = {
        accessToken: access_token,
        refreshToken,
        expiresAt: expiresAt.toISOString(),
      };
      
      localStorage.setItem('spotify_tokens', JSON.stringify(newTokens));
      
      setAuth({
        ...newTokens,
        isAuthenticated: true,
        isLoading: false,
      });
      
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };
  
  // Login function
  const login = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/login`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  // Set tokens after successful authentication
  const setTokens = (accessToken, refreshToken, expiresIn) => {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(expiresIn));
    
    const tokens = {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
    };
    
    localStorage.setItem('spotify_tokens', JSON.stringify(tokens));
    
    setAuth({
      ...tokens,
      isAuthenticated: true,
      isLoading: false,
    });
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('spotify_tokens');
    setAuth({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = `https://accounts.spotify.com/logout`;

    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };
  
  return (
    <AuthContext.Provider value={{ auth, login, logout, setTokens, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};