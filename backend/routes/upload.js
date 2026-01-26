import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    uploadProfileImage as uploadProfileImageStorage,
    uploadJobAttachment as uploadJobAttachmentStorage,
    uploadResume as uploadResumeStorage
} from '../config/cloudinary.js';
import {
    uploadProfileImage,
    uploadJobAttachment,
    uploadResume,
    deleteUpload
} from '../controllers/uploadController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile image upload
router.post('/profile', uploadProfileImageStorage.single('image'), uploadProfileImage);

// Job attachment upload
router.post('/job/:jobId', uploadJobAttachmentStorage.single('file'), uploadJobAttachment);

// Resume upload (freelancers only)
router.post('/resume', uploadResumeStorage.single('resume'), uploadResume);

// Delete upload
router.delete('/', deleteUpload);

export default router;
