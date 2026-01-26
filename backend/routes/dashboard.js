import express from 'express';
import {
    getClientDashboard,
    getFreelancerDashboard,
    getAdminDashboard
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Dashboard routes (protected by role)
router.get('/client', protect, authorize('client'), getClientDashboard);
router.get('/freelancer', protect, authorize('freelancer'), getFreelancerDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

export default router;
