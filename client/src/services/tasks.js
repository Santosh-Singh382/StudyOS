import api from './api';

export async function getTasks(filters = {}) {
  const response = await api.get('/tasks', { params: filters });
  return response.data;
}

export async function getTask(id) {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
}

export async function createTask(data) {
  const response = await api.post('/tasks', data);
  return response.data;
}

export async function updateTask(id, data) {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
}

export async function deleteTask(id) {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
}

export async function completeTask(id) {
  const response = await api.patch(`/tasks/${id}/complete`);
  return response.data;
}

export async function uncompleteTask(id) {
  const response = await api.patch(`/tasks/${id}/uncomplete`);
  return response.data;
}