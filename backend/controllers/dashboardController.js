import User from '../models/User.js';
import Job from '../models/Job.js';
import Proposal from '../models/Proposal.js';
import Payment from '../models/Payment.js';

// @desc    Get client dashboard stats
// @route   GET /api/dashboard/client
// @access  Private (Client)
export const getClientDashboard = async (req, res) => {
    try {
        const clientId = req.user._id;

        // Get job counts by status
        const [
            activeJobs,
            completedJobs,
            totalJobs,
            totalProposals,
            totalSpent,
            recentJobs
        ] = await Promise.all([
            Job.countDocuments({ client: clientId, status: 'in-progress' }),
            Job.countDocuments({ client: clientId, status: 'completed' }),
            Job.countDocuments({ client: clientId }),
            Proposal.countDocuments({
                job: { $in: await Job.find({ client: clientId }).distinct('_id') }
            }),
            Payment.aggregate([
                { $match: { client: clientId, status: 'released' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Job.find({ client: clientId })
                .populate('assignedFreelancer', 'name avatar rating')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Get proposals received (for open jobs)
        const openJobIds = await Job.find({ client: clientId, status: 'open' }).distinct('_id');
        const proposalsReceived = await Proposal.find({ job: { $in: openJobIds } })
            .populate('freelancer', 'name title avatar rating')
            .populate('job', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                stats: {
                    activeJobs,
                    completedJobs,
                    totalJobs,
                    totalProposals,
                    totalSpent: totalSpent[0]?.total || 0,
                    openJobs: await Job.countDocuments({ client: clientId, status: 'open' })
                },
                recentJobs,
                proposalsReceived
            }
        });

    } catch (error) {
        console.error('Get client dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
};

// @desc    Get freelancer dashboard stats
// @route   GET /api/dashboard/freelancer
// @access  Private (Freelancer)
export const getFreelancerDashboard = async (req, res) => {
    try {
        const freelancerId = req.user._id;

        // Get all stats in parallel
        const [
            activeProjects,
            completedProjects,
            totalProposals,
            pendingProposals,
            shortlistedProposals,
            totalEarnings,
            pendingEarnings,
            recentProposals,
            activeJobs
        ] = await Promise.all([
            Job.countDocuments({ assignedFreelancer: freelancerId, status: 'in-progress' }),
            Job.countDocuments({ assignedFreelancer: freelancerId, status: 'completed' }),
            Proposal.countDocuments({ freelancer: freelancerId }),
            Proposal.countDocuments({ freelancer: freelancerId, status: 'pending' }),
            Proposal.countDocuments({ freelancer: freelancerId, status: 'shortlisted' }),
            Payment.aggregate([
                { $match: { freelancer: freelancerId, status: 'released' } },
                { $group: { _id: null, total: { $sum: '$freelancerAmount' } } }
            ]),
            Payment.aggregate([
                { $match: { freelancer: freelancerId, status: 'escrow' } },
                { $group: { _id: null, total: { $sum: '$freelancerAmount' } } }
            ]),
            Proposal.find({ freelancer: freelancerId })
                .populate({
                    path: 'job',
                    select: 'title category budget status',
                    populate: { path: 'client', select: 'name company' }
                })
                .sort({ createdAt: -1 })
                .limit(5),
            Job.find({ assignedFreelancer: freelancerId, status: 'in-progress' })
                .populate('client', 'name company avatar')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Get user's profile data
        const user = await User.findById(freelancerId);

        res.json({
            success: true,
            data: {
                stats: {
                    activeProjects,
                    completedProjects,
                    totalProposals,
                    pendingProposals,
                    shortlistedProposals,
                    acceptedProposals: await Proposal.countDocuments({ freelancer: freelancerId, status: 'accepted' }),
                    totalEarnings: totalEarnings[0]?.total || 0,
                    pendingEarnings: pendingEarnings[0]?.total || 0,
                    profileViews: user.profileViews || 0,
                    rating: user.rating || 0
                },
                recentProposals,
                activeJobs
            }
        });

    } catch (error) {
        console.error('Get freelancer dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
};

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
    try {
        // Get all platform stats in parallel
        const [
            totalUsers,
            totalClients,
            totalFreelancers,
            activeUsers,
            suspendedUsers,
            totalJobs,
            openJobs,
            inProgressJobs,
            completedJobs,
            totalProposals,
            totalPayments,
            platformRevenue,
            recentUsers,
            recentJobs
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ role: 'client' }),
            User.countDocuments({ role: 'freelancer' }),
            User.countDocuments({ status: 'active', role: { $ne: 'admin' } }),
            User.countDocuments({ status: 'suspended' }),
            Job.countDocuments(),
            Job.countDocuments({ status: 'open' }),
            Job.countDocuments({ status: 'in-progress' }),
            Job.countDocuments({ status: 'completed' }),
            Proposal.countDocuments(),
            Payment.aggregate([
                { $match: { status: 'released' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $match: { status: 'released' } },
                { $group: { _id: null, total: { $sum: '$platformFee' } } }
            ]),
            User.find({ role: { $ne: 'admin' } })
                .select('name email role status createdAt')
                .sort({ createdAt: -1 })
                .limit(10),
            Job.find()
                .populate('client', 'name')
                .select('title category status budget createdAt')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        // Get monthly stats for chart
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Job.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    jobs: { $sum: 1 },
                    totalBudget: { $sum: '$budget' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalClients,
                    totalFreelancers,
                    activeUsers,
                    suspendedUsers,
                    totalJobs,
                    openJobs,
                    inProgressJobs,
                    completedJobs,
                    totalProposals,
                    totalPayments: totalPayments[0]?.total || 0,
                    platformRevenue: platformRevenue[0]?.total || 0
                },
                recentUsers,
                recentJobs,
                monthlyStats
            }
        });

    } catch (error) {
        console.error('Get admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
};
