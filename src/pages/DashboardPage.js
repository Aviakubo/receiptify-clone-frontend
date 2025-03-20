import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #121212;
  color: white;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Logo = styled.h1`
  color: #1DB954;
  margin: 0;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
`;

const UserImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 0.5rem;
`;

const Button = styled.button`
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.5rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1ed760;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const Card = styled(Link)`
  background-color: #282828;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: white;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1DB954;
`;

const CardDescription = styled.p`
  margin-bottom: 1.5rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #1DB954;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const DashboardPage = () => {
  const { auth, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.accessToken) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("Token available:", auth.accessToken.substring(0, 10) + "...");
        
        // Fetch user profile
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        
        // Validate token first
        const validationResponse = await axios.get(`${API_URL}/api/auth/validate-token`, {
          params: { access_token: auth.accessToken }
        });
        
        console.log("Token validation:", validationResponse.data);
        
        if (!validationResponse.data.valid) {
          setError("Your Spotify session has expired. Please log in again.");
          logout();
          setLoading(false);
          return;
        }
        
        // If token is valid, fetch user profile
        const userResponse = await axios.post(`${API_URL}/api/user-data/profile`, {
          access_token: auth.accessToken
        });
        
        setUserData(userResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(
          error.response?.data?.error || 
          "Failed to fetch your profile data. Please try again."
        );
        setLoading(false);
      }
    };
    
    if (auth.accessToken) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [auth.accessToken, logout]);
  
  // Redirect if not authenticated
  if (!auth.isAuthenticated && !auth.isLoading) {
    return <Navigate to="/login" />;
  }
  
  return (
    <DashboardContainer>
      <Header>
        <Logo>Spotify Analyzer</Logo>
        <NavButtons>
          {userData && (
            <UserInfo>
              {userData.images && userData.images[0] && (
                <UserImage src={userData.images[0].url} alt="Profile" />
              )}
              <span>Hello, {userData.display_name}</span>
            </UserInfo>
          )}
          <Button onClick={logout}>Logout</Button>
        </NavButtons>
      </Header>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ContentGrid>
          <Card to="/analysis">
            <CardTitle>Analyze Your Music Taste</CardTitle>
            <CardDescription>
              Get AI-powered insights about your listening habits and music preferences.
              Discover your top genres, mood tendencies, and hidden gems.
            </CardDescription>
            <Button>Get Analysis</Button>
          </Card>
          
          <Card to="/playlist-generator">
            <CardTitle>Generate Custom Playlists</CardTitle>
            <CardDescription>
              Create personalized playlists based on your listening history and current mood.
              Let AI recommend tracks that match your vibe.
            </CardDescription>
            <Button>Create Playlist</Button>
          </Card>
        </ContentGrid>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;