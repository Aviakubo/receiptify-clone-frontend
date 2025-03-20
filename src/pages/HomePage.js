// frontend/src/pages/HomePage.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(180deg, #1DB954 0%, #191414 100%);
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: white;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: white;
  text-align: center;
  max-width: 700px;
`;

const LoginButton = styled.button`
  background-color: #191414;
  color: white;
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

const HomePage = () => {
  const { auth, login } = useContext(AuthContext);
  
  // If already authenticated, redirect to dashboard
  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <HomeContainer>
      <Title>Spotify Analyzer</Title>
      <Subtitle>
        Discover insights about your music taste and create custom playlists
        based on your listening history and mood.
      </Subtitle>
      <LoginButton onClick={login}>
        Login with Spotify
      </LoginButton>
    </HomeContainer>
  );
};

export default HomePage;