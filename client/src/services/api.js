import axios from 'axios';
import { getToken, clearToken } from '../utils/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isAuthEndpoint = /\/auth\/(login|register)$/.test(url);

    if (status === 401 && !isAuthEndpoint) {
      clearToken();
    }

    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Request timed out'
        : 'Unable to reach the server');

    const wrapped = new Error(message);
    wrapped.status = status;
    wrapped.data = error.response?.data;
    return Promise.reject(wrapped);
  }
);

export default api;