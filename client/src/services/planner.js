import api from './api';

export async function getPlannerDay(date) {
  const params = date ? { date } : {};
  const response = await api.get('/planner/day', { params });
  return response.data;
}

export async function getPlannerWeek(startDate) {
  const params = startDate ? { startDate } : {};
  const response = await api.get('/planner/week', { params });
  return response.data;
}

export async function getPlannerOverview() {
  const response = await api.get('/planner/overview');
  return response.data;
}