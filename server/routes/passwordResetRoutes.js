import express from 'express';
import {
  requestPasswordResetEmail,
  requestPasswordResetSms,
  verifyResetToken,
  verifyResetCode,
  resetPasswordWithToken,
  resetPasswordWithCode,
} from '../controllers/passwordResetController.js';
import { passwordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/request/email', passwordLimiter, requestPasswordResetEmail);
router.post('/request/sms', passwordLimiter, requestPasswordResetSms);
router.get('/verify/token/:token', verifyResetToken);
router.post('/verify/code', passwordLimiter, verifyResetCode);
router.post('/reset/token', passwordLimiter, resetPasswordWithToken);
router.post('/reset/code', passwordLimiter, resetPasswordWithCode);

export default router;
