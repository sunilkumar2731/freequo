import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Job from './models/Job.js';

// Setup DNS servers for SRV resolution on this network
try {
    dns.setServers(['1.1.1.1', '8.8.4.4', '8.8.8.8']);
} catch (e) {
    console.warn('⚠️ Could not set custom DNS servers:', e.message);
}

dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const userCount = await User.countDocuments();
        const jobCount = await Job.countDocuments();

        console.log('Total Users in DB:', userCount);
        console.log('Total Jobs in DB:', jobCount);

        const targetEmail = 'viswanathpaarthiban1@gmail.com';
        const user = await User.findOne({ email: targetEmail.toLowerCase() });
        if (user) {
            console.log(`🎉 Found target user: name=${user.name}, email=${user.email}, role=${user.role}, passwordHash=${user.password ? 'Exists' : 'None'}`);
        } else {
            console.log(`❌ Target user ${targetEmail} not found!`);
            const allUsers = await User.find({}, 'name email role');
            console.log('All Users in DB:', allUsers);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDB();
