import api from './api';

export async function getJobSearch(params) {
  const { data } = await api.get('/jobs/search', { params });
  return data;
}

export async function getJobDetail(jobId) {
  const { data } = await api.get(`/jobs/${jobId}`);
  return data;
}

export async function getRecommendedJobs() {
  const { data } = await api.get('/jobs/recommended');
  return data;
}

export async function getSavedJobs() {
  const { data } = await api.get('/jobs/saved');
  return data;
}

export async function getEligibleJobs() {
  const { data } = await api.get('/jobs/eligible');
  return data;
}

export async function saveJob(jobId) {
  const { data } = await api.post(`/jobs/${jobId}/save`);
  return data;
}

export async function unsaveJob(jobId) {
  const { data } = await api.delete(`/jobs/${jobId}/save`);
  return data;
}

export async function applyToJob(jobId, formData) {
  const { data } = await api.post(`/jobs/${jobId}/apply`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function getEmployerJobsWithApplicants() {
  const { data } = await api.get('/jobs/my-jobs/applicants');
  return data;
}

export async function createJob(payload) {
  const { data } = await api.post('/jobs', payload);
  return data;
}

export async function getPublicJobs() {
  const { data } = await api.get('/jobs/public');
  return data;
}
