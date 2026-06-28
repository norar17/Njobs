import express from 'express';
import {
  getMyConversations,
  getOrCreateConversationForApplication,
  getMessages,
  sendMessageHttp,
  uploadAttachmentHttp,
  getUnreadCount,
} from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadChatAttachment } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect, authorize('applicant', 'employer', 'admin'));

router.get('/conversations', getMyConversations);
router.get('/conversations/unread-count', getUnreadCount);
router.post('/conversations/by-application/:applicationId', getOrCreateConversationForApplication);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessageHttp);
router.post('/conversations/:conversationId/attachments', uploadLimiter, uploadChatAttachment.single('file'), uploadAttachmentHttp);

export default router;
