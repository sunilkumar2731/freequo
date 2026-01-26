import User from '../models/User.js';

// @desc    Get all freelancers
// @route   GET /api/users/freelancers
// @access  Public
export const getFreelancers = async (req, res) => {
    try {
        const {
            skills,
            minRate,
            maxRate,
            experience,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const query = { role: 'freelancer', status: 'active' };

        // Filter by skills
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillsArray };
        }

        // Filter by hourly rate
        if (minRate || maxRate) {
            query.hourlyRate = {};
            if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
            if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
        }

        // Filter by experience
        if (experience) {
            query.experience = experience;
        }

        // Search by name or title
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const freelancers = await User.find(query)
            .select('-password')
            .sort({ rating: -1, completedJobs: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                freelancers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get freelancers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching freelancers'
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Increment profile views for freelancers
        if (user.role === 'freelancer' && req.user?._id?.toString() !== user._id.toString()) {
            await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            'name', 'title', 'bio', 'skills', 'hourlyRate',
            'experience', 'location', 'avatar', 'portfolio', 'company'
        ];

        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// @desc    Get all clients
// @route   GET /api/users/clients
// @access  Private (Admin)
export const getClients = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        const query = { role: 'client' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const clients = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                clients,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching clients'
        });
    }
};
