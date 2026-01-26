import express from 'express';
import {
    getFreelancers,
    getUserById,
    updateProfile,
    getClients
} from '../controllers/userController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate, mongoIdParam } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/freelancers', getFreelancers);
router.get('/:id', optionalAuth, mongoIdParam('id'), validate, getUserById);

// Protected routes
router.put('/profile', protect, updateProfile);

// Admin routes
router.get('/admin/clients', protect, authorize('admin'), getClients);

export default router;
