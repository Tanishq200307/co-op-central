import api from './api';

export async function getCompanies(params) {
  const { data } = await api.get('/companies', { params });
  return data;
}

export async function getCompanyBySlug(slug) {
  const { data } = await api.get(`/companies/${slug}`);
  return data;
}

export async function updateCompany(slug, payload) {
  const { data } = await api.put(`/companies/${slug}`, payload);
  return data;
}
