import axios from 'axios';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.EMAIL_USER || 'freequoo@gmail.com';
const SENDER_NAME = 'Freequo';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://freequo-frontend.onrender.com';
// Use the production URL for email assets so Gmail can fetch them (localhost isn't accessible to Gmail)
const IMAGES_BASE_URL = 'https://freequo-frontend.onrender.com';
const LOGO_URL = `${IMAGES_BASE_URL}/freequo-logo.png`;
const ICON_URL = `${IMAGES_BASE_URL}/f-logo.png`;

// Initialize Nodemailer transporter if Gmail credentials are available
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        console.log('📬 Nodemailer SMTP transporter initialized with Gmail credentials.');
    } catch (err) {
        console.error('❌ Failed to initialize Nodemailer transporter:', err.message);
    }
}

/**
 * Centralized function to send email via Brevo REST API (HTTPS) or Gmail SMTP (Fallback)
 */
export const sendEmail = async (to, templateName, templateData) => {
    const template = emailTemplates[templateName];
    if (!template) {
        console.error(`Email template '${templateName}' not found`);
        return false;
    }

    const { subject, html } = template(...templateData);
    let sentSuccess = false;

    // Method 1: Try Brevo API first if key is present
    if (BREVO_API_KEY) {
        try {
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
                sentSuccess = true;
            }
        } catch (error) {
            console.warn(`⚠️ Brevo API Error for ${to}:`, error.response?.data || error.message);
            console.log('🔄 Attempting fallback to Nodemailer Gmail SMTP...');
        }
    }

    // Method 2: Fallback to Nodemailer Gmail SMTP if Brevo was not used or failed
    if (!sentSuccess && transporter) {
        try {
            console.log(`✅ Attempting to send email to ${to} via Gmail SMTP...`);
            const info = await transporter.sendMail({
                from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
                to: to,
                subject: subject,
                html: html
            });

            console.log(`✅ Email sent successfully via Gmail SMTP! ID: ${info.messageId}`);
            sentSuccess = true;
        } catch (error) {
            console.error(`❌ Gmail SMTP Error for ${to}:`, error.message);
        }
    }

    if (!sentSuccess) {
        console.error(`❌ Failed to send email to ${to} using any available methods.`);
    }

    return sentSuccess;
};

