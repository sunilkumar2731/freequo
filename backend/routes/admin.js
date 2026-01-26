import express from 'express';
import {
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getAllJobs,
    adminDeleteJob,
    getPlatformStats
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, mongoIdParam } from '../middleware/validation.js';
import jobSyncService from '../services/jobSyncService.js';

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/status', mongoIdParam('id'), validate, updateUserStatus);
router.delete('/users/:id', mongoIdParam('id'), validate, deleteUser);

// Job management
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', mongoIdParam('id'), validate, adminDeleteJob);

// Job Sync Management
router.post('/sync-jobs', async (req, res) => {
    try {
        const { categories, limit = 100, removeOld = true } = req.body;
        const result = await jobSyncService.syncJobs({ categories, limit, removeOld });
        res.json({
            success: true,
            message: result.message,
            data: { inserted: result.inserted, updated: result.updated, total: result.total }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to sync jobs', error: error.message });
    }
});

router.get('/sync-stats', async (req, res) => {
    try {
        const stats = await jobSyncService.getSyncStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get sync stats', error: error.message });
    }
});

router.delete('/cleanup-jobs', async (req, res) => {
    try {
        const deletedCount = await jobSyncService.cleanupExpiredJobs();
        res.json({ success: true, message: `Cleaned up ${deletedCount} expired jobs`, deletedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cleanup jobs', error: error.message });
    }
});

// Stats
router.get('/stats', getPlatformStats);

export default router;
