import api from './api';

export async function getDashboard() {
  const response = await api.get('/analytics/dashboard');
  return response.data;
}