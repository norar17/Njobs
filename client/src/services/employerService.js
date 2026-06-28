import api from './api';

export const employerService = {
  getApplicants: async (params) => (await api.get('/employer/applicants', { params })).data,
  updateApplicationStatus: async (id, status) =>
    (await api.put(`/employer/applicants/${id}/status`, { status })).data,
  getStats: async () => (await api.get('/employer/stats')).data,
};
