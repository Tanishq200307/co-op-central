import api from './api';

export async function getMyApplications() {
  const { data } = await api.get('/applications/mine');
  return data;
}

export async function updateApplicationStatus(applicationId, payload) {
  const { data } = await api.patch(
    `/applications/${applicationId}/status`,
    payload
  );
  return data;
}

export async function withdrawApplication(applicationId) {
  const { data } = await api.post(`/applications/${applicationId}/withdraw`);
  return data;
}
