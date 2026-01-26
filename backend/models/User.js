import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    role: {
        type: String,
        enum: ['client', 'freelancer', 'admin'],
        required: true,
        default: 'client'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending'],
        default: 'active'
    },
    // Client specific fields
    company: {
        type: String,
        trim: true
    },
    // Freelancer specific fields
    title: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    skills: [{
        type: String,
        trim: true
    }],
    hourlyRate: {
        type: Number,
        default: 0
    },
    experience: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    avatar: {
        type: String
    },
    portfolio: {
        type: String,
        trim: true
    },
    resumeUrl: {
        type: String
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    profileViews: {
        type: Number,
        default: 0
    },
    // Earnings tracking
    totalEarnings: {
        type: Number,
        default: 0
    },
    pendingEarnings: {
        type: Number,
        default: 0
    },
    // Client spending tracking
    totalSpent: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ email: 1 });
userSchema.index({ skills: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
