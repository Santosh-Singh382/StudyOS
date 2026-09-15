import api from './api';

export async function getGoals(params = {}) {
  const response = await api.get('/goals', { params });
  return response.data;
}

export async function getGoal(id) {
  const response = await api.get(`/goals/${id}`);
  return response.data;
}

export async function createGoal(data) {
  const response = await api.post('/goals', data);
  return response.data;
}

export async function updateGoal(id, data) {
  const response = await api.put(`/goals/${id}`, data);
  return response.data;
}

export async function deleteGoal(id) {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
}

export async function completeGoal(id) {
  const response = await api.patch(`/goals/${id}/complete`);
  return response.data;
}

export async function uncompleteGoal(id) {
  const response = await api.patch(`/goals/${id}/uncomplete`);
  return response.data;
}

export async function getMilestones(goalId) {
  const response = await api.get(`/goals/${goalId}/milestones`);
  return response.data;
}

export async function createMilestone(goalId, data) {
  const response = await api.post(`/goals/${goalId}/milestones`, data);
  return response.data;
}

export async function updateMilestone(goalId, milestoneId, data) {
  const response = await api.put(`/goals/${goalId}/milestones/${milestoneId}`, data);
  return response.data;
}

export async function deleteMilestone(goalId, milestoneId) {
  const response = await api.delete(`/goals/${goalId}/milestones/${milestoneId}`);
  return response.data;
}

export async function completeMilestone(goalId, milestoneId) {
  const response = await api.patch(`/goals/${goalId}/milestones/${milestoneId}/complete`);
  return response.data;
}

export async function uncompleteMilestone(goalId, milestoneId) {
  const response = await api.patch(`/goals/${goalId}/milestones/${milestoneId}/uncomplete`);
  return response.data;
}