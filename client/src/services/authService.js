import api from './api';

export const authService = {
  register: async (data) => (await api.post('/auth/register', data)).data,
  login: async (data) => (await api.post('/auth/login', data)).data,
  googleLogin: async (credential, role) => (await api.post('/auth/google', { credential, role })).data,
  getMe: async () => (await api.get('/auth/me')).data,
  verifyEmail: async (token) => (await api.post('/auth/verify-email', { token })).data,
  resendVerificationEmail: async () => (await api.post('/auth/resend-verification')).data,
};
