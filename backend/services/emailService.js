// Email Service using EmailJS
// Note: EmailJS can be used from both frontend and backend

import nodemailer from 'nodemailer';

// For production, you might use actual SMTP or email service
// For now, we'll create a service that logs emails in development
// and integrates with EmailJS for real emails

const isDevelopment = process.env.NODE_ENV === 'development';

// Email transporter configuration
let transporter = null;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
} else if (EMAIL_USER && EMAIL_PASSWORD) {
    // Default to Gmail using the most reliable settings for cloud environments
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
}

// Email templates
const emailTemplates = {
    welcome: (name, role) => ({
        subject: 'Welcome to Freequo! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to Freequo!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${name}! 👋</h2>
                    <p style="color: #666; line-height: 1.6;">
                        ${role === 'client'
                ? 'Thank you for joining Freequo! You can now post jobs and find talented freelancers for your projects.'
                : 'Thank you for joining Freequo! Complete your profile and start applying to jobs to grow your freelance career.'
            }
                    </p>
                    <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        Get Started
                    </a>
                </div>
                <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
                    © 2024 Freequo. All rights reserved.
                </div>
            </div>
        `
    }),

    jobPosted: (clientName, jobTitle) => ({
        subject: `Your job "${jobTitle}" has been posted! ✅`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Job Posted Successfully!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${clientName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Your job "<strong>${jobTitle}</strong>" has been posted successfully. 
                        Talented freelancers can now view and apply for your project.
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        You'll receive notifications when freelancers submit proposals.
                    </p>
                    <a href="${process.env.FRONTEND_URL}/client/dashboard" style="display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        View Your Jobs
                    </a>
                </div>
            </div>
        `
    }),

    proposalReceived: (clientName, freelancerName, jobTitle) => ({
        subject: `New proposal for "${jobTitle}" 📬`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">New Proposal Received!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${clientName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Great news! <strong>${freelancerName}</strong> has submitted a proposal for your job "<strong>${jobTitle}</strong>".
                    </p>
                    <a href="${process.env.FRONTEND_URL}/client/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        Review Proposal
                    </a>
                </div>
            </div>
        `
    }),

    proposalAccepted: (freelancerName, jobTitle, clientName) => ({
        subject: `Your proposal for "${jobTitle}" was accepted! 🎉`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Congratulations!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${freelancerName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Great news! <strong>${clientName}</strong> has accepted your proposal for "<strong>${jobTitle}</strong>".
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        You can now start working on the project. Good luck!
                    </p>
                    <a href="${process.env.FRONTEND_URL}/freelancer/dashboard" style="display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        View Project
                    </a>
                </div>
            </div>
        `
    }),

    paymentReceived: (freelancerName, amount, jobTitle) => ({
        subject: `Payment received: ₹${amount} 💰`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Payment Received!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${freelancerName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        You've received a payment of <strong>₹${amount}</strong> for your work on "<strong>${jobTitle}</strong>".
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        The funds have been added to your account balance.
                    </p>
                    <a href="${process.env.FRONTEND_URL}/freelancer/dashboard" style="display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        View Earnings
                    </a>
                </div>
            </div>
        `
    }),

    proposalSubmitted: (freelancerName, jobTitle) => ({
        subject: `Application submitted: ${jobTitle} 📝`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Proposal Submitted!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${freelancerName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        You have successfully applied for "<strong>${jobTitle}</strong>".
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        The client has been notified and will review your proposal. You'll receive an email if they decide to shortlist or hire you.
                    </p>
                    <a href="${process.env.FRONTEND_URL}/freelancer/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                        View Your Applications
                    </a>
                </div>
            </div>
        `
    })
};

// Send email function
export const sendEmail = async (to, templateName, templateData) => {
    try {
        const template = emailTemplates[templateName];
        if (!template) {
            console.error(`Email template '${templateName}' not found`);
            return false;
        }

        const { subject, html } = template(...templateData);

        if (isDevelopment && !transporter) {
            // Log email in development mode
            console.log('📧 Email would be sent:');
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log('   (Email sending is disabled in development without SMTP config)');
            return true;
        }

        if (transporter) {
            console.log(`📤 Attempting to send email to ${to}...`);
            await transporter.sendMail({
                from: process.env.SMTP_FROM || 'freequoo@gmail.com',
                to,
                subject,
                html
            });
            console.log(`✅ Email sent successfully to ${to}: ${subject}`);
            return true;
        }

        console.warn(`🛑 Transporter not configured. Email to ${to} not sent.`);
        return false;
    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error);
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
