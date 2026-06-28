import api from './api';

export const messageService = {
  getConversations: async () => (await api.get('/messages/conversations')).data,
  getUnreadCount: async () => (await api.get('/messages/conversations/unread-count')).data,
  openConversation: async (applicationId) =>
    (await api.post(`/messages/conversations/by-application/${applicationId}`)).data,
  getMessages: async (conversationId, params) =>
    (await api.get(`/messages/conversations/${conversationId}/messages`, { params })).data,
  sendMessage: async (conversationId, text) =>
    (await api.post(`/messages/conversations/${conversationId}/messages`, { text })).data,
  sendAttachment: async (conversationId, file, text, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (text) formData.append('text', text);
    return (
      await api.post(`/messages/conversations/${conversationId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (evt) => onProgress(Math.round((evt.loaded * 100) / (evt.total || 1)))
          : undefined,
      })
    ).data;
  },
};
