import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  googleAuth,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, passwordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/google', authLimiter, googleAuth);
router.get('/me', protect, getMe);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', protect, passwordLimiter, resendVerificationEmail);

export default router;
