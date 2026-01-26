import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendJobPostedEmail, sendProposalAcceptedEmail } from '../services/emailService.js';

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
    try {
        const {
            category,
            experience,
            budgetMin,
            budgetMax,
            status = 'open',
            search,
            skills,
            location,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Experience filter
        if (experience) {
            query.experience = experience;
        }

        // Budget range filter
        if (budgetMin || budgetMax) {
            query.budget = {};
            if (budgetMin) query.budget.$gte = parseFloat(budgetMin);
            if (budgetMax) query.budget.$lte = parseFloat(budgetMax);
        }

        // Location filter
        if (location) {
            query.location = location;
        }

        // Skills filter
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillsArray };
        }

        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const jobs = await Job.find(query)
            .populate('client', 'name company avatar')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(query);

        res.json({
            success: true,
            data: {
                jobs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs'
        });
    }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('client', 'name company avatar email createdAt')
            .populate('assignedFreelancer', 'name title avatar rating');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Get proposal count
        const proposalCount = await Proposal.countDocuments({ job: job._id });

        res.json({
            success: true,
            data: {
                job: {
                    ...job.toObject(),
                    proposalCount
                }
            }
        });

    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job'
        });
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Client only)
export const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            budget,
            budgetType,
            duration,
            experience,
            skills,
            location
        } = req.body;

        const job = await Job.create({
            title,
            description,
            category,
            budget,
            budgetType: budgetType || 'fixed',
            duration,
            experience: experience || 'Intermediate',
            skills,
            location: location || 'Remote',
            client: req.user._id,
            clientName: req.user.name,
            company: req.user.company || 'Independent Client'
        });

        // Send confirmation email to client
        try {
            await sendJobPostedEmail(req.user.email, req.user.name, job.title);
        } catch (emailError) {
            console.error('Failed to send job posted email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: { job }
        });

    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating job'
        });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job owner only)
export const updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check ownership
        if (job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job'
            });
        }

        // Don't allow updates if job is completed or cancelled
        if (['completed', 'cancelled'].includes(job.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update a ${job.status} job`
            });
        }

        const allowedUpdates = [
            'title', 'description', 'category', 'budget', 'budgetType',
            'duration', 'experience', 'skills', 'location', 'status'
        ];

        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        job = await Job.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('client', 'name company avatar');

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: { job }
        });

    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating job'
        });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job owner or Admin)
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check ownership
        if (job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job'
            });
        }

        // Don't allow deletion if job is in-progress
        if (job.status === 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete an in-progress job'
            });
        }

        // Delete associated proposals
        await Proposal.deleteMany({ job: job._id });

        await Job.findByIdAndDelete(job._id);

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting job'
        });
    }
};

// @desc    Get jobs by client
// @route   GET /api/jobs/client/my-jobs
// @access  Private (Client)
export const getClientJobs = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { client: req.user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const jobs = await Job.find(query)
            .populate('assignedFreelancer', 'name title avatar rating')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(query);

        // Get proposal counts for each job
        const jobsWithProposals = await Promise.all(
            jobs.map(async (job) => {
                const proposalCount = await Proposal.countDocuments({ job: job._id });
                return {
                    ...job.toObject(),
                    proposalCount
                };
            })
        );

        res.json({
            success: true,
            data: {
                jobs: jobsWithProposals,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get client jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs'
        });
    }
};

// @desc    Get job categories with counts
// @route   GET /api/jobs/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Job.aggregate([
            { $match: { status: 'open' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const categoryData = [
            { name: 'Web Development', icon: 'Code' },
            { name: 'Mobile Development', icon: 'Smartphone' },
            { name: 'Design', icon: 'Palette' },
            { name: 'Writing', icon: 'PenTool' },
            { name: 'Marketing', icon: 'TrendingUp' },
            { name: 'Data Science', icon: 'BarChart' },
            { name: 'Video & Animation', icon: 'Video' },
            { name: 'Music & Audio', icon: 'Music' }
        ].map(cat => {
            const found = categories.find(c => c._id === cat.name);
            return { ...cat, count: found ? found.count : 0 };
        });

        res.json({
            success: true,
            data: { categories: categoryData }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
};

// @desc    Assign freelancer to job
// @route   PUT /api/jobs/:id/assign
// @access  Private (Client)
export const assignFreelancer = async (req, res) => {
    try {
        const { freelancerId } = req.body;

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (job.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Job is not open for assignment'
            });
        }

        // Update job
        job.assignedFreelancer = freelancerId;
        job.status = 'in-progress';
        await job.save();

        // Update proposal status
        await Proposal.findOneAndUpdate(
            { job: job._id, freelancer: freelancerId },
            { status: 'accepted', acceptedAt: new Date() }
        );

        // Reject other proposals
        await Proposal.updateMany(
            { job: job._id, freelancer: { $ne: freelancerId }, status: { $nin: ['rejected', 'withdrawn'] } },
            { status: 'rejected', rejectedAt: new Date() }
        );

        // Create notification for freelancer
        await Notification.create({
            user: freelancerId,
            type: 'job_assigned',
            title: 'Job Assigned! 🎉',
            message: `Congratulations! You have been assigned to work on "${job.title}"`,
            relatedJob: job._id,
            actionUrl: `/jobs/${job._id}`
        });

        // Send email notification to freelancer
        try {
            const freelancer = await User.findById(freelancerId);
            if (freelancer && freelancer.email) {
                await sendProposalAcceptedEmail(freelancer.email, freelancer.name, job.title, req.user.name);
            }
        } catch (emailError) {
            console.error('Failed to send job assigned email:', emailError);
        }

        res.json({
            success: true,
            message: 'Freelancer assigned successfully',
            data: { job }
        });

    } catch (error) {
        console.error('Assign freelancer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning freelancer'
        });
    }
};

// @desc    Mark job as completed
// @route   PUT /api/jobs/:id/complete
// @access  Private (Client)
export const completeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (job.status !== 'in-progress') {
            return res.status(400).json({
                success: false,
                message: 'Only in-progress jobs can be marked as completed'
            });
        }

        job.status = 'completed';
        job.completedAt = new Date();
        await job.save();

        // Create notifications
        if (job.assignedFreelancer) {
            await Notification.create({
                user: job.assignedFreelancer,
                type: 'job_completed',
                title: 'Job Completed! 🎉',
                message: `Great work! The job "${job.title}" has been marked as completed.`,
                relatedJob: job._id,
                actionUrl: `/jobs/${job._id}`
            });
        }

        res.json({
            success: true,
            message: 'Job marked as completed',
            data: { job }
        });

    } catch (error) {
        console.error('Complete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing job'
        });
    }
};
