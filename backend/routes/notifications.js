import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    clearAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { validate, mongoIdParam } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.delete('/clear-all', protect, clearAllNotifications);
router.put('/:id/read', protect, mongoIdParam('id'), validate, markAsRead);
router.delete('/:id', protect, mongoIdParam('id'), validate, deleteNotification);

export default router;
