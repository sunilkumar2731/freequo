import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { sendProposalReceivedEmail, sendProposalSubmittedEmail } from '../services/emailService.js';

// @desc    Create proposal
// @route   POST /api/proposals
// @access  Private (Freelancer)
export const createProposal = async (req, res) => {
    try {
        const { jobId, coverLetter, proposedBudget, proposedDuration, relevantExperience } = req.body;

        // Check if job exists and is open
        const job = await Job.findById(jobId).populate('client', 'name email');
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This job is no longer accepting proposals'
            });
        }

        // Check if already applied
        const existingProposal = await Proposal.findOne({
            job: jobId,
            freelancer: req.user._id
        });

        if (existingProposal) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a proposal for this job'
            });
        }

        // Create proposal
        const proposal = await Proposal.create({
            job: jobId,
            freelancer: req.user._id,
            coverLetter,
            proposedBudget,
            proposedDuration,
            relevantExperience
        });

        // Update job applicants count
        await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

        // Create notification for client
        await Notification.create({
            user: job.client._id,
            type: 'proposal_received',
            title: 'New Proposal Received',
            message: `${req.user.name} has submitted a proposal for your job "${job.title}"`,
            relatedJob: job._id,
            relatedProposal: proposal._id,
            relatedUser: req.user._id,
            actionUrl: `/jobs/${job._id}`
        });

        // Send email notification to client
        try {
            if (job.client && job.client.email) {
                await sendProposalReceivedEmail(
                    job.client.email,
                    job.client.name,
                    req.user.name,
                    job.title
                );
            }
        } catch (emailError) {
            console.error('Failed to send proposal received email:', emailError);
        }

        // Send confirmation email to freelancer (the one who applied)
        try {
            await sendProposalSubmittedEmail(
                req.user.email,
                req.user.name,
                job.title
            );
        } catch (emailError) {
            console.error('Failed to send proposal submission confirmation:', emailError);
        }

        // Populate and return
        await proposal.populate('freelancer', 'name title avatar rating completedJobs skills hourlyRate');

        res.status(201).json({
            success: true,
            message: 'Proposal submitted successfully',
            data: { proposal }
        });

    } catch (error) {
        console.error('Create proposal error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a proposal for this job'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error submitting proposal'
        });
    }
};

// @desc    Get proposals for a job
// @route   GET /api/proposals/job/:jobId
// @access  Private (Job owner)
export const getProposalsForJob = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const job = await Job.findById(req.params.jobId);
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
                message: 'Not authorized to view these proposals'
            });
        }

        const query = { job: req.params.jobId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const proposals = await Proposal.find(query)
            .populate('freelancer', 'name title avatar rating completedJobs skills hourlyRate bio experience location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Proposal.countDocuments(query);

        res.json({
            success: true,
            data: {
                proposals,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get proposals for job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching proposals'
        });
    }
};

// @desc    Get freelancer's proposals
// @route   GET /api/proposals/my-proposals
// @access  Private (Freelancer)
export const getMyProposals = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { freelancer: req.user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const proposals = await Proposal.find(query)
            .populate({
                path: 'job',
                select: 'title category budget status client company createdAt',
                populate: {
                    path: 'client',
                    select: 'name company avatar'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Proposal.countDocuments(query);

        res.json({
            success: true,
            data: {
                proposals,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get my proposals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching proposals'
        });
    }
};

// @desc    Update proposal status (shortlist/reject)
// @route   PUT /api/proposals/:id/status
// @access  Private (Job owner)
export const updateProposalStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['shortlisted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be shortlisted or rejected'
            });
        }

        const proposal = await Proposal.findById(req.params.id).populate('job');

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: 'Proposal not found'
            });
        }

        // Check job ownership
        if (proposal.job.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Update status
        proposal.status = status;
        if (status === 'shortlisted') {
            proposal.shortlistedAt = new Date();
        } else if (status === 'rejected') {
            proposal.rejectedAt = new Date();
        }
        await proposal.save();

        // Create notification for freelancer
        const notificationType = status === 'shortlisted' ? 'proposal_shortlisted' : 'proposal_rejected';
        const notificationTitle = status === 'shortlisted'
            ? 'You\'ve been shortlisted! 🌟'
            : 'Proposal Update';
        const notificationMessage = status === 'shortlisted'
            ? `Great news! You've been shortlisted for "${proposal.job.title}"`
            : `Your proposal for "${proposal.job.title}" was not selected. Keep applying!`;

        await Notification.create({
            user: proposal.freelancer,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            relatedJob: proposal.job._id,
            relatedProposal: proposal._id,
            actionUrl: `/jobs/${proposal.job._id}`
        });

        await proposal.populate('freelancer', 'name title avatar rating');

        res.json({
            success: true,
            message: `Proposal ${status}`,
            data: { proposal }
        });

    } catch (error) {
        console.error('Update proposal status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating proposal'
        });
    }
};

// @desc    Withdraw proposal
// @route   DELETE /api/proposals/:id
// @access  Private (Proposal owner)
export const withdrawProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id).populate('job', 'title');

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: 'Proposal not found'
            });
        }

        // Check ownership
        if (proposal.freelancer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Can only withdraw pending or shortlisted proposals
        if (!['pending', 'shortlisted'].includes(proposal.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot withdraw a ${proposal.status} proposal`
            });
        }

        proposal.status = 'withdrawn';
        await proposal.save();

        res.json({
            success: true,
            message: 'Proposal withdrawn successfully'
        });

    } catch (error) {
        console.error('Withdraw proposal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error withdrawing proposal'
        });
    }
};

// @desc    Check if already applied to a job
// @route   GET /api/proposals/check/:jobId
// @access  Private (Freelancer)
export const checkIfApplied = async (req, res) => {
    try {
        const proposal = await Proposal.findOne({
            job: req.params.jobId,
            freelancer: req.user._id
        });

        res.json({
            success: true,
            data: {
                hasApplied: !!proposal,
                proposal: proposal || null
            }
        });

    } catch (error) {
        console.error('Check if applied error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking application status'
        });
    }
};
