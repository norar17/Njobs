import api from './api';

export const adminService = {
  getStats: async () => (await api.get('/admin/stats')).data,
  getUsers: async (params) => (await api.get('/admin/users', { params })).data,
  toggleBanUser: async (id) => (await api.put(`/admin/users/${id}/ban`)).data,
  deleteUser: async (id) => (await api.delete(`/admin/users/${id}`)).data,
  getJobs: async (params) => (await api.get('/admin/jobs', { params })).data,
  removeJob: async (id) => (await api.put(`/admin/jobs/${id}/remove`)).data,
  deleteJob: async (id) => (await api.delete(`/admin/jobs/${id}`)).data,
  toggleFlagReview: async (id) => (await api.put(`/admin/reviews/${id}/flag`)).data,
  getReviews: async (params) => (await api.get('/admin/reviews', { params })).data,
};
