import Razorpay from 'razorpay';
import crypto from 'crypto';

// Check if Razorpay credentials are configured
const isConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

// Initialize Razorpay instance only if configured
let razorpay = null;

if (isConfigured) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized');
} else {
    console.log('⚠️ Razorpay not configured - running in mock payment mode');
}

export default razorpay;
export { isConfigured as isRazorpayConfigured };

// Helper function to create an order
export const createOrder = async (amount, currency = 'INR', receipt = null) => {
    if (!razorpay) {
        // Return mock order when Razorpay is not configured
        return {
            id: `mock_order_${Date.now()}`,
            amount: amount * 100,
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            status: 'created',
            isMock: true
        };
    }

    const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1 // Auto capture
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw error;
    }
};

// Helper function to verify payment signature
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        // In mock mode, always return true
        return true;
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
};

// Helper function to fetch payment details
export const fetchPayment = async (paymentId) => {
    if (!razorpay) {
        // Return mock payment when Razorpay is not configured
        return {
            id: paymentId,
            amount: 0,
            currency: 'INR',
            status: 'captured',
            isMock: true
        };
    }

    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Razorpay fetch payment error:', error);
        throw error;
    }
};

// Helper function to initiate refund
export const initiateRefund = async (paymentId, amount = null) => {
    if (!razorpay) {
        // Return mock refund when Razorpay is not configured
        return {
            id: `mock_refund_${Date.now()}`,
            payment_id: paymentId,
            amount: amount ? amount * 100 : 0,
            status: 'processed',
            isMock: true
        };
    }

    try {
        const options = amount ? { amount: amount * 100 } : {};
        const refund = await razorpay.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        console.error('Razorpay refund error:', error);
        throw error;
    }
};
