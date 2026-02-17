import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Job from './models/Job.js';

dotenv.config();

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const userCount = await User.countDocuments();
        const jobCount = await Job.countDocuments();

        console.log('Total Users in DB:', userCount);
        console.log('Total Jobs in DB:', jobCount);

        const users = await User.find({}).limit(5);
        console.log('Sample Users:', users.map(u => `${u.name} (${u.role})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDB();
