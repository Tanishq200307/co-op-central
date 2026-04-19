import api from './api';

export async function getMyStudentProfile() {
  const { data } = await api.get('/students/me');
  return data;
}

export async function updateMyStudentProfile(payload) {
  const { data } = await api.put('/students/me', payload);
  return data;
}

export async function getStudentProfileById(studentId) {
  const { data } = await api.get(`/students/${studentId}`);
  return data;
}
