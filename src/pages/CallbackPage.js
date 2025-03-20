// src/pages/CallbackPage.js
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #191414;
  color: white;
`;

const LoadingText = styled.h2`
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #1DB954;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


const CallbackPage = () => {
  const { setTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const error = params.get('error');
    
    // If there's an error or we're already processing, do nothing
    if (error || isProcessing) return;
    
    // If we don't have a code, redirect to login
    if (!code) {
      navigate('/login?error=no_code');
      return;
    }
    
    // Set processing flag to prevent duplicate requests
    setIsProcessing(true);
    
    // Exchange the code for tokens
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    axios.get(`${API_URL}/api/auth/callback`, {
      params: { code }
    })
    .then(response => {
      const { access_token, refresh_token, expires_in } = response.data;
      if (access_token && refresh_token && expires_in) {
        setTokens(access_token, refresh_token, expires_in);
        navigate('/dashboard');
      } else {
        navigate('/login?error=invalid_response');
      }
    })
    .catch(error => {
      console.error('Error in auth callback:', error);
      navigate('/login?error=authentication_failed');
    });
    
  }, [location.search, setTokens, navigate, isProcessing]);
  
  return (
    <LoadingContainer>
      <LoadingText>Authenticating with Spotify...</LoadingText>
      <LoadingSpinner />
    </LoadingContainer>
  );
};

export default CallbackPage;
