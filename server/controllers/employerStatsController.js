import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getEmployerStats = asyncHandler(async (req, res) => {
  const employerId = req.user._id;

  const myJobs = await Job.find({ createdBy: employerId }).select('_id status');
  const myJobIds = myJobs.map((j) => j._id);

  const totalJobs = myJobs.length;
  const activeJobs = myJobs.filter((j) => j.status === 'active').length;
  const closedJobs = myJobs.filter((j) => j.status === 'closed').length;

  const totalApplications = await Application.countDocuments({ job: { $in: myJobIds } });

  const statusCounts = await Application.aggregate([
    { $match: { job: { $in: myJobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts = ['Pending', 'Reviewed', 'Accepted', 'Rejected'].reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});
  statusCounts.forEach(({ _id, count }) => {
    counts[_id] = count;
  });

  const company = await Company.findOne({ owner: employerId }).select('ratingAverage ratingCount');

  const perJobRaw = await Application.aggregate([
    { $match: { job: { $in: myJobIds } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  const jobTitleMap = await Job.find({ _id: { $in: perJobRaw.map((p) => p._id) } }).select('title');
  const titleLookup = jobTitleMap.reduce((acc, j) => {
    acc[j._id.toString()] = j.title;
    return acc;
  }, {});
  const applicationsPerJob = perJobRaw
    .map((p) => ({ job: titleLookup[p._id.toString()] || 'Untitled', count: p.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  res.status(200).json({
    success: true,
    stats: {
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      pending: counts.Pending,
      reviewed: counts.Reviewed,
      accepted: counts.Accepted,
      rejected: counts.Rejected,
      ratingAverage: company?.ratingAverage || 0,
      ratingCount: company?.ratingCount || 0,
    },
    applicationsPerJob,
  });
});
