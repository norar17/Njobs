import api from './api';

export const applicationService = {
  apply: async (data) => (await api.post('/applications', data)).data,
  getMine: async (params) => (await api.get('/applications/my', { params })).data,
  withdraw: async (id) => (await api.delete(`/applications/${id}`)).data,
};
