import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import admin from '../config/firebase.js';
import { sendWelcomeEmail } from '../services/emailService.js';

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { email, password, name, role, company, title } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user data based on role
        const userData = {
            email,
            password,
            name,
            role,
            signupMethod: 'email'
        };

        // Add role-specific fields
        if (role === 'client' && company) {
            userData.company = company;
        }
        if (role === 'freelancer') {
            userData.title = title || '';
            userData.skills = [];
            userData.hourlyRate = 0;
        }

        // Create user
        const user = await User.create(userData);

        // Generate token
        const token = generateToken(user._id);

        // Create welcome notification
        await Notification.create({
            user: user._id,
            type: 'system',
            title: 'Welcome to Freequo! 🎉',
            message: `Hi ${name}! Welcome to Freequo. ${role === 'client' ? 'Start posting jobs to find talented freelancers.' : 'Complete your profile and start applying to jobs.'}`,
            actionUrl: role === 'freelancer' ? '/freelancer/edit-profile' : '/client/dashboard'
        });

        // Send welcome email (Background - do not await)
        sendWelcomeEmail(user.email, user.name, user.role).catch(err => {
            console.error('Background welcome email error:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    createdAt: user.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating account',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password, firebaseToken, isSocial, role = 'freelancer' } = req.body;

        let user;

        // Handle Social Login (Google/Firebase)
        if (isSocial && firebaseToken) {
            try {
                // Verify Firebase Token
                const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
                const fbEmail = decodedToken.email;

                if (!fbEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Firebase token does not contain an email address'
                    });
                }

                // Find or Create user
                console.log(`🔍 Searching for social user with email: ${fbEmail}`);
                user = await User.findOne({ email: fbEmail });

                if (!user) {
                    console.log(`✨ Creating new social user for email: ${fbEmail}`);
                    // Create new user if they don't exist
                    user = await User.create({
                        email: fbEmail,
                        name: decodedToken.name || fbEmail.split('@')[0],
                        role: role,
                        avatar: decodedToken.picture || '',
                        status: 'active',
                        signupMethod: 'google',
                        // Password is required in schema, but we'll use a random one for social accounts
                        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
                    });
                    console.log(`✅ New social user created: ${user._id}`);

                    // Create welcome notification
                    await Notification.create({
                        user: user._id,
                        type: 'system',
                        title: 'Welcome to Freequo! 🎉',
                        message: `Hi ${user.name}! Welcome to Freequo via Google login. ${user.role === 'client' ? 'Start posting jobs to find talented freelancers.' : 'Complete your profile and start applying to jobs.'}`,
                        actionUrl: user.role === 'freelancer' ? '/freelancer/edit-profile' : '/client/dashboard'
                    });

                    // Send welcome email for social login
                    try {
                        await sendWelcomeEmail(user.email, user.name, user.role);
                    } catch (emailError) {
                        console.error('Failed to send welcome email (social):', emailError);
                    }
                }
            } catch (fbError) {
                console.error('Firebase token verification failed:', fbError);
                return res.status(401).json({
                    success: false,
                    message: 'Authentication failed with Google',
                    error: fbError.message
                });
            }
        } else {
            // Standard Email/Password Login
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            // Find user and include password
            user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }

        // Check if user is suspended
        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.'
            });
        }

        // Generate token
        const authToken = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    avatar: user.avatar,
                    // Include additional fields based on role
                    ...(user.role === 'freelancer' && {
                        title: user.title,
                        skills: user.skills,
                        hourlyRate: user.hourlyRate,
                        rating: user.rating,
                        completedJobs: user.completedJobs
                    }),
                    ...(user.role === 'client' && {
                        company: user.company
                    })
                },
                token: authToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate new token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Password updated successfully',
            data: { token }
        });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password'
        });
    }
};

// @desc    Logout (client-side - just for documentation)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    // JWT is stateless, so logout is handled client-side
    // This endpoint is for documentation and potential future token blacklisting
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Admin login with secret password
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = async (req, res) => {
    try {
        const { password, email } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Admin password is required'
            });
        }

        // Check if the provided password matches the one in .env
        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin password'
            });
        }

        // Find the admin user in the system
        // If an email is provided, check if it's the specific owner email
        // Otherwise, just find any user with role 'admin'
        let adminUser = await User.findOne({
            $or: [
                { role: 'admin' },
                { email: email || 'freequoo@gmail.com' } // Default owner email
            ]
        });

        // If no admin user exists in DB yet, we can't fully 'login',
        // but for now let's assume one exists or we just verify the password.
        // The requirement says "Admin is OWNER ONLY" and "Admin account is only for me".

        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: 'Admin account not found in system'
            });
        }

        // Generate a special admin token
        // We add an isAdmin flag to the payload for stricter checks
        const token = jwt.sign(
            { id: adminUser._id, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '12h' } // Short-lived token for admin
        );

        res.json({
            success: true,
            message: 'Admin authentication successful',
            data: {
                user: {
                    id: adminUser._id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: 'admin'
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during admin authentication'
        });
    }
};
