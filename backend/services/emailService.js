import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

// EmailJS Configuration from Environment Variables
const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_jet0yr2';
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_s4r7onh';
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'a2SI6bSsu-uNvR5rM';
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'GTIWDPiHO58Ax7m-f3K91';

// Email templates mapping to text messages for EmailJS
const emailMessages = {
    welcome: (name, role) => ({
        subject: 'Welcome to Freequo! 🎉',
        text: `Hi ${name}! 👋\n\n${role === 'client'
            ? 'Thank you for joining Freequo! You can now post jobs and find talented freelancers for your projects.'
            : 'Thank you for joining Freequo! Complete your profile and start applying to jobs to grow your freelance career.'}`
    }),
    jobPosted: (clientName, jobTitle) => ({
        subject: `Your job "${jobTitle}" has been posted! ✅`,
        text: `Hi ${clientName}!\n\nYour job "${jobTitle}" has been posted successfully. Talented freelancers can now view and apply for your project.`
    }),
    proposalReceived: (clientName, freelancerName, jobTitle) => ({
        subject: `New proposal for "${jobTitle}" 📬`,
        text: `Hi ${clientName}!\n\nGreat news! ${freelancerName} has submitted a proposal for your job "${jobTitle}".`
    }),
    proposalAccepted: (freelancerName, jobTitle, clientName) => ({
        subject: `Your proposal for "${jobTitle}" was accepted! 🎉`,
        text: `Hi ${freelancerName}!\n\nGreat news! ${clientName} has accepted your proposal for "${jobTitle}". You can now start working on the project.`
    }),
    paymentReceived: (freelancerName, amount, jobTitle) => ({
        subject: `Payment received: ₹${amount} 💰`,
        text: `Hi ${freelancerName}!\n\nYou've received a payment of ₹${amount} for your work on "${jobTitle}".`
    }),
    proposalSubmitted: (freelancerName, jobTitle) => ({
        subject: `Application submitted: ${jobTitle} 📝`,
        text: `Hi ${freelancerName}!\n\nYou have successfully applied for "${jobTitle}". The client has been notified and will review your proposal.`
    })
};

/**
 * Send email via EmailJS REST API
 */
export const sendEmail = async (to, templateName, templateData) => {
    try {
        const template = emailMessages[templateName];
        if (!template) {
            console.error(`Email message template '${templateName}' not found`);
            return false;
        }

        const { subject, text } = template(...templateData);

        // Prepare context-specific names
        const recipientName = templateData[0] || 'User';

        console.log(`📤 Attempting to send EmailJS notification to ${to}...`);

        const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: SERVICE_ID,
            template_id: TEMPLATE_ID,
            user_id: PUBLIC_KEY,
            accessToken: PRIVATE_KEY,
            template_params: {
                name: "Freequo System",
                email: to, // The recipient
                message: `${subject}\n\n${text}`,
                to_name: recipientName
            }
        });

        console.log(`✅ Email sent successfully to ${to} via EmailJS`);
        return true;
    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error(`❌ Error sending EmailJS email to ${to}:`, errorData);

        // Log the failure but don't crash
        return false;
    }
};

// Helper functions for specific email types
export const sendWelcomeEmail = (email, name, role) =>
    sendEmail(email, 'welcome', [name, role]);

export const sendJobPostedEmail = (email, clientName, jobTitle) =>
    sendEmail(email, 'jobPosted', [clientName, jobTitle]);

export const sendProposalReceivedEmail = (email, clientName, freelancerName, jobTitle) =>
    sendEmail(email, 'proposalReceived', [clientName, freelancerName, jobTitle]);

export const sendProposalAcceptedEmail = (email, freelancerName, jobTitle, clientName) =>
    sendEmail(email, 'proposalAccepted', [freelancerName, jobTitle, clientName]);

export const sendPaymentReceivedEmail = (email, freelancerName, amount, jobTitle) =>
    sendEmail(email, 'paymentReceived', [freelancerName, amount, jobTitle]);

export const sendProposalSubmittedEmail = (email, freelancerName, jobTitle) =>
    sendEmail(email, 'proposalSubmitted', [freelancerName, jobTitle]);

export default {
    sendEmail,
    sendWelcomeEmail,
    sendJobPostedEmail,
    sendProposalReceivedEmail,
    sendProposalAcceptedEmail,
    sendPaymentReceivedEmail,
    sendProposalSubmittedEmail
};
