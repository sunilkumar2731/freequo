import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force Google to always show account picker (select account every time)
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export const setupRecaptcha = (containerId, size = 'invisible') => {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Recaptcha container #${containerId} not found`);
            return null;
        }

        // Clear the container first to avoid "already rendered" error
        container.innerHTML = '';

        // Clean up existing verifier if it exists
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                console.log('Clearing old verifier:', e.message);
            }
            window.recaptchaVerifier = null;
        }

        // Create new RecaptchaVerifier
        console.log('🔧 Setting up reCAPTCHA...');
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            'size': size, // 'invisible' or 'normal'
            'callback': (response) => {
                console.log('✅ reCAPTCHA solved successfully');
            },
            'expired-callback': () => {
                console.warn('⚠️ reCAPTCHA expired, please try again');
            },
            'error-callback': (error) => {
                console.error('❌ reCAPTCHA error:', error);
            }
        });

        console.log('✅ reCAPTCHA verifier created');
        return window.recaptchaVerifier;
    } catch (err) {
        console.error("❌ Recaptcha setup error:", err);
        return null;
    }
};

// Helper function to reset reCAPTCHA
export const resetRecaptcha = () => {
    if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
            console.log('✅ reCAPTCHA reset successfully');
        } catch (err) {
            console.error('❌ Error resetting reCAPTCHA:', err);
        }
    }
};

export default app;
