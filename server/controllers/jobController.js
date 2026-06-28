import Job, { CATEGORY_VALUES, EXPERIENCE_LEVEL_VALUES, JOB_TYPE_VALUES } from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    title,
    companyName,
    location,
    category,
    experienceLevel,
    jobType,
    salaryMin,
    salaryMax,
    sort = 'newest',
    page = 1,
    limit = 10,
  } = req.query;

  const query = { status: 'active' };

  if (search) {
    query.$text = { $search: search };
  }

  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (category && CATEGORY_VALUES.includes(category)) {
    query.category = category;
  }

  if (experienceLevel && EXPERIENCE_LEVEL_VALUES.includes(experienceLevel)) {
    query.experienceLevel = experienceLevel;
  }

  if (jobType && JOB_TYPE_VALUES.includes(jobType)) {
    query.jobType = jobType;
  }

  if (salaryMin || salaryMax) {
    query.salaryMax = {};
    if (salaryMin) query.salaryMax.$gte = Number(salaryMin);
  }

  if (companyName) {
    const matchingCompanies = await Company.find({
      companyName: { $regex: companyName, $options: 'i' },
    }).select('_id');
    query.company = { $in: matchingCompanies.map((c) => c._id) };
  }

  const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'companyName logo coverImage location ratingAverage ratingCount')
      .sort(sortOption)
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

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    'company',
    'companyName logo coverImage description website industry location size ratingAverage ratingCount'
  );

  if (!job || job.status === 'removed') {
    res.status(404);
    throw new Error('Job not found');
  }

  Job.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).catch(() => {});

  res.status(200).json({ success: true, job });
});

export const createJob = asyncHandler(async (req, res) => {
  const { title, description, location, company } = req.body;

  if (!title || !description || !location || !company) {
    res.status(400);
    throw new Error('Title, description, location, and company are required');
  }

  const companyDoc = await Company.findById(company);
  if (!companyDoc) {
    res.status(404);
    throw new Error('Company not found');
  }

  if (companyDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only post jobs for a company you own');
  }

  const job = await Job.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Job posted successfully',
    job,
  });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to edit this job');
  }

  if (req.body.company && req.body.company !== job.company.toString()) {
    const companyDoc = await Company.findById(req.body.company);
    if (!companyDoc || (companyDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      res.status(403);
      throw new Error('You can only assign jobs to a company you own');
    }
  }

  Object.assign(job, req.body);
  await job.save();

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    job,
  });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to delete this job');
  }

  await Job.deleteOne({ _id: job._id });
  await Application.deleteMany({ job: job._id });

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
  });
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id })
    .populate('company', 'companyName logo coverImage')
    .sort({ createdAt: -1 });

  const jobIds = jobs.map((j) => j._id);
  const counts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  const jobsWithCounts = jobs.map((job) => ({
    ...job.toObject(),
    applicantCount: countMap[job._id.toString()] || 0,
  }));

  res.status(200).json({ success: true, jobs: jobsWithCounts });
});
