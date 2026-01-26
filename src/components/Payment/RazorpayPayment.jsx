import { useState } from 'react';
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import './RazorpayPayment.css';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const RazorpayPayment = ({
    orderData,
    onSuccess,
    onFailure,
    onClose
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // For mock payments in development
            if (orderData.isMock) {
                // Simulate payment process
                await new Promise(resolve => setTimeout(resolve, 1500));

                setSuccess(true);
                setLoading(false);

                if (onSuccess) {
                    onSuccess({
                        razorpay_order_id: orderData.orderId,
                        razorpay_payment_id: `mock_pay_${Date.now()}`,
                        razorpay_signature: 'mock_signature',
                        jobId: orderData.jobId,
                        amount: orderData.amount / 100,
                        milestone: orderData.milestone,
                        isMock: true
                    });
                }
                return;
            }

            // Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error('Failed to load payment gateway');
            }

            // Configure Razorpay options
            const options = {
                key: RAZORPAY_KEY || orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                order_id: orderData.orderId,
                name: 'Freequo',
                description: `Payment for: ${orderData.jobTitle}`,
                image: '/logo.png', // Your logo
                handler: function (response) {
                    setSuccess(true);
                    setLoading(false);
                    if (onSuccess) {
                        onSuccess({
                            ...response,
                            jobId: orderData.jobId,
                            amount: orderData.amount,
                            milestone: orderData.milestone
                        });
                    }
                },
                prefill: {
                    name: orderData.userName || '',
                    email: orderData.userEmail || '',
                    contact: orderData.userPhone || ''
                },
                notes: {
                    job_id: orderData.jobId,
                    milestone: orderData.milestone
                },
                theme: {
                    color: '#667eea'
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        if (onClose) onClose();
                    }
                }
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);

            razorpay.on('payment.failed', (response) => {
                setError(response.error.description || 'Payment failed');
                setLoading(false);
                if (onFailure) {
                    onFailure(response.error);
                }
            });

            razorpay.open();

        } catch (err) {
            setError(err.message || 'Payment initialization failed');
            setLoading(false);
            if (onFailure) {
                onFailure({ message: err.message });
            }
        }
    };

    if (success) {
        return (
            <div className="payment-success">
                <div className="success-icon">
                    <CheckCircle size={64} />
                </div>
                <h3>Payment Successful!</h3>
                <p>Your payment has been processed and placed in escrow.</p>
                <p className="payment-details">
                    Amount: <strong>₹{(orderData.amount / 100).toFixed(2)}</strong>
                </p>
            </div>
        );
    }

    return (
        <div className="razorpay-payment">
            <div className="payment-header">
                <CreditCard size={32} />
                <h3>Complete Payment</h3>
            </div>

            <div className="payment-details">
                <div className="detail-row">
                    <span>Job:</span>
                    <strong>{orderData.jobTitle}</strong>
                </div>
                <div className="detail-row">
                    <span>Freelancer:</span>
                    <strong>{orderData.freelancerName}</strong>
                </div>
                {orderData.milestone && (
                    <div className="detail-row">
                        <span>Milestone:</span>
                        <strong>{orderData.milestone}</strong>
                    </div>
                )}
                <div className="detail-row amount-row">
                    <span>Amount:</span>
                    <strong className="amount">₹{(orderData.amount / 100).toFixed(2)}</strong>
                </div>
            </div>

            {orderData.isMock && (
                <div className="mock-notice">
                    <AlertCircle size={16} />
                    <span>Test Mode - No real payment will be processed</span>
                </div>
            )}

            {error && (
                <div className="payment-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <button
                className={`pay-button ${loading ? 'loading' : ''}`}
                onClick={handlePayment}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader className="spinner" size={20} />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <CreditCard size={20} />
                        <span>Pay ₹{(orderData.amount / 100).toFixed(2)}</span>
                    </>
                )}
            </button>

            <div className="payment-security">
                <Shield size={16} />
                <span>Secured by Razorpay. Your payment is safe.</span>
            </div>

            <div className="escrow-note">
                <p>
                    💡 Funds will be held in escrow until you approve the work.
                    You can release the payment once satisfied.
                </p>
            </div>
        </div>
    );
};

export default RazorpayPayment;
