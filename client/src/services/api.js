import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Request timed out'
        : 'Unable to reach the server');

    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  }
);

export default api;