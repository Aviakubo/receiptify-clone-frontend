import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { llmService, playlistService } from '../services/api';

const Container = styled.div`
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

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: #282828;
  border-radius: 8px;
  padding: 2rem;
`;

const Form = styled.form`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  background-color: #3E3E3E;
  color: white;
  margin-bottom: 1.5rem;
  
  &:focus {
    outline: 2px solid #1DB954;
  }
`;

const Button = styled.button`
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1ed760;
  }
  
  &:disabled {
    background-color: #5a5a5a;
    cursor: not-allowed;
  }
`;

const RecommendationsContainer = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
  margin-bottom: 2rem;
  background-color: #3E3E3E;
  padding: 1.5rem;
  border-radius: 8px;
`;

const TrackListContainer = styled.div`
  margin-top: 2rem;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #3E3E3E;
  margin-bottom: 0.5rem;
  
  &:hover {
    background-color: #4E4E4E;
  }
`;

const TrackCheckbox = styled.input`
  margin-right: 1rem;
  cursor: pointer;
  height: 18px;
  width: 18px;
`;

const TrackInfo = styled.div`
  flex: 1;
`;

const TrackName = styled.div`
  font-weight: bold;
`;

const TrackArtist = styled.div`
  color: #b3b3b3;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background-color: #2ecc71;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
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

