import api from './api';

export const passwordResetService = {
  requestEmailReset: async (email) => (await api.post('/password-reset/request/email', { email })).data,
  requestSmsReset: async (phone) => (await api.post('/password-reset/request/sms', { phone })).data,
  verifyToken: async (token) => (await api.get(`/password-reset/verify/token/${token}`)).data,
  verifyCode: async (phone, code) => (await api.post('/password-reset/verify/code', { phone, code })).data,
  resetWithToken: async (token, newPassword) => (await api.post('/password-reset/reset/token', { token, newPassword })).data,
  resetWithCode: async (phone, code, newPassword) => (await api.post('/password-reset/reset/code', { phone, code, newPassword })).data,
};
