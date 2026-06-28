import express from 'express';
import {
  updateProfile,
  changePassword,
  uploadAvatarHandler,
  uploadResumeHandler,
  toggleBookmark,
  getBookmarks,
  recordRecentlyViewed,
  getRecentlyViewed,
  sendPhoneVerification,
  confirmPhoneVerification,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadAvatar, uploadResume } from '../middleware/upload.js';
import { passwordLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.put('/password', passwordLimiter, changePassword);
router.put('/avatar', uploadLimiter, uploadAvatar.single('avatar'), uploadAvatarHandler);
router.put('/resume', authorize('applicant'), uploadLimiter, uploadResume.single('resume'), uploadResumeHandler);

router.post('/phone/send-verification', passwordLimiter, sendPhoneVerification);
router.post('/phone/confirm', passwordLimiter, confirmPhoneVerification);

router.get('/bookmarks', authorize('applicant'), getBookmarks);
router.put('/bookmarks/:jobId', authorize('applicant'), toggleBookmark);

router.get('/recently-viewed', getRecentlyViewed);
router.post('/recently-viewed/:jobId', recordRecentlyViewed);

export default router;
