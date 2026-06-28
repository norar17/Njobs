import express from 'express';
import {
  createCompany,
  getCompany,
  updateCompany,
  getMyCompany,
  uploadCompanyLogo,
  uploadCompanyCoverImage,
} from '../controllers/companyController.js';
import {
  getCompanyReviews,
  createCompanyReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadLogo, uploadCoverImage } from '../middleware/upload.js';
import { uploadLimiter, reviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/me/profile', protect, authorize('employer', 'admin'), getMyCompany);

router.post('/', protect, authorize('employer', 'admin'), createCompany);
router.get('/:id', getCompany);
router.put('/:id', protect, authorize('employer', 'admin'), updateCompany);
router.put('/:id/logo', protect, authorize('employer', 'admin'), uploadLimiter, uploadLogo.single('logo'), uploadCompanyLogo);
router.put('/:id/cover', protect, authorize('employer', 'admin'), uploadLimiter, uploadCoverImage.single('cover'), uploadCompanyCoverImage);

router.get('/:id/reviews', getCompanyReviews);
router.post('/:id/reviews', protect, authorize('applicant'), reviewLimiter, createCompanyReview);

export default router;
