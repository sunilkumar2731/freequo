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

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/admin-login', adminLogin);
router.post('/google', login); // Reuse login for social as it handles firebaseToken


// Protected routes
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.post('/logout', protect, logout);

export default router;
