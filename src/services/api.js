// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Spotify data services
export const spotifyService = {
  getUserProfile: (accessToken) => {
    return api.post(`/api/user-data/profile`, {
      access_token: accessToken
    });
  },
  
  getTopTracks: (accessToken, timeRange = 'medium_term', limit = 50) => {
    return api.get(`/api/user-data/top-tracks`, {
      params: { access_token: accessToken, time_range: timeRange, limit }
    });
  },
  
  getTopArtists: (accessToken, timeRange = 'medium_term', limit = 20) => {
    return api.get(`/api/user-data/top-artists`, {
      params: { access_token: accessToken, time_range: timeRange, limit }
    });
  },
  
  getRecentlyPlayed: (accessToken, limit = 50) => {
    return api.get(`/api/user-data/recently-played`, {
      params: { access_token: accessToken, limit }
    });
  },
  
  getTracksAudioFeatures: (accessToken, trackIds) => {
    return api.get(`/api/user-data/audio-features`, {
      params: { access_token: accessToken, track_ids: trackIds }
    });
  }
};

// LLM analysis services
export const llmService = {
  analyzeMusicTaste: (accessToken) => {
    return api.post(`/api/llm/analyze-taste`, {
      access_token: accessToken
    });
  },
  
  generateMoodPlaylist: (accessToken, mood) => {
    return api.post(`/api/llm/generate-mood-playlist`, {
      access_token: accessToken,
      mood
    });
  },
  
  searchTracks: (accessToken, query) => {
    return api.get(`/api/llm/search-tracks`, {
      params: { access_token: accessToken, query }
    });
  }
};

// Playlist services
export const playlistService = {
  createPlaylist: (accessToken, userId, name, description, isPublic = true) => {
    return api.post(`/api/playlists/create`, {
      access_token: accessToken,
      user_id: userId,
      name,
      description,
      public: isPublic
    });
  },
  
  addTracksToPlaylist: (accessToken, playlistId, trackUris) => {
    return api.post(`/api/playlists/add-tracks`, {
      access_token: accessToken,
      playlist_id: playlistId,
      track_uris: trackUris
    });
  }
};