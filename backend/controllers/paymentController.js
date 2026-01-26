import Payment from '../models/Payment.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import razorpay, { createOrder, verifyPaymentSignature } from '../config/razorpay.js';

// Check if using real Razorpay or mock
const USE_RAZORPAY = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (Client)
export const createRazorpayOrder = async (req, res) => {
    try {
        const { jobId, amount, milestone } = req.body;

        // Find job
        const job = await Job.findById(jobId).populate('assignedFreelancer', 'name');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if client owns the job
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if freelancer is assigned
        if (!job.assignedFreelancer) {
            return res.status(400).json({
                success: false,
                message: 'No freelancer assigned to this job'
            });
        }

        if (USE_RAZORPAY) {
            // Create Razorpay order
            const order = await createOrder(amount, 'INR', `job_${jobId}_${Date.now()}`);

            res.json({
                success: true,
                data: {
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    keyId: process.env.RAZORPAY_KEY_ID,
                    jobId,
                    milestone,
                    freelancerName: job.assignedFreelancer.name,
                    jobTitle: job.title
                }
            });
        } else {
            // Mock order for development
            res.json({
                success: true,
                data: {
                    orderId: `mock_order_${Date.now()}`,
                    amount: amount * 100,
                    currency: 'INR',
                    keyId: 'mock_key',
                    jobId,
                    milestone,
                    freelancerName: job.assignedFreelancer.name,
                    jobTitle: job.title,
                    isMock: true
                }
            });
        }

    } catch (error) {
        console.error('Create Razorpay order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order',
            error: error.message
        });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private (Client)
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            jobId,
            amount,
            milestone,
            isMock
        } = req.body;

        // For mock payments in development
        if (isMock || !USE_RAZORPAY) {
            // Simulate successful payment
            const job = await Job.findById(jobId).populate('assignedFreelancer', 'name');

            const payment = await Payment.create({
                job: jobId,
                client: req.user._id,
                freelancer: job.assignedFreelancer._id,
                amount,
                status: 'escrow',
                escrowedAt: new Date(),
                milestone,
                paymentMethod: 'mock',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: `mock_pay_${Date.now()}`
            });

            // Update job payment status
            await Job.findByIdAndUpdate(jobId, { paymentStatus: 'escrow' });

            // Notify freelancer
            await Notification.create({
                user: job.assignedFreelancer._id,
                type: 'payment_received',
                title: 'Payment in Escrow 💰',
                message: `₹${amount.toFixed(2)} has been placed in escrow for "${job.title}"`,
                relatedJob: job._id,
                relatedPayment: payment._id,
                actionUrl: `/jobs/${job._id}`
            });

            return res.json({
                success: true,
                message: 'Mock payment successful',
                data: { payment }
            });
        }

        // Verify real Razorpay payment
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Payment verified - create payment record
        const job = await Job.findById(jobId).populate('assignedFreelancer', 'name');

        const payment = await Payment.create({
            job: jobId,
            client: req.user._id,
            freelancer: job.assignedFreelancer._id,
            amount: amount / 100, // Razorpay sends amount in paise
            status: 'escrow',
            escrowedAt: new Date(),
            milestone,
            paymentMethod: 'razorpay',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        // Update job payment status
        await Job.findByIdAndUpdate(jobId, { paymentStatus: 'escrow' });

        // Notify freelancer
        await Notification.create({
            user: job.assignedFreelancer._id,
            type: 'payment_received',
            title: 'Payment in Escrow 💰',
            message: `₹${(amount / 100).toFixed(2)} has been placed in escrow for "${job.title}"`,
            relatedJob: job._id,
            relatedPayment: payment._id,
            actionUrl: `/jobs/${job._id}`
        });

        res.json({
            success: true,
            message: 'Payment verified and placed in escrow',
            data: { payment }
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

// @desc    Create payment (mock)
// @route   POST /api/payments
// @access  Private (Client)
export const createPayment = async (req, res) => {
    try {
        const { jobId, amount, milestone } = req.body;

        // Find job
        const job = await Job.findById(jobId).populate('assignedFreelancer', 'name');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if client owns the job
        if (job.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if freelancer is assigned
        if (!job.assignedFreelancer) {
            return res.status(400).json({
                success: false,
                message: 'No freelancer assigned to this job'
            });
        }

        // Create payment in escrow
        const payment = await Payment.create({
            job: jobId,
            client: req.user._id,
            freelancer: job.assignedFreelancer._id,
            amount,
            status: 'escrow',
            escrowedAt: new Date(),
            milestone,
            paymentMethod: process.env.PAYMENT_MODE === 'mock' ? 'mock' : 'card'
        });

        // Update job payment status
        await Job.findByIdAndUpdate(jobId, { paymentStatus: 'escrow' });

        // Notify freelancer
        await Notification.create({
            user: job.assignedFreelancer._id,
            type: 'payment_received',
            title: 'Payment in Escrow 💰',
            message: `$${amount.toFixed(2)} has been placed in escrow for "${job.title}"`,
            relatedJob: job._id,
            relatedPayment: payment._id,
            actionUrl: `/jobs/${job._id}`
        });

        res.status(201).json({
            success: true,
            message: 'Payment created and placed in escrow',
            data: { payment }
        });

    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment'
        });
    }
};

// @desc    Release payment to freelancer
// @route   PUT /api/payments/:id/release
// @access  Private (Client)
export const releasePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('job', 'title')
            .populate('freelancer', 'name');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if client owns the payment
        if (payment.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (payment.status !== 'escrow') {
            return res.status(400).json({
                success: false,
                message: `Cannot release a ${payment.status} payment`
            });
        }

        // Release payment
        payment.status = 'released';
        payment.releasedAt = new Date();
        await payment.save();

        // Update freelancer earnings
        await User.findByIdAndUpdate(payment.freelancer._id, {
            $inc: { totalEarnings: payment.freelancerAmount }
        });

        // Update client spending
        await User.findByIdAndUpdate(payment.client, {
            $inc: { totalSpent: payment.amount }
        });

        // Update job payment status
        await Job.findByIdAndUpdate(payment.job._id, { paymentStatus: 'paid' });

        // Notify freelancer
        await Notification.create({
            user: payment.freelancer._id,
            type: 'payment_received',
            title: 'Payment Released! 💵',
            message: `$${payment.freelancerAmount.toFixed(2)} has been released to your account for "${payment.job.title}"`,
            relatedJob: payment.job._id,
            relatedPayment: payment._id,
            actionUrl: '/freelancer/dashboard'
        });

        res.json({
            success: true,
            message: 'Payment released successfully',
            data: { payment }
        });

    } catch (error) {
        console.error('Release payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error releasing payment'
        });
    }
};

// @desc    Get client's payments
// @route   GET /api/payments/client
// @access  Private (Client)
export const getClientPayments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { client: req.user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const payments = await Payment.find(query)
            .populate('job', 'title category')
            .populate('freelancer', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        // Get totals
        const totals = await Payment.aggregate([
            { $match: { client: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                payments,
                totals: totals.reduce((acc, t) => ({ ...acc, [t._id]: t.total }), {}),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get client payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
};

// @desc    Get freelancer's earnings
// @route   GET /api/payments/freelancer
// @access  Private (Freelancer)
export const getFreelancerEarnings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { freelancer: req.user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const payments = await Payment.find(query)
            .populate('job', 'title category')
            .populate('client', 'name company avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        // Get earnings summary
        const earnings = await Payment.aggregate([
            { $match: { freelancer: req.user._id } },
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$freelancerAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                payments,
                earnings: earnings.reduce((acc, e) => ({ ...acc, [e._id]: e.total }), {}),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get freelancer earnings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings'
        });
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin
// @access  Private (Admin)
export const getAllPayments = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const payments = await Payment.find(query)
            .populate('job', 'title')
            .populate('client', 'name email')
            .populate('freelancer', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        // Get platform stats
        const stats = await Payment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    platformFees: { $sum: '$platformFee' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                payments,
                stats: stats.reduce((acc, s) => ({
                    ...acc,
                    [s._id]: {
                        count: s.count,
                        totalAmount: s.totalAmount,
                        platformFees: s.platformFees
                    }
                }), {}),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
};
