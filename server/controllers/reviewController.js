import Review from '../models/Review.js';
import Company from '../models/Company.js';
import asyncHandler from '../middleware/asyncHandler.js';

const recalculateCompanyRating = async (companyId) => {
  const stats = await Review.aggregate([
    { $match: { company: companyId } },
    { $group: { _id: '$company', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const ratingAverage = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
  const ratingCount = stats.length > 0 ? stats[0].count : 0;

  await Company.findByIdAndUpdate(companyId, { ratingAverage, ratingCount });
};

export const getCompanyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find({ company: req.params.id, isFlagged: false })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments({ company: req.params.id, isFlagged: false }),
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

export const createCompanyReview = asyncHandler(async (req, res) => {
  const { rating, comment, title, jobTitleAtCompany } = req.body;
  const companyId = req.params.id;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Rating and comment are required');
  }

  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }

  const review = await Review.create({
    company: companyId,
    author: req.user._id,
    rating,
    comment,
    title,
    jobTitleAtCompany,
  });

  await recalculateCompanyRating(companyId);

  const populated = await review.populate('author', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review: populated,
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only edit your own review');
  }

  const { rating, comment, title, jobTitleAtCompany } = req.body;
  if (rating) review.rating = rating;
  if (comment) review.comment = comment;
  if (title !== undefined) review.title = title;
  if (jobTitleAtCompany !== undefined) review.jobTitleAtCompany = jobTitleAtCompany;

  await review.save();
  await recalculateCompanyRating(review.company);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to delete this review');
  }

  const companyId = review.company;
  await Review.deleteOne({ _id: review._id });
  await recalculateCompanyRating(companyId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});
