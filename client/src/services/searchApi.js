import api from './api';

export async function getSuggestions(query) {
  const { data } = await api.get('/search/suggest', {
    params: { q: query },
  });
  return data;
}
