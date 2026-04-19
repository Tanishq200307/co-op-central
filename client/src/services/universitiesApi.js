import api from './api';

export async function getUniversities() {
  const { data } = await api.get('/universities');
  return data;
}

export async function getUniversityDashboard() {
  const { data } = await api.get('/universities/dashboard');
  return data;
}
