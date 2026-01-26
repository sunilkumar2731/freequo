import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import jobRoutes from './routes/jobs.js';
import proposalRoutes from './routes/proposals.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import emailRoutes from './routes/email.js'; // The new email routes
import { startFirestoreListener } from './controllers/emailController.js'; // Firestore listener

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', emailRoutes); // Mounts /api/send-application-email and /api/health

// Start Firestore Listener (Background)
try {
    startFirestoreListener();
} catch (error) {
    console.error('Failed to start Firestore listener:', error);
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ Auth & API endpoints ready`);
    console.log(`📧 Email services active`);
});
