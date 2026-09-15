import api from './api';

export async function getStudySessions(filters = {}) {
  const response = await api.get('/study-sessions', { params: filters });
  return response.data;
}

export async function getStudySession(id) {
  const response = await api.get(`/study-sessions/${id}`);
  return response.data;
}

export async function createStudySession(data) {
  const response = await api.post('/study-sessions', data);
  return response.data;
}

export async function getTodayStudySessions() {
  const response = await api.get('/study-sessions/today');
  return response.data;
}

export async function getWeeklyStudySessions() {
  const response = await api.get('/study-sessions/weekly');
  return response.data;
}

export async function pauseStudySession(id) {
  const response = await api.patch(`/study-sessions/${id}/pause`);
  return response.data;
}

export async function resumeStudySession(id) {
  const response = await api.patch(`/study-sessions/${id}/resume`);
  return response.data;
}

export async function completeStudySession(id) {
  const response = await api.patch(`/study-sessions/${id}/complete`);
  return response.data;
}

export async function cancelStudySession(id) {
  const response = await api.patch(`/study-sessions/${id}/cancel`);
  return response.data;
}