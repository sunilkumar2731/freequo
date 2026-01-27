import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

// Nodemailer Configuration
// Using Port 465 (SSL) which is the most reliable for cloud environments
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email templates
const emailTemplates = {
    welcome: (name, role) => ({
        subject: 'Welcome to Freequo! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to Freequo!</h1>
                </div>
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">Hi ${name}! 👋</h2>
                    <p style="color: #666; line-height: 1.6;">
                        ${role === 'client'
                ? 'Thank you for joining Freequo! You can now post jobs and find talented freelancers for your projects.'
                : 'Thank you for joining Freequo! Complete your profile and start applying to jobs to grow your freelance career.'}
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'https://freequo-frontend.onrender.com'}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
                        Get Started
                    </a>
                </div>
                <div style="padding: 20px; text-align: center; color: #999; font-size: 12px; background: #f9f9f9;">
                    © 2024 Freequo Market. All rights reserved.
                </div>
            </div>
        `
    }),

    proposalReceived: (clientName, freelancerName, jobTitle) => ({
        subject: `New proposal for "${jobTitle}" 📬`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">New Proposal!</h1>
                </div>
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">Hi ${clientName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Great news! <strong>${freelancerName}</strong> has submitted a proposal for your job "<strong>${jobTitle}</strong>".
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'https://freequo-frontend.onrender.com'}/client/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
                        Review Proposal
                    </a>
                </div>
            </div>
        `
    }),

    proposalSubmitted: (freelancerName, jobTitle) => ({
        subject: `Application submitted: ${jobTitle} 📝`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Application Sent!</h1>
                </div>
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">Hi ${freelancerName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        You have successfully applied for "<strong>${jobTitle}</strong>". 
                        The client has been notified and will review your proposal.
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'https://freequo-frontend.onrender.com'}/freelancer/dashboard" style="display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
                        View Applications
                    </a>
                </div>
            </div>
        `
    }),

    jobPosted: (name, jobTitle) => ({
        subject: `Successfully posted: ${jobTitle} 🚀`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Job Posted!</h1>
                </div>
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">Hi ${name}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Your job "<strong>${jobTitle}</strong>" has been successfully posted on Freequo. 
                        You'll receive notifications when freelancers submit proposals.
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'https://freequo-frontend.onrender.com'}/client/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
                        View Dashboard
                    </a>
                </div>
            </div>
        `
    }),

    proposalAccepted: (freelancerName, jobTitle, clientName) => ({
        subject: `Congratulations! Your proposal for "${jobTitle}" was accepted! 🎊`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Proposal Accepted!</h1>
                </div>
                <div style="padding: 30px; background: white;">
                    <h2 style="color: #333;">Hi ${freelancerName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Great news! <strong>${clientName}</strong> has accepted your proposal for "<strong>${jobTitle}</strong>".
                        You can now start working on the project.
                    </p>
                    <a href="${process.env.FRONTEND_URL || 'https://freequo-frontend.onrender.com'}/freelancer/dashboard" style="display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
                        Get Started
                    </a>
                </div>
            </div>
        `
    })

};

/**
 * Send email via Nodemailer
 */
export const sendEmail = async (to, templateName, templateData) => {
    try {
        const template = emailTemplates[templateName];
        if (!template) {
            console.error(`Email template '${templateName}' not found`);
            return false;
        }

        const { subject, html } = template(...templateData);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn(`🛑 Email credentials missing. Notification to ${to} not sent.`);
            return false;
        }

        console.log(`✅ Nodemailer triggered for ${to} [Template: ${templateName}]`);
        console.log(`📤 Sending Nodemailer email to ${to}: ${subject}...`);

        const info = await transporter.sendMail({
            from: `"Freequo" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(`✅ Email sent successfully: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`❌ Nodemailer Error for ${to}:`, error.message);
        return false;
    }
};

// Helper functions
export const sendWelcomeEmail = (email, name, role) =>
    sendEmail(email, 'welcome', [name, role]);

export const sendProposalReceivedEmail = (email, clientName, freelancerName, jobTitle) =>
    sendEmail(email, 'proposalReceived', [clientName, freelancerName, jobTitle]);

export const sendProposalSubmittedEmail = (email, freelancerName, jobTitle) =>
    sendEmail(email, 'proposalSubmitted', [freelancerName, jobTitle]);

export const sendJobPostedEmail = (email, name, jobTitle) =>
    sendEmail(email, 'jobPosted', [name, jobTitle]);

export const sendProposalAcceptedEmail = (email, freelancerName, jobTitle, clientName) =>
    sendEmail(email, 'proposalAccepted', [freelancerName, jobTitle, clientName]);

export default {
    sendEmail,
    sendWelcomeEmail,
    sendProposalReceivedEmail,
    sendProposalSubmittedEmail,
    sendJobPostedEmail,
    sendProposalAcceptedEmail
};
