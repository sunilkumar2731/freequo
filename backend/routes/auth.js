import express from 'express';
import {
    register,
    login,
    getMe,
    updatePassword,
    logout,
    adminLogin
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, registerValidation, loginValidation } from '../middleware/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// Google / Social login validation (only needs firebaseToken)
const googleLoginValidation = [
    body('firebaseToken').notEmpty().withMessage('Firebase token is required'),
    body('isSocial').equals('true').withMessage('isSocial must be true')
];

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/admin-login', adminLogin);
router.post('/google', login); // No validation middleware — social login handles its own checks


// Protected routes
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.post('/logout', protect, logout);

export default router;
