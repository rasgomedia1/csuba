import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (email: string, username: string, password: string, investmentMin?: number, investmentMax?: number) =>
    api.post('/auth/register', { email, username, password, investmentMin, investmentMax }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password })
};

// Auctions
export const auctionsAPI = {
  search: (filters: any) =>
    api.get('/auctions/search', { params: filters }),
  getById: (id: string) =>
    api.get(`/auctions/${id}`),
  getRiskScore: (id: string) =>
    api.post(`/auctions/${id}/risk-score`),
  getWatchlist: (limit?: number, offset?: number) =>
    api.get('/auctions/watchlist/my-list', { params: { limit, offset } }),
  addToWatchlist: (id: string, notes?: string) =>
    api.post(`/auctions/${id}/watchlist`, { notes }),
  removeFromWatchlist: (id: string) =>
    api.delete(`/auctions/${id}/watchlist`)
};

// Users
export const usersAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  updatePreferences: (investmentMin?: number, investmentMax?: number, provincePreferences?: string[], propertyTypePreferences?: string[]) =>
    api.put('/users/preferences', {
      investmentMin,
      investmentMax,
      provincePreferences,
      propertyTypePreferences
    })
};

export default api;
