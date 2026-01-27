import admin from '../config/firebase.js';
import {
    sendWelcomeEmail,
    sendApplicationConfirmedEmail,
    sendProposalReceivedEmail,
    sendProposalAcceptedEmail
} from '../services/emailService.js';

// @desc    Send application email
// @route   POST /api/email/send-application-email
// @access  Public
export const sendApplicationEmail = async (req, res) => {
    try {
        const {
            freelancerEmail,
            freelancerName,
            jobName,
            salary,
            duration,
            appliedAt
        } = req.body;

        if (!freelancerEmail) {
            return res.status(400).json({
                success: false,
                error: 'Freelancer email is required'
            });
        }

        const applicationDate = appliedAt
            ? new Date(appliedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        console.log(`📧 Triggering application confirmed email for ${freelancerEmail}`);

        const success = await sendApplicationConfirmedEmail(
            freelancerEmail,
            freelancerName || 'there',
            jobName || 'Job Application',
            salary || 'N/A',
            duration || 'N/A',
            applicationDate
        );

        res.json({
            success: success,
            message: success ? 'Email sent successfully' : 'Failed to send email'
        });

    } catch (error) {
        console.error('❌ Error in sendApplicationEmail:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Start Firestore Listener for application status changes
export const startFirestoreListener = () => {
    const db = admin.firestore();
    console.log(`👀 Watching Firestore for job application updates...`);

    db.collection('jobApplications').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'modified') {
                const data = change.doc.data();
                const status = data.status;

                // Send email only if status changed and it's not 'pending'
                if (status && status !== 'pending' && data.lastNotifiedStatus !== status) {
                    console.log(`📧 Sending ${status} notification to ${data.freelancerEmail}`);

                    let success = false;
                    if (status === 'accepted') {
                        success = await sendProposalAcceptedEmail(
                            data.freelancerEmail,
                            data.freelancerName,
                            data.jobName,
                            data.clientName || 'The Client'
                        );
                    } else {
                        // Fallback for other status updates
                        console.log(`Status update: ${status} for ${data.freelancerEmail}`);
                    }

                    if (success) {
                        await change.doc.ref.update({
                            lastNotifiedStatus: status,
                            lastNotificationSentAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }
            }
        });
    }, error => {
        console.error("❌ Firestore Listener Error:", error.message);
    });
};
