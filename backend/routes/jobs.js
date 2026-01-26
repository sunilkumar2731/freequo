import express from 'express';
import {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    getClientJobs,
    getCategories,
    assignFreelancer,
    completeJob
} from '../controllers/jobController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate, createJobValidation, mongoIdParam, paginationValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, validate, getJobs);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, mongoIdParam('id'), validate, getJobById);

// Client routes
router.post('/', protect, authorize('client'), createJobValidation, validate, createJob);
router.put('/:id', protect, authorize('client', 'admin'), mongoIdParam('id'), validate, updateJob);
router.delete('/:id', protect, authorize('client', 'admin'), mongoIdParam('id'), validate, deleteJob);
router.get('/client/my-jobs', protect, authorize('client'), getClientJobs);
router.put('/:id/assign', protect, authorize('client'), mongoIdParam('id'), validate, assignFreelancer);
router.put('/:id/complete', protect, authorize('client'), mongoIdParam('id'), validate, completeJob);

export default router;
