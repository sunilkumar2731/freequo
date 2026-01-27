import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.EMAIL_USER || 'freequoo@gmail.com';
const SENDER_NAME = 'Freequo';

/**
 * Centralized function to send email via Brevo REST API (HTTPS)
 * This bypasses Render's SMTP block.
 */
export const sendEmail = async (to, templateName, templateData) => {
    if (!BREVO_API_KEY) {
        console.warn('🛑 BREVO_API_KEY missing. Cannot send email to:', to);
        return false;
    }

    try {
        const template = emailTemplates[templateName];
        if (!template) {
            console.error(`Email template '${templateName}' not found`);
            return false;
        }

        const { subject, html } = template(...templateData);

        console.log(`✅ Attempting to send email to ${to} via Brevo API...`);

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
        }, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 201 || response.status === 200) {
            console.log(`✅ Email sent successfully via Brevo! ID: ${response.data.messageId}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`❌ Brevo API Error for ${to}:`, error.response?.data || error.message);
        return false;
    }
};

// --- Email Templates ---
const emailTemplates = {
    welcome: (name, role) => ({
        subject: 'Welcome to Freequo! 🎉',
        html: `
            <div style="font-family: Arial; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: #667eea; padding: 40px; text-align: center; color: white;">
                    <h1>Welcome ${name}!</h1>
                </div>
                <div style="padding: 30px;">
                    <p>Thank you for joining Freequo. You are now registered as a <strong>${role}</strong>.</p>
                    <a href="https://freequo-frontend.onrender.com" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
                </div>
            </div>
        `
    }),

    proposalReceived: (clientName, freelancerName, jobTitle) => ({
        subject: `New proposal for "${jobTitle}" 📬`,
        html: `<h3>Hi ${clientName},</h3><p><strong>${freelancerName}</strong> has submitted a proposal for "<strong>${jobTitle}</strong>".</p>`
    }),

    proposalSubmitted: (freelancerName, jobTitle) => ({
        subject: `Application submitted: ${jobTitle} 📝`,
        html: `<h3>Hi ${freelancerName},</h3><p>You have successfully applied for "<strong>${jobTitle}</strong>".</p>`
    }),

    jobPosted: (name, jobTitle) => ({
        subject: `Successfully posted: ${jobTitle} 🚀`,
        html: `<h3>Hi ${name},</h3><p>Your job "<strong>${jobTitle}</strong>" is now live.</p>`
    }),

    proposalAccepted: (freelancerName, jobTitle, clientName) => ({
        subject: `Congrats! Proposal accepted for "${jobTitle}"! 🎊`,
        html: `<h3>Hi ${freelancerName},</h3><p>${clientName} has accepted your proposal!</p>`
    })
};

// --- Helper functions ---
export const sendWelcomeEmail = (email, name, role) => sendEmail(email, 'welcome', [name, role]);
export const sendProposalReceivedEmail = (email, clientName, freelancerName, jobTitle) => sendEmail(email, 'proposalReceived', [clientName, freelancerName, jobTitle]);
export const sendProposalSubmittedEmail = (email, freelancerName, jobTitle) => sendEmail(email, 'proposalSubmitted', [freelancerName, jobTitle]);
export const sendJobPostedEmail = (email, name, jobTitle) => sendEmail(email, 'jobPosted', [name, jobTitle]);
export const sendProposalAcceptedEmail = (email, freelancerName, jobTitle, clientName) => sendEmail(email, 'proposalAccepted', [freelancerName, jobTitle, clientName]);

export default { sendEmail, sendWelcomeEmail, sendProposalReceivedEmail, sendProposalSubmittedEmail, sendJobPostedEmail, sendProposalAcceptedEmail };
