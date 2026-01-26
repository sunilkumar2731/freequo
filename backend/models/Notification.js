import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'proposal_received',      // Client gets when freelancer applies
            'proposal_shortlisted',   // Freelancer gets when shortlisted
            'proposal_accepted',      // Freelancer gets when accepted
            'proposal_rejected',      // Freelancer gets when rejected
            'job_assigned',           // Freelancer gets when job is assigned
            'job_completed',          // Both get when job is completed
            'payment_received',       // Freelancer gets when paid
            'payment_released',       // Client gets confirmation
            'new_message',            // Both can get
            'profile_viewed',         // Freelancer gets
            'job_cancelled',          // Freelancer gets if job is cancelled
            'account_suspended',      // User gets if suspended
            'system'                  // System-wide notifications
        ],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    // Related entities
    relatedJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    relatedProposal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedPayment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    // Read status
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    // Link to navigate to
    actionUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
    return await this.create(data);
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function (notificationId, userId) {
    return await this.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function (userId) {
    return await this.updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() }
    );
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
