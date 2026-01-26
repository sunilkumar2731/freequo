const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sunilkumar960033@gmail.com',
        pass: 'ikkqwtjllewfuich'
    }
});

/**
 * Cloud Function: Send email notification when a job application is created
 * Triggers automatically when a new document is added to 'jobApplications' collection
 */
exports.sendJobApplicationEmail = functions.firestore
    .document('jobApplications/{applicationId}')
    .onCreate(async (snap, context) => {
        try {
            // Get the application data from the newly created document
            const applicationData = snap.data();

            console.log('New job application created:', context.params.applicationId);
            console.log('Application data:', applicationData);

            // Extract required fields
            const {
                freelancerEmail,
                freelancerName,
                jobName,
                salary,
                duration,
                appliedAt
            } = applicationData;

            // Validate required fields
            if (!freelancerEmail) {
                console.error('Freelancer email is missing');
                return null;
            }

            // Format the application date
            const applicationDate = appliedAt
                ? new Date(appliedAt.toDate()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

            // Email HTML template
            const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366f1, #10b981);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        h1 {
            color: #1f2937;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        .success-badge {
            display: inline-block;
            background: #d1fae5;
            color: #065f46;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .greeting {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 20px;
        }
        .job-details {
            background: #f9fafb;
            border-left: 4px solid #6366f1;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .job-details h2 {
            color: #1f2937;
            font-size: 20px;
            margin: 0 0 15px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 500;
        }
        .message {
            background: linear-gradient(135deg, #6366f1, #10b981);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
            font-size: 16px;
            font-weight: 500;
        }
        .next-steps {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .next-steps h3 {
            color: #1e40af;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .next-steps li {
            color: #1e3a8a;
            margin: 8px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #10b981);
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-value {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">F</div>
            <h1>Application Confirmed!</h1>
            <div class="success-badge">✓ Successfully Applied</div>
        </div>

        <div class="greeting">
            Hi ${freelancerName || 'there'},
        </div>

        <div class="message">
            🎉 You have successfully applied for this job!
        </div>

        <div class="job-details">
            <h2>📋 Job Details</h2>
            <div class="detail-row">
                <span class="detail-label">Job Name:</span>
                <span class="detail-value">${jobName || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Salary:</span>
                <span class="detail-value">${salary || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${duration || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Applied On:</span>
                <span class="detail-value">${applicationDate}</span>
            </div>
        </div>

        <div class="next-steps">
            <h3>📌 What's Next?</h3>
            <ul>
                <li>The client will review your application</li>
                <li>You'll receive a notification if you're shortlisted</li>
                <li>Keep your profile updated for better chances</li>
                <li>Check your dashboard regularly for updates</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="https://your-website.com/freelancer/dashboard" class="button">
                View My Applications
            </a>
        </div>

        <div class="footer">
            <p>This is an automated email from Freequo. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Freequo. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `;

            // Plain text version (fallback)
            const emailText = `
Job Application Confirmation

Hi ${freelancerName || 'there'},

You have successfully applied for this job!

Job Details:
- Job Name: ${jobName || 'N/A'}
- Salary: ${salary || 'N/A'}
- Duration: ${duration || 'N/A'}
- Applied On: ${applicationDate}

What's Next?
- The client will review your application
- You'll receive a notification if you're shortlisted
- Keep your profile updated for better chances
- Check your dashboard regularly for updates

This is an automated email from Freequo.
© ${new Date().getFullYear()} Freequo. All rights reserved.
            `;

            // Email options
            const mailOptions = {
                from: `"Freequo" <sunilkumar960033@gmail.com>`,
                to: freelancerEmail,
                subject: `✓ Application Confirmed: ${jobName || 'Job Application'}`,
                text: emailText,
                html: emailHTML
            };

            // Send email
            const info = await transporter.sendMail(mailOptions);

            console.log('Email sent successfully:', info.messageId);
            console.log('Email sent to:', freelancerEmail);

            // Update the application document with email status
            await snap.ref.update({
                emailSent: true,
                emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
                emailMessageId: info.messageId
            });

            return {
                success: true,
                messageId: info.messageId,
                recipient: freelancerEmail
            };

        } catch (error) {
            console.error('Error sending email:', error);

            // Update the application document with error status
            await snap.ref.update({
                emailSent: false,
                emailError: error.message,
                emailErrorAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: false,
                error: error.message
            };
        }
    });
