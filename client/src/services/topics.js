import api from './api';

export async function getTopics({ subject, status, priority, sort } = {}) {
  const params = {};
  if (subject) params.subject = subject;
  if (status) params.status = status;
  if (priority) params.priority = priority;
  if (sort) params.sort = sort;
  const response = await api.get('/topics', { params });
  return response.data;
}

export async function getTopic(id) {
  const response = await api.get(`/topics/${id}`);
  return response.data;
}

export async function createTopic(data) {
  const response = await api.post('/topics', data);
  return response.data;
}

export async function updateTopic(id, data) {
  const response = await api.put(`/topics/${id}`, data);
  return response.data;
}

export async function deleteTopic(id) {
  const response = await api.delete(`/topics/${id}`);
  return response.data;
}