import express from 'express';
import {
  applyToJob,
  getMyApplications,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('applicant'), applyToJob);
router.get('/my', authorize('applicant'), getMyApplications);
router.delete('/:id', authorize('applicant'), withdrawApplication);

export default router;
