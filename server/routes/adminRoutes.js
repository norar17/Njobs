import express from 'express';
import {
  getAllUsers,
  toggleBanUser,
  deleteUser,
  getAllJobsAdmin,
  removeJobAdmin,
  deleteJobAdmin,
  toggleFlagReview,
  getAllReviewsAdmin,
  getAdminStats,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);

router.get('/jobs', getAllJobsAdmin);
router.put('/jobs/:id/remove', removeJobAdmin);
router.delete('/jobs/:id', deleteJobAdmin);

router.put('/reviews/:id/flag', toggleFlagReview);
router.get('/reviews', getAllReviewsAdmin);

export default router;
