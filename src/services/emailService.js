// EmailJS Service for Frontend Email Notifications
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Template IDs - Configure these in your EmailJS dashboard
const TEMPLATES = {
    CONTACT: import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID,
    NOTIFICATION: import.meta.env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID
};

// Initialize EmailJS
if (PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
}

// Check if EmailJS is configured
const isConfigured = () => Boolean(SERVICE_ID && PUBLIC_KEY);

/**
 * Send a contact form message
 * @param {Object} formData - { name, email, message }
 */
export const sendContactMessage = async (formData) => {
    if (!isConfigured()) {
        console.log('📧 EmailJS not configured. Message would be sent:', formData);
        return { success: true, mock: true };
    }

    try {
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATES.CONTACT,
            {
                from_name: formData.name,
                from_email: formData.email,
                message: formData.message,
                to_email: 'support@freequo.com' // Your support email
            }
        );

        return { success: true, response };
    } catch (error) {
        console.error('EmailJS error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification email (for client-side triggered notifications)
 * @param {Object} notificationData - { to_email, to_name, subject, message }
 */
export const sendNotificationEmail = async (notificationData) => {
    if (!isConfigured()) {
        console.log('📧 EmailJS not configured. Notification would be sent:', notificationData);
        return { success: true, mock: true };
    }

    try {
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATES.NOTIFICATION,
            {
                to_email: notificationData.to_email,
                to_name: notificationData.to_name,
                subject: notificationData.subject,
                message: notificationData.message,
                action_url: notificationData.action_url || import.meta.env.VITE_APP_URL
            }
        );

        return { success: true, response };
    } catch (error) {
        console.error('EmailJS error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send form submission via EmailJS form method
 * @param {HTMLFormElement} form - The form element
 */
export const sendForm = async (form) => {
    if (!isConfigured()) {
        console.log('📧 EmailJS not configured. Form would be submitted');
        return { success: true, mock: true };
    }

    try {
        const response = await emailjs.sendForm(
            SERVICE_ID,
            TEMPLATES.CONTACT,
            form
        );

        return { success: true, response };
    } catch (error) {
        console.error('EmailJS error:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendContactMessage,
    sendNotificationEmail,
    sendForm,
    isConfigured
};
