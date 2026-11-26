import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  // Needed later for the refresh-token cookie (Phase 3).
  withCredentials: true,
});

export default api;