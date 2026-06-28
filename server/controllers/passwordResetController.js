import crypto from 'crypto';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendPasswordResetEmail, isEmailServiceConfigured } from '../services/emailService.js';
import { startPhoneVerification, checkPhoneVerification, isSmsServiceConfigured } from '../services/smsService.js';
import { normalizePhoneNumber } from '../utils/phoneNumber.js';

const RESET_EXPIRY_MS = 5 * 60 * 1000;

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const generateToken = () => crypto.randomBytes(32).toString('hex');

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();

export const requestPasswordResetEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide your email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    await PasswordReset.deleteMany({ user: user._id, method: 'email', used: false });

    const token = generateToken();
    await PasswordReset.create({
      user: user._id,
      method: 'email',
      tokenHash: hashValue(token),
      expiresAt: new Date(Date.now() + RESET_EXPIRY_MS),
    });

    if (isEmailServiceConfigured) {
      const resetUrl = `${getClientUrl()}/reset-password?token=${token}`;
      try {
        await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
      } catch (err) {
        console.error('Failed to send password reset email:', err.message);
      }
    } else {
      console.warn('RESEND_API_KEY not set — password reset email not sent. Reset URL:', `${getClientUrl()}/reset-password?token=${token}`);
    }
  }

  res.status(200).json({
    success: true,
    message: "If an account exists with that email, we've sent a password reset link to it.",
  });
});

export const requestPasswordResetSms = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400);
    throw new Error('Please provide your phone number');
  }

  if (!isSmsServiceConfigured) {
    res.status(503);
    throw new Error('SMS password reset is not configured on this server.');
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const user = await User.findOne({ phone: normalizedPhone });

  if (user) {
    await PasswordReset.deleteMany({ user: user._id, method: 'sms', used: false });

    await PasswordReset.create({
      user: user._id,
      method: 'sms',
      expiresAt: new Date(Date.now() + RESET_EXPIRY_MS),
    });

    try {
      await startPhoneVerification(normalizedPhone);
    } catch (err) {
      console.error('Failed to send password reset SMS:', err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: "If an account exists with that phone number, we've sent a 6-digit code to it.",
  });
});

export const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const reset = await PasswordReset.findOne({
    tokenHash: hashValue(token),
    method: 'email',
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!reset) {
    res.status(400);
    throw new Error('This reset link is invalid or has expired. Please request a new one.');
  }

  res.status(200).json({ success: true, valid: true });
});

export const verifyResetCode = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    res.status(400);
    throw new Error('Please provide your phone number and the code');
  }

  if (!isSmsServiceConfigured) {
    res.status(503);
    throw new Error('SMS password reset is not configured on this server.');
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired code');
  }

  const reset = await PasswordReset.findOne({
    user: user._id,
    method: 'sms',
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!reset) {
    res.status(400);
    throw new Error('This code is invalid or has expired. Please request a new one.');
  }

  const approved = await checkPhoneVerification(normalizedPhone, code);

  if (!approved) {
    res.status(400);
    throw new Error('Incorrect code. Please try again.');
  }

  res.status(200).json({ success: true, valid: true });
});

export const resetPasswordWithToken = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400);
    throw new Error('Missing reset token or new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const reset = await PasswordReset.findOne({
    tokenHash: hashValue(token),
    method: 'email',
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!reset) {
    res.status(400);
    throw new Error('This reset link is invalid or has expired. Please request a new one.');
  }

  const user = await User.findById(reset.user);
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }

  user.password = newPassword;
  await user.save();

  reset.used = true;
  await reset.save();

  await PasswordReset.deleteMany({ user: user._id, used: false });

  res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

export const resetPasswordWithCode = asyncHandler(async (req, res) => {
  const { phone, code, newPassword } = req.body;

  if (!phone || !code || !newPassword) {
    res.status(400);
    throw new Error('Missing phone, code, or new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  if (!isSmsServiceConfigured) {
    res.status(503);
    throw new Error('SMS password reset is not configured on this server.');
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired code');
  }

  const reset = await PasswordReset.findOne({
    user: user._id,
    method: 'sms',
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!reset) {
    res.status(400);
    throw new Error('This code is invalid or has expired. Please request a new one.');
  }

  const approved = await checkPhoneVerification(normalizedPhone, code);

  if (!approved) {
    res.status(400);
    throw new Error('Incorrect code. Please try again.');
  }

  user.password = newPassword;
  await user.save();

  reset.used = true;
  await reset.save();

  await PasswordReset.deleteMany({ user: user._id, used: false });

  res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
});
