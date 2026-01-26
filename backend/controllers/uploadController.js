import User from '../models/User.js';
import Job from '../models/Job.js';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../config/cloudinary.js';

// @desc    Upload profile image
// @route   POST /api/upload/profile
// @access  Private
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user._id);

        // Delete old avatar from Cloudinary if exists
        if (user.avatar) {
            const publicId = getPublicIdFromUrl(user.avatar);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }

        // Update user with new avatar URL
        user.avatar = req.file.path;
        await user.save();

        res.json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                url: req.file.path,
                user: user
            }
        });

    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile image',
            error: error.message
        });
    }
};

// @desc    Upload job attachment
// @route   POST /api/upload/job/:jobId
// @access  Private (Client only)
export const uploadJobAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check ownership
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to upload to this job'
            });
        }

        // Add attachment to job
        if (!job.attachments) {
            job.attachments = [];
        }

        job.attachments.push({
            url: req.file.path,
            filename: req.file.originalname,
            uploadedAt: new Date()
        });

        await job.save();

        res.json({
            success: true,
            message: 'Job attachment uploaded successfully',
            data: {
                url: req.file.path,
                filename: req.file.originalname
            }
        });

    } catch (error) {
        console.error('Job attachment upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading job attachment',
            error: error.message
        });
    }
};

// @desc    Upload resume/portfolio
// @route   POST /api/upload/resume
// @access  Private (Freelancer only)
export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user._id);

        if (user.role !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: 'Only freelancers can upload resumes'
            });
        }

        // Delete old resume if exists
        if (user.resumeUrl) {
            const publicId = getPublicIdFromUrl(user.resumeUrl);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }

        // Update user with new resume URL
        user.resumeUrl = req.file.path;
        await user.save();

        res.json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                url: req.file.path
            }
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resume',
            error: error.message
        });
    }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload
// @access  Private
export const deleteUpload = async (req, res) => {
    try {
        const { url, type } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        const publicId = getPublicIdFromUrl(url);

        if (publicId) {
            await deleteFromCloudinary(publicId);
        }

        // Update user or job based on type
        if (type === 'avatar') {
            await User.findByIdAndUpdate(req.user._id, { avatar: null });
        } else if (type === 'resume') {
            await User.findByIdAndUpdate(req.user._id, { resumeUrl: null });
        }

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Delete upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
};
