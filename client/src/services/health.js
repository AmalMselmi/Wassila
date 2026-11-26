import api from './api.js';

export async function getHealth() {
  const { data } = await api.get('/health');
  return data.data;
}

export async function getReadiness() {
  const { data } = await api.get('/health/ready');
  return data.data;
}