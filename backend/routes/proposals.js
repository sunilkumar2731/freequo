import express from 'express';
import {
    createProposal,
    getProposalsForJob,
    getMyProposals,
    updateProposalStatus,
    withdrawProposal,
    checkIfApplied
} from '../controllers/proposalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, createProposalValidation, mongoIdParam } from '../middleware/validation.js';

const router = express.Router();

// Freelancer routes
router.post('/', protect, authorize('freelancer'), createProposalValidation, validate, createProposal);
router.get('/my-proposals', protect, authorize('freelancer'), getMyProposals);
router.get('/check/:jobId', protect, authorize('freelancer'), mongoIdParam('jobId'), validate, checkIfApplied);
router.delete('/:id', protect, authorize('freelancer'), mongoIdParam('id'), validate, withdrawProposal);

// Client routes
router.get('/job/:jobId', protect, authorize('client', 'admin'), mongoIdParam('jobId'), validate, getProposalsForJob);
router.put('/:id/status', protect, authorize('client', 'admin'), mongoIdParam('id'), validate, updateProposalStatus);

export default router;
