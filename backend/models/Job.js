import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Web Development',
            'Mobile Development',
            'Design',
            'Writing',
            'Marketing',
            'Data Science',
            'Video & Animation',
            'Music & Audio'
        ]
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [1, 'Budget must be at least $1']
    },
    budgetType: {
        type: String,
        enum: ['fixed', 'hourly'],
        default: 'fixed'
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true
    },
    experience: {
        type: String,
        enum: ['Entry', 'Intermediate', 'Expert'],
        default: 'Intermediate'
    },
    skills: [{
        type: String,
        trim: true
    }],
    location: {
        type: String,
        default: 'Remote'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled', 'closed'],
        default: 'open'
    },
    deadline: {
        type: Date
    },
    // Client info
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.source === 'platform';
        }
    },
    clientName: {
        type: String,
        required: true
    },
    company: {
        type: String
    },
    // Assigned freelancer (when job is in-progress or completed)
    assignedFreelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Applicants count (denormalized for performance)
    applicantsCount: {
        type: Number,
        default: 0
    },
    // Featured job (for premium listing)
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Job completion data
    completedAt: {
        type: Date
    },
    // Payment status
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'escrow', 'paid', 'refunded'],
        default: 'unpaid'
    },
    // External job source tracking
    source: {
        type: String,
        enum: ['platform', 'remotive', 'other'],
        default: 'platform'
    },
    externalId: {
        type: String,
        sparse: true
    },
    externalUrl: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for faster queries
jobSchema.index({ status: 1, category: 1 });
jobSchema.index({ client: 1 });
jobSchema.index({ assignedFreelancer: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ category: 1, status: 1, createdAt: -1 });

// Virtual for getting proposals (populated separately)
jobSchema.virtual('proposals', {
    ref: 'Proposal',
    localField: '_id',
    foreignField: 'job'
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
