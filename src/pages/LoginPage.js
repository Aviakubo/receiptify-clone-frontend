// src/pages/LoginPage.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #1DB954 0%, #191414 100%);
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: white;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: white;
  text-align: center;
  max-width: 600px;
`;

const LoginButton = styled.button`
  background-color: white;
  color: #1DB954;
  border: none;
  border-radius: 30px;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LoginPage = () => {
  const { auth, login } = useContext(AuthContext);
  
  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <LoginContainer>
      <Title>Spotify Analyzer</Title>
      <Subtitle>
        Discover insights about your music taste and create custom playlists
        based on your mood and listening history.
      </Subtitle>
      <LoginButton onClick={login}>
        Login with Spotify
      </LoginButton>
    </LoginContainer>
  );
};

export default LoginPage;