// --- Email Templates ---
const emailTemplates = {
    welcome: (name, role) => {
        const isClient = role === 'client';
        return {
            subject: 'Welcome to Freequo! 🎉',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6; }
                    .header { text-align: center; padding: 20px 0; }
                    .logo { height: 40px; }
                    .content { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
                    .banner { background: linear-gradient(135deg, #6366f1 0%, #10b981 100%); color: white; padding: 40px 20px; text-align: center; }
                    .body-content { padding: 30px; }
                    .btn { display: inline-block; background: #6366f1; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
                    .footer { text-align: center; padding: 20px; font-size: 14px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                <div class="header">
                    <div style="background: white; padding: 20px; border-radius: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <img src="${LOGO_URL}" alt="Freequo" style="height: 100px; width: auto; display: block; margin: 0 auto;">
                        <p style="margin: 10px 0 0; color: #64748b; font-size: 13px; font-weight: 500;">Your trusted freelance partner</p>
                    </div>
                </div>
                    <div class="content">
                        <div class="banner">
                            <h1 style="margin:0">Welcome to Freequo!</h1>
                        </div>
                        <div class="body-content">
                            <h2>Hi ${name}! 👋</h2>
                            <p>We're thrilled to have you join our community as a <strong>${role}</strong>.</p>
                            <p>${isClient
                    ? 'Start posting your job requirements and find the perfect talent for your professional projects.'
                    : 'Start exploring exciting opportunities and grow your career by applying to the best jobs in your niche.'}</p>
                            <a href="${FRONTEND_URL}" class="btn">Explore Platform</a>
                        </div>
                    </div>
                    <div class="footer">
                        © 2024 Freequo. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            `
        };
    },

    applicationConfirmed: (name, jobName, salary, duration, appliedOn) => ({
        subject: `✓ Application Confirmed: ${jobName}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; }
                .header { text-align: center; padding: 20px 0; }
                .logo-square { width: 60px; height: 60px; border-radius: 12px; margin-bottom: 10px; }
                .content { background: #ffffff; border-radius: 16px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .status-badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
                .banner { background: linear-gradient(90deg, #6366f1 0%, #10b981 100%); padding: 15px; color: white; text-align: center; font-size: 14px; font-weight: 500; }
                .details-card { background: #f8fafc; margin: 25px; padding: 25px; border-radius: 12px; border: 1px solid #f1f5f9; }
                .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .label { width: 100px; color: #64748b; font-weight: 500; }
                .value { flex: 1; color: #1e293b; font-weight: 600; }
                .next-section { background: #eff6ff; margin: 25px; padding: 25px; border-radius: 12px; }
                .bullet { margin-bottom: 8px; font-size: 13px; color: #3b82f6; display: flex; align-items: start; }
                .bullet-icon { margin-right: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="background: white; padding: 20px; border-radius: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <img src="${LOGO_URL}" alt="Freequo" style="height: 120px; width: auto; display: block; margin: 0 auto;">
                        <p style="margin: 10px 0 0; color: #64748b; font-size: 14px; font-weight: 500;">Your trusted freelance partner</p>
                    </div>
                    <h2 style="margin: 20px 0 10px; color: #0f172a;">Application Confirmed!</h2>
                    <div class="status-badge">✓ Successfully Applied</div>
                </div>
                <div class="content">
                    <p style="padding: 0 25px; font-size: 14px; color: #64748b;">Hi ${name || 'User'},</p>
                    <div class="banner">
                        🚀 You have successfully applied for this job!
                    </div>
                    <div class="details-card">
                        <h4 style="margin-top:0; color: #475569; display: flex; align-items: center;">
                            <span style="margin-right:8px">📋</span> Job Details
                        </h4>
                        <div class="detail-row"><div class="label">Job Name:</div><div class="value">${jobName}</div></div>
                        <div class="detail-row"><div class="label">Salary:</div><div class="value">${salary}</div></div>
                        <div class="detail-row"><div class="label">Duration:</div><div class="value">${duration}</div></div>
                        <div class="detail-row" style="border:none"><div class="label">Applied On:</div><div class="value">${appliedOn}</div></div>
                    </div>
                    <div class="next-section">
                        <h4 style="margin-top:0; color: #1d4ed8;">📌 What's Next?</h4>
                        <div class="bullet"><span>•</span> <span style="margin-left:8px; color:#475569">The client will review your application</span></div>
                        <div class="bullet"><span>•</span> <span style="margin-left:8px; color:#475569">You'll receive a notification if you're shortlisted</span></div>
                        <div class="bullet"><span>•</span> <span style="margin-left:8px; color:#475569">Keep your profile updated for better chances</span></div>
                        <div class="bullet"><span>•</span> <span style="margin-left:8px; color:#475569">Check your dashboard regularly for updates</span></div>
                    </div>
                </div>
                <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                    This is an automated message from Freequo. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        `
    }),

    proposalReceived: (clientName, freelancerName, jobTitle) => ({
        subject: `New proposal for "${jobTitle}" 📬`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; }
                .content { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                .banner { background: #6366f1; color: white; padding: 30px; text-align: center; }
                .body { padding: 30px; }
                .btn { display: inline-block; background: #6366f1; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="banner"><h2>New Proposal!</h2></div>
                    <div class="body">
                        <h3>Hi ${clientName},</h3>
                        <p><strong>${freelancerName}</strong> has submitted a proposal for your job "<strong>${jobTitle}</strong>".</p>
                        <p>Log in to your dashboard to review the proposal and hire the freelancer.</p>
                        <a href="${FRONTEND_URL}/client/dashboard" class="btn">Review Proposal</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    proposalAccepted: (freelancerName, jobTitle, clientName) => ({
        subject: `Congratulations! Your proposal for "${jobTitle}" was accepted! 🎊`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; }
                .content { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
                .banner { background: #10b981; color: white; padding: 30px; text-align: center; }
                .body { padding: 30px; }
                .btn { display: inline-block; background: #10b981; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="banner"><h2>Proposal Accepted! 🎉</h2></div>
                    <div class="body">
                        <h3>Hi ${freelancerName},</h3>
                        <p>Great news! <strong>${clientName}</strong> has accepted your proposal for "<strong>${jobTitle}</strong>".</p>
                        <p>You can now start working on the project and communicate with the client.</p>
                        <a href="${FRONTEND_URL}/freelancer/dashboard" class="btn">View Project</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    adminNewUser: (name, email, role, date) => ({
        subject: 'New User Joined – Freequo 🚀',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; }
                .content { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 30px; }
                .detail { margin-bottom: 10px; }
                .label { font-weight: bold; color: #6366f1; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style="color: #6366f1;">New User Registered! 🚀</h2>
                <div class="content">
                    <p>A new user has just joined the Freequo community.</p>
                    <div class="detail"><span class="label">Name:</span> ${name}</div>
                    <div class="detail"><span class="label">Email:</span> ${email}</div>
                    <div class="detail"><span class="label">Role:</span> ${role}</div>
                    <div class="detail"><span class="label">Date:</span> ${date}</div>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    adminUserLogin: (name, email, role, date, loginCount) => ({
        subject: `User Login Activity: ${name} 🔑`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; }
                .content { background: #f1f5f9; border-radius: 12px; border: 1px solid #e2e8f0; padding: 25px; }
                .label { font-weight: bold; color: #475569; }
            </style>
        </head>
        <body>
            <div class="container">
                <h3>User Login Detected 🔑</h3>
                <div class="content">
                    <p>A user has just logged into the platform.</p>
                    <p><span class="label">Name:</span> ${name}</p>
                    <p><span class="label">Email:</span> ${email}</p>
                    <p><span class="label">Role:</span> ${role}</p>
                    <p><span class="label">Total Logins:</span> ${loginCount}</p>
                    <p><span class="label">Time:</span> ${date}</p>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    directMessage: (senderName, senderEmail, message) => ({
        subject: `New Message from ${senderName} on Freequo 📩`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; }
                .content { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 30px; }
                .message-box { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; font-style: italic; }
                .footer { color: #64748b; font-size: 13px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h2>Hi there!</h2>
                    <p>You have received a new message from <strong>${senderName}</strong> (${senderEmail}) via the Freequo platform.</p>
                    <div class="message-box">
                        "${message}"
                    </div>
                    <p>You can reply directly to this email or log in to Freequo to communicate.</p>
                </div>
                <div class="footer">
                    <p>© Freequo - Connecting talent with opportunity</p>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    adminToUser: (userName, subject, message) => ({
        subject: `${subject} – Freequo Support`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6; }
                .header { background: #1e293b; color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0; }
                .content { background: #ffffff; border: 1px solid #e2e8f0; padding: 35px; border-radius: 0 0 12px 12px; }
                .message-body { background: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; margin: 25px 0; color: #1e293b; font-size: 15px; }
                .footer { text-align: center; padding: 25px; color: #94a3b8; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin:0">Freequo Administrator</h2>
                </div>
                <div class="content">
                    <p>Hi ${userName},</p>
                    <p>You have received an official message from the Freequo administration regarding your account.</p>
                    <div class="message-body">
                        ${message}
                    </div>
                    <p>If you have any questions, please reply to this email or visit our help center.</p>
                    <p>Best Regards,<br><strong>Freequo Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an official communication from Freequo. Please keep this email for your records.</p>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    userLogin: (name, email, role, date) => ({
        subject: 'Welcome Back to Freequo! 👋',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6; }
                .header { text-align: center; padding: 20px 0; }
                .content { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .banner { background: linear-gradient(135deg, #6366f1 0%, #10b981 100%); color: white; padding: 40px 20px; text-align: center; }
                .body-content { padding: 30px; }
                .highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
                .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #10b981); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin-top: 20px; font-size: 15px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
                .divider { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="background: white; padding: 20px; border-radius: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <img src="${LOGO_URL}" alt="Freequo" style="height: 100px; width: auto; display: block; margin: 0 auto;">
                        <p style="margin: 10px 0 0; color: #64748b; font-size: 13px; font-weight: 500;">Your trusted freelance partner</p>
                    </div>
                </div>
                <div class="content">
                    <div class="banner">
                        <h1 style="margin: 0 0 8px; font-size: 26px;">Welcome Back! 👋</h1>
                        <p style="margin: 0; font-size: 15px; opacity: 0.9;">Great to see you again, ${name}!</p>
                    </div>
                    <div class="body-content">
                        <p style="font-size: 15px;">Hi <strong>${name}</strong>,</p>
                        <p style="font-size: 15px; color: #475569;">
                            You've successfully logged in to your Freequo account as a <strong>${role}</strong>.
                            We're glad you're back — your opportunities await!
                        </p>

                        <div class="highlight-box">
                            <p style="margin: 0; font-size: 22px;">🎯</p>
                            <p style="margin: 8px 0 0; font-weight: 600; color: #166534; font-size: 15px;">
                                ${role === 'client'
                                    ? 'Ready to find the perfect freelancer for your project?'
                                    : 'Ready to discover exciting new opportunities?'}
                            </p>
                            <p style="margin: 6px 0 0; font-size: 13px; color: #64748b;">
                                ${role === 'client'
                                    ? 'Post a job or review your existing proposals today.'
                                    : 'Browse the latest jobs and apply to projects that match your skills.'}
                            </p>
                        </div>

                        <hr class="divider">

                        <div style="text-align: center;">
                            <a href="${FRONTEND_URL}/${role === 'client' ? 'client/dashboard' : role === 'freelancer' ? 'freelancer/dashboard' : 'admin/dashboard'}" class="btn">
                                Go to My Dashboard →
                            </a>
                        </div>

                        <p style="margin-top: 25px; font-size: 13px; color: #94a3b8; text-align: center;">
                            Logged in on ${date}
                        </p>
                    </div>
                </div>
                <div class="footer">
                    <p>© Freequo. All rights reserved.</p>
                    <p style="margin: 4px 0 0;">Connecting talent with opportunity.</p>
                </div>
            </div>
        </body>
        </html>
        `
    }),

    jobPosted: (name, jobTitle, budget, category) => ({
        subject: `Your Job "${jobTitle}" has been posted successfully! 🚀`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6; }
                .header { text-align: center; padding: 20px 0; }
                .logo { height: 100px; }
                .content { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .banner { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 40px 20px; text-align: center; }
                .body-content { padding: 30px; }
                .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .detail-row:last-child { border: none; }
                .label { color: #64748b; font-weight: 500; }
                .value { color: #1e293b; font-weight: 600; }
                .btn { display: inline-block; background: #6366f1; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 15px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="background: white; padding: 20px; border-radius: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <img src="${LOGO_URL}" alt="Freequo" style="height: 100px; width: auto; display: block; margin: 0 auto;">
                        <p style="margin: 10px 0 0; color: #64748b; font-size: 13px; font-weight: 500;">Your trusted freelance partner</p>
                    </div>
                </div>
                <div class="content">
                    <div class="banner">
                        <h1 style="margin:0; font-size: 24px;">Job Posted Successfully!</h1>
                    </div>
                    <div class="body-content">
                        <p>Hi <strong>${name}</strong>,</p>
                        <p>Your job has been published on the platform and is now open for proposals from top freelancers.</p>
                        
                        <div class="details-card">
                            <div class="detail-row"><span class="label">Job Title:</span><span class="value">${jobTitle}</span></div>
                            <div class="detail-row"><span class="label">Budget:</span><span class="value">$${budget}</span></div>
                            <div class="detail-row"><span class="label">Category:</span><span class="value">${category}</span></div>
                        </div>

                        <p>You will receive email notifications as soon as freelancers submit proposals for your review.</p>

                        <div style="text-align: center;">
                            <a href="${FRONTEND_URL}/client/dashboard" class="btn">Manage Your Job</a>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <p>© Freequo. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `
    })
};

// --- Helper functions ---
export const sendWelcomeEmail = (email, name, role) =>
    sendEmail(email, 'welcome', [name, role]);

export const sendAdminNewUserEmail = (name, email, role) =>
    sendEmail('freequoo@gmail.com', 'adminNewUser', [name, email, role, new Date().toLocaleString()]);

export const sendAdminLoginNotification = (name, email, role, loginCount) =>
    sendEmail('freequoo@gmail.com', 'adminUserLogin', [name, email, role, new Date().toLocaleString(), loginCount]);

export const sendUserLoginNotification = (email, name, role) =>
    sendEmail(email, 'userLogin', [name, email, role, new Date().toLocaleString()]);

export const sendApplicationConfirmedEmail = (email, name, jobName, salary, duration, appliedOn) =>
    sendEmail(email, 'applicationConfirmed', [name, jobName, salary, duration, appliedOn]);

export const sendProposalReceivedEmail = (email, clientName, freelancerName, jobTitle) =>
    sendEmail(email, 'proposalReceived', [clientName, freelancerName, jobTitle]);

export const sendProposalAcceptedEmail = (email, freelancerName, jobTitle, clientName) =>
    sendEmail(email, 'proposalAccepted', [freelancerName, jobTitle, clientName]);

export const sendDirectMessageEmail = (toEmail, senderName, senderEmail, message) =>
    sendEmail(toEmail, 'directMessage', [senderName, senderEmail, message]);

// Backward compatibility or legacy support
export const sendProposalSubmittedEmail = (email, freelancerName, jobTitle) =>
    sendEmail(email, 'applicationConfirmed', [freelancerName, jobTitle, 'Varies', 'TBD', new Date().toLocaleDateString()]);

export const sendAdminToUserEmail = (userEmail, userName, subject, message) =>
    sendEmail(userEmail, 'adminToUser', [userName, subject, message]);

export const sendJobPostedEmail = (email, name, jobTitle, budget = 'TBD', category = 'General') =>
    sendEmail(email, 'jobPosted', [name, jobTitle, budget, category]);

export default {
    sendEmail,
    sendWelcomeEmail,
    sendAdminNewUserEmail,
    sendAdminLoginNotification,
    sendUserLoginNotification,
    sendApplicationConfirmedEmail,
    sendProposalReceivedEmail,
    sendProposalAcceptedEmail,
    sendProposalSubmittedEmail,
    sendJobPostedEmail,
    sendDirectMessageEmail,
    sendAdminToUserEmail
};
