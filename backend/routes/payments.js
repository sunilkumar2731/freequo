import express from 'express';
import {
    createPayment,
    releasePayment,
    getClientPayments,
    getFreelancerEarnings,
    getAllPayments,
    createRazorpayOrder,
    verifyRazorpayPayment
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, createPaymentValidation, mongoIdParam } from '../middleware/validation.js';

const router = express.Router();

// Razorpay routes
router.post('/create-order', protect, authorize('client'), createRazorpayOrder);
router.post('/verify', protect, authorize('client'), verifyRazorpayPayment);

// Client routes
router.post('/', protect, authorize('client'), createPaymentValidation, validate, createPayment);
router.put('/:id/release', protect, authorize('client', 'admin'), mongoIdParam('id'), validate, releasePayment);
router.get('/client', protect, authorize('client'), getClientPayments);

// Freelancer routes
router.get('/freelancer', protect, authorize('freelancer'), getFreelancerEarnings);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllPayments);

export default router;
