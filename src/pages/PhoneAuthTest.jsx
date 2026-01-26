import { useState } from 'react';
import { setupRecaptcha, resetRecaptcha } from '../firebase';
import { auth } from '../firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

function PhoneAuthTest() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [recaptchaMode, setRecaptchaMode] = useState('invisible'); // 'invisible' or 'normal'

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            console.log('🔧 Setting up reCAPTCHA in', recaptchaMode, 'mode...');
            const verifier = setupRecaptcha('test-recaptcha-container', recaptchaMode);

            if (!verifier) {
                throw new Error('Failed to setup reCAPTCHA');
            }

            console.log('📤 Sending OTP to:', phoneNumber);
            const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);

            setConfirmationResult(result);
            setMessage('✅ OTP sent successfully! Check your phone.');
            console.log('✅ OTP sent successfully');
        } catch (err) {
            console.error('❌ Error:', err);
            setError(`❌ Error: ${err.code || err.message}`);
            resetRecaptcha();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            console.log('🔍 Verifying OTP...');
            const result = await confirmationResult.confirm(otp);
            console.log('✅ Phone number verified:', result.user.phoneNumber);
            setMessage(`✅ Success! Logged in as: ${result.user.phoneNumber}`);
        } catch (err) {
            console.error('❌ Error:', err);
            setError(`❌ Invalid OTP: ${err.message}`);
        }
    };

    const handleReset = () => {
        resetRecaptcha();
        setPhoneNumber('');
        setOtp('');
        setConfirmationResult(null);
        setMessage('');
        setError('');
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <h1>🧪 Phone Authentication Test</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Use this page to test Firebase Phone Authentication setup
            </p>

            {/* reCAPTCHA Mode Toggle */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                    reCAPTCHA Mode:
                </label>
                <select
                    value={recaptchaMode}
                    onChange={(e) => setRecaptchaMode(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
                >
                    <option value="invisible">Invisible (Automatic)</option>
                    <option value="normal">Visible (Manual Checkbox)</option>
                </select>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    Try "Visible" mode if invisible mode doesn't work
                </p>
            </div>

            {/* Test Phone Numbers */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
                <strong>📱 Test Phone Numbers (Configure in Firebase Console):</strong>
                <ul style={{ marginTop: '10px', fontSize: '14px' }}>
                    <li><code>+1 650-555-1234</code> → OTP: <code>123456</code></li>
                    <li><code>+91 9876543210</code> → OTP: <code>123456</code></li>
                </ul>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    Or use your real phone number (SMS will be sent)
                </p>
            </div>

            {message && (
                <div style={{ padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '20px' }}>
                    {message}
                </div>
            )}

            {error && (
                <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {!confirmationResult ? (
                <form onSubmit={handleSendOTP}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Phone Number (with country code):
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+919876543210"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                border: '2px solid #ddd',
                                borderRadius: '8px'
                            }}
                        />
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Format: +[country code][number] (no spaces)
                        </p>
                    </div>

                    <div id="test-recaptcha-container" style={{ marginBottom: '20px' }}></div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        📤 Send OTP
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Enter OTP:
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            required
                            maxLength="6"
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                letterSpacing: '4px',
                                textAlign: 'center'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}
                    >
                        ✅ Verify OTP
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Start Over
                    </button>
                </form>
            )}

            <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>🔍 Troubleshooting Checklist:</h3>
                <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    <li>✅ Phone Authentication enabled in Firebase Console</li>
                    <li>✅ Test phone numbers configured (for testing)</li>
                    <li>✅ Authorized domains include "localhost"</li>
                    <li>✅ Browser console shows no errors</li>
                    <li>✅ Ad blockers disabled</li>
                    <li>✅ Using Chrome or Firefox</li>
                </ul>
                <p style={{ fontSize: '12px', color: '#856404', marginTop: '15px', marginBottom: 0 }}>
                    <strong>Still not working?</strong> Check the browser console (F12) for detailed error messages.
                </p>
            </div>
        </div>
    );
}

export default PhoneAuthTest;
