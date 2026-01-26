import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: [true, 'Cover letter is required'],
        maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    proposedBudget: {
        type: Number,
        required: [true, 'Proposed budget is required'],
        min: [1, 'Proposed budget must be at least $1']
    },
    proposedDuration: {
        type: String,
        required: [true, 'Proposed duration is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    // Client notes (visible only to client)
    clientNotes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    // Freelancer's relevant experience for this job
    relevantExperience: {
        type: String,
        maxlength: [1000, 'Relevant experience cannot exceed 1000 characters']
    },
    // Timestamps for status changes
    shortlistedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date
}, {
    timestamps: true
});

// Compound index to prevent duplicate proposals
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

// Other useful indexes
proposalSchema.index({ freelancer: 1, status: 1 });
proposalSchema.index({ job: 1, status: 1 });

// Update job's applicants count when a proposal is created
proposalSchema.post('save', async function () {
    const Job = mongoose.model('Job');
    await Job.findByIdAndUpdate(this.job, {
        $inc: { applicantsCount: 1 }
    });
});

const Proposal = mongoose.model('Proposal', proposalSchema);

export default Proposal;
