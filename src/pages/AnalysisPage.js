// frontend/src/pages/AnalysisPage.js
import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';
import { llmService } from '../services/api';

const AnalysisPageContainer = styled.div`
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

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  color: #1DB954;
  margin: 0;
`;

const AnalysisContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: #282828;
  border-radius: 8px;
  padding: 2rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 0;
`;

const ReceiptStyle = styled.div`
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  line-height: 1.5;
`;

const AnalysisPage = () => {
    const { auth } = useContext(AuthContext);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                const response = await llmService.analyzeMusicTaste(auth.accessToken);
                setAnalysis(response.data.analysis);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching analysis:', error);
                setError('Failed to analyze your music taste. Please try again later.');
                setLoading(false);
            }
        };

        if (auth.accessToken) {
            fetchAnalysis();
        }
    }, [auth.accessToken]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    // Redirect if not authenticated
    if (!auth.isAuthenticated && !auth.isLoading) {
        return <Navigate to="/login" />;
    }

    return (
        <AnalysisPageContainer>
            <Header>
                <BackButton onClick={() => window.history.back()}>← Back</BackButton>
                <Title>Your Music Analysis</Title>
                <div></div> {/* Empty div for flexbox alignment */}
            </Header>

            <AnalysisContainer>
                {loading ? (
                    <LoadingState>
                        <h2>Analyzing your music taste...</h2>
                        <p>Our AI is processing your Spotify data. This might take a minute.</p>
                    </LoadingState>
                ) : error ? (
                    <div>
                        <h2>Error</h2>
                        <p>{error}</p>
                    </div>
                ) : (
                    <ReceiptStyle>
                        {analysis}
                    </ReceiptStyle>
                )}
            </AnalysisContainer>
        </AnalysisPageContainer>
    );
};

export default AnalysisPage;