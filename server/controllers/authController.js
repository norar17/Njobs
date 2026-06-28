import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import EmailVerification from '../models/EmailVerification.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendVerificationEmail, isEmailServiceConfigured } from '../services/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const generateToken36 = () => crypto.randomBytes(32).toString('hex');

const getClientUrl = () => 
  process.env.CLIENT_URL.split(',')[0].trim();

const dispatchVerificationEmail = async (user) => {
  const token = generateToken36();
  await EmailVerification.create({
    user: user._id,
    tokenHash: hashValue(token),
    expiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
  });

  const verifyUrl = `${getClientUrl()}/verify-email?token=${token}`;

  if (isEmailServiceConfigured) {
    try {
      await sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });
    } catch (err) {
      console.error('Failed to send verification email:', err.message);
    }
  } else {
    console.warn('RESEND_API_KEY not set — verification email not sent. Verify URL:', verifyUrl);
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const allowedRoles = ['applicant', 'employer'];
  const finalRole = allowedRoles.includes(role) ? role : 'applicant';

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with that email already exists');
  }

  const user = await User.create({ name, email, password, role: finalRole, isEmailVerified: false });

  await dispatchVerificationEmail(user);

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toSafeObject(),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error('This account has been suspended. Contact support for help.');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: user.toSafeObject(),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Missing Google credential');
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(503);
    throw new Error('Google sign-in is not configured on this server');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    res.status(401);
    throw new Error('Invalid Google credential');
  }

  if (!payload?.email) {
    res.status(401);
    throw new Error('Google account has no email associated');
  }

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
  });

  if (user) {
    if (!user.googleId) {
      user.googleId = payload.sub;
      user.authProvider = 'google';
      user.isEmailVerified = true;
      await user.save();
    }
  } else {
    const allowedRoles = ['applicant', 'employer'];
    const finalRole = allowedRoles.includes(role) ? role : 'applicant';

    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      authProvider: 'google',
      role: finalRole,
      avatar: payload.picture ? { url: payload.picture, publicId: '' } : undefined,
      isEmailVerified: true,
    });
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error('This account has been suspended. Contact support for help.');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Signed in with Google successfully',
    token,
    user: user.toSafeObject(),
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('Missing verification token');
  }

  const record = await EmailVerification.findOne({
    tokenHash: hashValue(token),
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    res.status(400);
    throw new Error('This verification link is invalid or has expired. Please request a new one.');
  }

  const user = await User.findById(record.user);
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }

  user.isEmailVerified = true;
  await user.save();

  record.used = true;
  await record.save();

  await EmailVerification.deleteMany({ user: user._id, used: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    user: user.toSafeObject(),
  });
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.authProvider === 'google' || user.isEmailVerified) {
    res.status(400);
    throw new Error('This email is already verified');
  }

  await EmailVerification.deleteMany({ user: user._id, used: false });
  await dispatchVerificationEmail(user);

  res.status(200).json({
    success: true,
    message: "We've sent a new verification link to your email.",
  });
});
