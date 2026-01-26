import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0.01, 'Amount must be at least $0.01']
    },
    platformFee: {
        type: Number,
        default: 0 // Platform takes a percentage
    },
    freelancerAmount: {
        type: Number,
        required: true // Amount after platform fee
    },
    status: {
        type: String,
        enum: ['pending', 'escrow', 'released', 'refunded', 'disputed'],
        default: 'pending'
    },
    // Payment method details (mock or real)
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'paypal', 'mock', 'razorpay'],
        default: 'mock'
    },
    // Razorpay specific fields
    razorpayOrderId: {
        type: String,
        sparse: true
    },
    razorpayPaymentId: {
        type: String,
        sparse: true
    },
    // Transaction reference
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Milestone info (for multiple payments)
    milestone: {
        type: String,
        trim: true
    },
    milestoneNumber: {
        type: Number,
        default: 1
    },
    // Dates
    escrowedAt: Date,
    releasedAt: Date,
    refundedAt: Date,
    // Notes
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Indexes
paymentSchema.index({ job: 1 });
paymentSchema.index({ client: 1, status: 1 });
paymentSchema.index({ freelancer: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Generate transaction ID before saving
paymentSchema.pre('save', function (next) {
    if (!this.transactionId) {
        this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Calculate platform fee (10%) and freelancer amount
    if (!this.platformFee) {
        this.platformFee = this.amount * 0.10; // 10% platform fee
        this.freelancerAmount = this.amount - this.platformFee;
    }

    next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
