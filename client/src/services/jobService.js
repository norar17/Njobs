import api from './api';

export const jobService = {
  getAll: async (params) => (await api.get('/jobs', { params })).data,
  getOne: async (id) => (await api.get(`/jobs/${id}`)).data,
  create: async (data) => (await api.post('/jobs', data)).data,
  update: async (id, data) => (await api.put(`/jobs/${id}`, data)).data,
  remove: async (id) => (await api.delete(`/jobs/${id}`)).data,
  getMyJobs: async () => (await api.get('/jobs/employer/mine')).data,
};
