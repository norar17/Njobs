import api from './api';

export const companyService = {
  create: async (data) => (await api.post('/company', data)).data,
  getOne: async (id) => (await api.get(`/company/${id}`)).data,
  update: async (id, data) => (await api.put(`/company/${id}`, data)).data,
  getMine: async () => (await api.get('/company/me/profile')).data,
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return (
      await api.put(`/company/${id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  uploadCoverImage: async (id, file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return (
      await api.put(`/company/${id}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  getReviews: async (id, params) => (await api.get(`/company/${id}/reviews`, { params })).data,
  createReview: async (id, data) => (await api.post(`/company/${id}/reviews`, data)).data,
  updateReview: async (reviewId, data) => (await api.put(`/reviews/${reviewId}`, data)).data,
  deleteReview: async (reviewId) => (await api.delete(`/reviews/${reviewId}`)).data,
};
