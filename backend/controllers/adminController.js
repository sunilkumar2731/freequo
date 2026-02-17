import User from '../models/User.js';
import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { sendAdminToUserEmail } from '../services/emailService.js';

// @desc    Send direct email to user (admin)
// @route   POST /api/admin/users/:id/email
// @access  Private (Admin)
export const adminSendEmail = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.params.id;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Subject and message are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await sendAdminToUserEmail(user.email, user.name, subject, message);

        res.json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        });

    } catch (error) {
        console.error('Admin send email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending email to user'
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;

        const query = { role: { $ne: 'admin' } };

        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// @desc    Update user status (suspend/activate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify admin users'
            });
        }

        user.status = status;
        await user.save();

        // Notify user
        await Notification.create({
            user: user._id,
            type: status === 'suspended' ? 'account_suspended' : 'system',
            title: status === 'suspended' ? 'Account Suspended' : 'Account Activated',
            message: status === 'suspended'
                ? 'Your account has been suspended. Please contact support for more information.'
                : 'Your account has been reactivated. You can now use all features.',
            actionUrl: '/'
        });

        res.json({
            success: true,
            message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully`,
            data: { user }
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status'
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        // Delete user's data
        await Promise.all([
            Job.deleteMany({ client: user._id }),
            Proposal.deleteMany({ freelancer: user._id }),
            Notification.deleteMany({ user: user._id }),
            User.findByIdAndDelete(user._id)
        ]);

        res.json({
            success: true,
            message: 'User and associated data deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private (Admin)
export const getAllJobs = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const jobs = await Job.find(query)
            .populate('client', 'name email')
            .populate('assignedFreelancer', 'name email')
            .sort({ createdAt: -1 })
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
        console.error('Get all jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs'
        });
    }
};

// @desc    Delete job (admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
export const adminDeleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Delete associated proposals
        await Proposal.deleteMany({ job: job._id });
        await Job.findByIdAndDelete(job._id);

        // Notify client
        await Notification.create({
            user: job.client,
            type: 'system',
            title: 'Job Removed',
            message: `Your job "${job.title}" has been removed by an administrator.`,
            actionUrl: '/client/dashboard'
        });

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        console.error('Admin delete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting job'
        });
    }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getPlatformStats = async (req, res) => {
    try {
        const [
            userStats,
            jobStats,
            paymentStats,
            recentSignups,
            topFreelancers,
            recentlyActiveUsers
        ] = await Promise.all([
            // User stats
            User.aggregate([
                { $match: { role: { $ne: 'admin' } } },
                {
                    $group: {
                        _id: { role: '$role', status: '$status' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // Job stats
            Job.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalBudget: { $sum: '$budget' }
                    }
                }
            ]),
            // Payment stats
            Payment.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        platformFees: { $sum: '$platformFee' }
                    }
                }
            ]),
            // Recent signups
            User.find({ role: { $ne: 'admin' } })
                .select('name email role createdAt')
                .sort({ createdAt: -1 })
                .limit(5),
            // Top freelancers
            User.find({ role: 'freelancer' })
                .select('name title rating completedJobs totalEarnings')
                .sort({ rating: -1, completedJobs: -1 })
                .limit(5),
            // Recently active users
            User.find({ lastLogin: { $ne: null } })
                .select('name email role lastLogin')
                .sort({ lastLogin: -1 })
                .limit(5)
        ]);

        res.json({
            success: true,
            data: {
                userStats,
                jobStats,
                paymentStats,
                recentSignups,
                topFreelancers,
                recentlyActive: recentlyActiveUsers,
                activityStats: {
                    activeUsers: await User.countDocuments({ lastLogin: { $ne: null } }),
                    totalLogins: await User.aggregate([{ $group: { _id: null, total: { $sum: "$loginCount" } } }]).then(res => res[0]?.total || 0)

                }
            }
        });

    } catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
};
