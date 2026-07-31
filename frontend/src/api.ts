import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://newshub-api.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
# force rebuild Thu Jul 30 23:35:10 PDT 2026
