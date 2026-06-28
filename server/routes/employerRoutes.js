import express from 'express';
import {
  getEmployerApplicants,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { getEmployerStats } from '../controllers/employerStatsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('employer', 'admin'));

router.get('/applicants', getEmployerApplicants);
router.put('/applicants/:id/status', updateApplicationStatus);
router.get('/stats', getEmployerStats);

export default router;