const PlaylistGeneratorPage = () => {
  const { auth } = useContext(AuthContext);
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [availableTracks, setAvailableTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');

  useEffect(() => {
    // Reset error message when mood changes
    if (error) setError(null);
  }, [mood]);

  // Redirect if not authenticated
  if (!auth.isAuthenticated && !auth.isLoading) {
    return <Navigate to="/login" />;
  }

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!mood) return;

    setLoading(true);
    setError(null);

    try {
      const response = await llmService.generateMoodPlaylist(auth.accessToken, mood);
      setRecommendations(response.data.recommendations);
      setAvailableTracks(response.data.available_tracks);
      const selectRandomTracks = (tracks, count) => {
        const shuffled = [...tracks].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };
      setSelectedTracks(selectRandomTracks(response.data.available_tracks, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error generating playlist:', error);
      setError('Failed to generate playlist recommendations. Please try again.');
      setLoading(false);
    }
  };

  const handleTrackSelect = (track) => {
    // Toggle track selection
    if (selectedTracks.some(t => t.id === track.id)) {
      setSelectedTracks(selectedTracks.filter(t => t.id !== track.id));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const handleCreatePlaylist = async () => {
    if (selectedTracks.length === 0) {
      setError('Please select at least one track for your playlist.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract playlist name from recommendations
      const lines = recommendations.split('\n');
      let playlistName = `${mood} Playlist`;

      // Try to find a better name in the LLM response
      for (const line of lines) {
        if (line.includes('Playlist Name:') || line.includes('Name:')) {
          const namePart = line.split(':')[1];
          if (namePart && namePart.trim()) {
            playlistName = namePart.trim();
            // Remove quotes if present
            playlistName = playlistName.replace(/["']/g, '');
            break;
          }
        }
      }

      console.log("Creating playlist:", playlistName);

      // Get user ID directly from Spotify API
      let userId = null;
      try {
        // Use axios directly instead of spotifyService
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const userResponse = await axios.post(`${API_URL}/api/user-data/profile`, {
          access_token: auth.accessToken
        });
        console.log("User profile response:", userResponse);
        userId = userResponse.data.id;
      } catch (userError) {
        console.error("Error getting user profile:", userError);
        // We'll let the backend handle userId in this case
      }

      console.log("Playlist creation parameters:", {
        userId,
        playlistName,
        description: `Custom ${mood} playlist generated by Spotify Analyzer`
      });

      console.log("About to send playlist creation request with data:", {
        accessTokenPresent: !!auth.accessToken,
        accessTokenLength: auth.accessToken ? auth.accessToken.length : 0,
        user_id: userId,
        name: playlistName,
        nameLength: playlistName ? playlistName.length : 0,
        description: `Custom ${mood} playlist generated by Spotify Analyzer`
      });

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const playlistResponse = await axios.post(`${API_URL}/api/playlists/create`, {
        access_token: auth.accessToken,
        // user_id: userId,
        name: playlistName,
        description: `Custom ${mood} playlist generated by Spotify Analyzer`,
        public: true
      });

      console.log("Playlist created:", playlistResponse.data);

      // Add tracks to the playlist
      const trackUris = selectedTracks.map(track => track.uri);
      await playlistService.addTracksToPlaylist(
        auth.accessToken,
        playlistResponse.data.playlist_id,
        trackUris
      );

      setPlaylistCreated(true);
      setPlaylistUrl(playlistResponse.data.external_url);
      setLoading(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
      // Changed from 'errorMessage =' to 'let errorMessage ='
      let errorMessage = 'Failed to create playlist. Please try again.';

      // Extract more detailed error message if available
      if (error.response && error.response.data) {
        console.log("Error response data:", error.response.data);
        errorMessage += ` (${error.response.data.error || error.response.data.message || ''})`;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  if (auth.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => window.history.back()}>← Back</BackButton>
        <Title>Mood Playlist Generator</Title>
        <div></div> {/* Empty div for flexbox alignment */}
      </Header>

      <ContentContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {!recommendations && (
          <Form onSubmit={handleMoodSubmit}>
            <Label htmlFor="mood">What mood or vibe are you looking for?</Label>
            <Input
              id="mood"
              type="text"
              placeholder="e.g., Chill study session, Workout energy, Cozy rainy day..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              required
            />
            <div style={{ marginBottom: '1.5rem '}}>
              <Label htmlFor="timeRange">Time period to analyze:</Label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#3E3E3E',
                  color: 'white'
                }}
                >
                <option value="short_term">Recent (4 weeks)</option>
                <option value="medium_term">Last 6 Months</option>
                <option value="long_term">All Time</option>
                </select>
            </div>
            <Button type="submit" disabled={loading || !mood}>
              {loading ? 'Generating...' : 'Generate Playlist'}
            </Button>
          </Form>
        )}

        {loading && <LoadingSpinner />}

        {recommendations && !playlistCreated && (
          <>
            <RecommendationsContainer>
              <h2>Your Custom Playlist Recommendations</h2>
              {recommendations}
            </RecommendationsContainer>

            <TrackListContainer>
              <h3>Select tracks for your playlist</h3>
              <p>Choose from your top tracks that match the {mood} mood:</p>

              {availableTracks.slice(0, 20).map(track => (
                <TrackItem key={track.id} onClick={() => handleTrackSelect(track)}>
                  <TrackCheckbox
                    type="checkbox"
                    checked={selectedTracks.some(t => t.id === track.id)}
                    onChange={() => { }}
                  />
                  <TrackInfo>
                    <TrackName>{track.name}</TrackName>
                    <TrackArtist>{track.artist}</TrackArtist>
                  </TrackInfo>
                </TrackItem>
              ))}

              <Button
                onClick={handleCreatePlaylist}
                disabled={loading || selectedTracks.length === 0}
                style={{ marginTop: '1rem' }}
              >
                Create Spotify Playlist
              </Button>
            </TrackListContainer>
          </>
        )}

        {playlistCreated && (
          <div>
            <SuccessMessage>
              <h3>Playlist Created Successfully!</h3>
              <p>Your new playlist is ready on Spotify.</p>
            </SuccessMessage>
            <Button as="a" href={playlistUrl} target="_blank" rel="noopener noreferrer">
              Open in Spotify
            </Button>
            <Button
              onClick={() => {
                setMood('');
                setRecommendations(null);
                setAvailableTracks([]);
                setSelectedTracks([]);
                setPlaylistCreated(false);
                setPlaylistUrl('');
              }}
              style={{ marginLeft: '1rem', backgroundColor: '#3E3E3E' }}
            >
              Create Another Playlist
            </Button>
          </div>
        )}
      </ContentContainer>
    </Container>
  );
};

export default PlaylistGeneratorPage;