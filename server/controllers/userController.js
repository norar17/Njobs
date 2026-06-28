import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { normalizePhoneNumber, isValidE164 } from '../utils/phoneNumber.js';
import { startPhoneVerification, checkPhoneVerification, isSmsServiceConfigured } from '../services/smsService.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, headline, skills } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (headline !== undefined) user.headline = headline;
  if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toSafeObject(),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword) {
    res.status(400);
    throw new Error('Please provide a new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  const hasExistingPassword = !!user.password;

  if (hasExistingPassword) {
    if (!currentPassword) {
      res.status(400);
      throw new Error('Please provide your current password');
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }
  }

  user.password = newPassword;
  if (user.authProvider === 'google' && !hasExistingPassword) {
    user.authProvider = 'google';
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: hasExistingPassword ? 'Password changed successfully' : 'Password created successfully',
    hasPassword: true,
  });
});

export const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    res.status(503);
    throw new Error('Photo upload is not configured on this server.');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('Please select an image to upload');
  }

  const user = await User.findById(req.user._id);
  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile photo updated successfully',
    user: user.toSafeObject(),
  });
});

export const uploadResumeHandler = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    res.status(503);
    throw new Error('Resume upload is not configured on this server.');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('Please select a resume file to upload');
  }

  const user = await User.findById(req.user._id);
  user.resume = {
    url: req.file.path,
    publicId: req.file.filename,
    fileName: req.file.originalname,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully',
    user: user.toSafeObject(),
  });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const user = await User.findById(req.user._id).select('bookmarkedJobs');
  const alreadyBookmarked = user.bookmarkedJobs.some((id) => id.toString() === jobId);

  if (alreadyBookmarked) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarkedJobs: jobId } });
  } else {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarkedJobs: jobId } });
  }

  res.status(200).json({
    success: true,
    message: alreadyBookmarked ? 'Bookmark removed' : 'Job bookmarked',
    bookmarked: !alreadyBookmarked,
  });
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarkedJobs',
    populate: { path: 'company', select: 'companyName logo' },
  });

  res.status(200).json({ success: true, jobs: user.bookmarkedJobs });
});

export const recordRecentlyViewed = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const jobObjectId = new mongoose.Types.ObjectId(jobId);

  await User.updateOne({ _id: req.user._id }, [
    {
      $set: {
        recentlyViewedJobs: {
          $slice: [
            {
              $concatArrays: [
                [{ job: jobObjectId, viewedAt: new Date() }],
                {
                  $filter: {
                    input: '$recentlyViewedJobs',
                    as: 'entry',
                    cond: { $ne: ['$$entry.job', jobObjectId] },
                  },
                },
              ],
            },
            10,
          ],
        },
      },
    },
  ]);

  res.status(200).json({ success: true });
});

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'recentlyViewedJobs.job',
    populate: { path: 'company', select: 'companyName logo' },
  });

  const seenJobIds = new Set();
  const jobs = [];

  for (const entry of user.recentlyViewedJobs) {
    if (!entry.job) continue;
    const jobIdStr = entry.job._id.toString();
    if (seenJobIds.has(jobIdStr)) continue;
    seenJobIds.add(jobIdStr);
    jobs.push({ ...entry.job.toObject(), viewedAt: entry.viewedAt });
  }

  res.status(200).json({ success: true, jobs });
});

export const sendPhoneVerification = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400);
    throw new Error('Please provide a phone number');
  }

  if (!isSmsServiceConfigured) {
    res.status(503);
    throw new Error('Phone verification is not configured on this server.');
  }

  const normalized = normalizePhoneNumber(phone);
  if (!normalized || !isValidE164(normalized)) {
    res.status(400);
    throw new Error('Please enter a valid phone number');
  }

  const existingOwner = await User.findOne({ phone: normalized, _id: { $ne: req.user._id } });
  if (existingOwner) {
    res.status(400);
    throw new Error('This phone number is already linked to another account');
  }

  await startPhoneVerification(normalized);

  res.status(200).json({
    success: true,
    message: "We've sent a 6-digit code to that number. Enter it below to confirm.",
    phone: normalized,
  });
});

export const confirmPhoneVerification = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    res.status(400);
    throw new Error('Please provide the phone number and the code');
  }

  if (!isSmsServiceConfigured) {
    res.status(503);
    throw new Error('Phone verification is not configured on this server.');
  }

  const normalized = normalizePhoneNumber(phone);
  const approved = await checkPhoneVerification(normalized, code);

  if (!approved) {
    res.status(400);
    throw new Error('Incorrect or expired code. Please try again.');
  }

  const existingOwner = await User.findOne({ phone: normalized, _id: { $ne: req.user._id } });
  if (existingOwner) {
    res.status(400);
    throw new Error('This phone number is already linked to another account');
  }

  const user = await User.findById(req.user._id);
  user.phone = normalized;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Phone number verified and saved successfully',
    user: user.toSafeObject(),
  });
});
