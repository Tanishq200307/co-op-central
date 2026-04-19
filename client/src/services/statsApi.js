import api from './api';

export async function getHomeStats() {
  const { data } = await api.get('/stats/home');
  return data;
}
