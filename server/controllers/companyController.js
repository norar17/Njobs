import Company from '../models/Company.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const createCompany = asyncHandler(async (req, res) => {
  const { companyName } = req.body;

  if (!companyName) {
    res.status(400);
    throw new Error('Company name is required');
  }

  const company = await Company.create({
    ...req.body,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Company profile created successfully',
    company,
  });
});

export const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  const jobs = await Job.find({ company: company._id, status: 'active' }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, company, jobs });
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to edit this company profile');
  }

  const { ratingAverage, ratingCount, owner, ...allowedUpdates } = req.body;
  Object.assign(company, allowedUpdates);
  await company.save();

  res.status(200).json({
    success: true,
    message: 'Company profile updated successfully',
    company,
  });
});

export const getMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });

  res.status(200).json({ success: true, company: company || null });
});

export const uploadCompanyLogo = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to edit this company profile');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please select a logo image to upload');
  }

  company.logo = { url: req.file.path, publicId: req.file.filename };
  await company.save();

  res.status(200).json({
    success: true,
    message: 'Logo updated successfully',
    company,
  });
});

export const uploadCompanyCoverImage = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to edit this company profile');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please select a cover image to upload');
  }

  company.coverImage = { url: req.file.path, publicId: req.file.filename };
  await company.save();

  res.status(200).json({
    success: true,
    message: 'Cover image updated successfully',
    company,
  });
});
