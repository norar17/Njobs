import api from './api';

export const userService = {
  updateProfile: async (data) => (await api.put('/users/profile', data)).data,
  changePassword: async (data) => (await api.put('/users/password', data)).data,
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return (
      await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return (
      await api.put('/users/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  getBookmarks: async () => (await api.get('/users/bookmarks')).data,
  toggleBookmark: async (jobId) => (await api.put(`/users/bookmarks/${jobId}`)).data,
  getRecentlyViewed: async () => (await api.get('/users/recently-viewed')).data,
  recordRecentlyViewed: async (jobId) => (await api.post(`/users/recently-viewed/${jobId}`)).data,
  sendPhoneVerification: async (phone) => (await api.post('/users/phone/send-verification', { phone })).data,
  confirmPhoneVerification: async (phone, code) => (await api.post('/users/phone/confirm', { phone, code })).data,
};
