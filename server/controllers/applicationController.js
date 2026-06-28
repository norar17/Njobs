import Application, { APPLICATION_STATUS_VALUES } from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const applyToJob = asyncHandler(async (req, res) => {
  const { job: jobId, coverLetter, resumeUrl } = req.body;

  if (!jobId) {
    res.status(400);
    throw new Error('Job id is required');
  }

  const job = await Job.findById(jobId);
  if (!job || job.status !== 'active') {
    res.status(404);
    throw new Error('This job is no longer accepting applications');
  }

  const finalResumeUrl = resumeUrl || req.user.resume?.url;
  if (!finalResumeUrl) {
    res.status(400);
    throw new Error('Please upload a resume before applying');
  }

  const application = await Application.create({
    applicant: req.user._id,
    job: jobId,
    resumeUrl: finalResumeUrl,
    coverLetter: coverLetter || '',
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    application,
  });
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { applicant: req.user._id };
  if (status && APPLICATION_STATUS_VALUES.includes(status)) {
    query.status = status;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate({
        path: 'job',
        select: 'title location jobType status company',
        populate: { path: 'company', select: 'companyName logo' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Application.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    applications,
  });
});

export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    applicant: req.user._id,
  });

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  await Application.deleteOne({ _id: application._id });

  res.status(200).json({
    success: true,
    message: 'Application withdrawn successfully',
  });
});

export const getEmployerApplicants = asyncHandler(async (req, res) => {
  const { jobId, status, page = 1, limit = 10 } = req.query;

  const myJobs = await Job.find({ createdBy: req.user._id }).select('_id');
  const myJobIds = myJobs.map((j) => j._id);

  const query = { job: { $in: myJobIds } };

  if (jobId) {
    const ownsJob = myJobIds.some((id) => id.toString() === jobId);
    if (!ownsJob) {
      res.status(403);
      throw new Error('You do not have access to applicants for this job');
    }
    query.job = jobId;
  }

  if (status && APPLICATION_STATUS_VALUES.includes(status)) {
    query.status = status;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('applicant', 'name email avatar resume headline skills')
      .populate('job', 'title location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Application.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    applications,
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!APPLICATION_STATUS_VALUES.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${APPLICATION_STATUS_VALUES.join(', ')}`);
  }

  const application = await Application.findById(req.params.id).populate('job', 'createdBy');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to update this application');
  }

  application.status = status;
  await application.save();

  res.status(200).json({
    success: true,
    message: 'Application status updated',
    application,
  });
});
