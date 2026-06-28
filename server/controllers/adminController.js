import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import Review from '../models/Review.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const { flagged, page = 1, limit = 15 } = req.query;

  const query = {};
  if (flagged === 'true') query.isFlagged = true;
  if (flagged === 'false') query.isFlagged = false;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 15, 1);
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('author', 'name email')
      .populate('company', 'companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    reviews,
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 15 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 15, 1);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    users: users.map((u) => u.toSafeObject()),
  });
});

export const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be banned');
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.status(200).json({
    success: true,
    message: user.isBanned ? 'User has been suspended' : 'User has been reinstated',
    user: user.toSafeObject(),
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be deleted');
  }

  if (user.role === 'employer') {
    const companies = await Company.find({ owner: user._id }).select('_id');
    const companyIds = companies.map((c) => c._id);
    const jobs = await Job.find({ company: { $in: companyIds } }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ company: { $in: companyIds } });
    await Review.deleteMany({ company: { $in: companyIds } });
    await Company.deleteMany({ owner: user._id });
  } else {
    await Application.deleteMany({ applicant: user._id });
    await Review.deleteMany({ author: user._id });
  }

  await User.deleteOne({ _id: user._id });

  res.status(200).json({
    success: true,
    message: 'User and associated data deleted successfully',
  });
});

export const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 15 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: 'i' };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 15, 1);
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'companyName')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Job.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: jobs.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    jobs,
  });
});

export const removeJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  job.status = 'removed';
  await job.save();

  res.status(200).json({
    success: true,
    message: 'Job has been removed from public listings',
    job,
  });
});

export const deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  await Application.deleteMany({ job: job._id });
  await Job.deleteOne({ _id: job._id });

  res.status(200).json({
    success: true,
    message: 'Job permanently deleted',
  });
});

export const toggleFlagReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.isFlagged = !review.isFlagged;
  await review.save();

  res.status(200).json({
    success: true,
    message: review.isFlagged ? 'Review flagged and hidden from public view' : 'Review unflagged',
    review,
  });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalApplicants,
    totalEmployers,
    totalJobs,
    activeJobs,
    totalApplications,
    totalCompanies,
    totalReviews,
    unverifiedEmails,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'applicant' }),
    User.countDocuments({ role: 'employer' }),
    Job.countDocuments(),
    Job.countDocuments({ status: 'active' }),
    Application.countDocuments(),
    Company.countDocuments(),
    Review.countDocuments(),
    User.countDocuments({ isEmailVerified: false, authProvider: 'local' }),
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const signupsRaw = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlySignups = [];
  const cursor = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i++) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const match = signupsRaw.find((m) => m._id.year === year && m._id.month === month);
    monthlySignups.push({ month: monthNames[month - 1], signups: match ? match.count : 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalApplicants,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      totalCompanies,
      totalReviews,
      unverifiedEmails,
    },
    monthlySignups,
  });
});
