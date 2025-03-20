// src/pages/AuthSuccessPage.js
import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const AuthSuccessPage = () => {
  const { setTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    
    if (accessToken && refreshToken && expiresIn) {
      setTokens(accessToken, refreshToken, expiresIn);
      navigate('/dashboard');
    } else {
      navigate('/login?error=missing_tokens');
    }
  }, [location, setTokens, navigate]);
  
  return (
    <div>
      <h1>Authentication Successful</h1>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
};

export default AuthSuccessPage;