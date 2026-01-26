// Create Demo Users Script - Creates Client, Freelancer, and Admin accounts
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// Demo users matching the frontend Quick Demo Access buttons
const demoUsers = [
    {
        name: 'John Smith',
        email: 'john@company.com',
        password: 'demo123',
        role: 'client',
        company: 'Tech Solutions Inc',
        status: 'active',
        bio: 'Looking for talented freelancers to help with our projects.',
        location: 'New York, USA'
    },
    {
        name: 'Sarah Johnson',
        email: 'sarah@gmail.com',
        password: 'demo123',
        role: 'freelancer',
        status: 'active',
        bio: 'Full-stack developer with 5+ years of experience. Specialized in React, Node.js, and modern web technologies.',
        skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'CSS'],
        hourlyRate: 50,
        location: 'San Francisco, USA'
    },
    {
        name: 'Admin User',
        email: 'admin@freequo.com',
        password: 'demo123',
        role: 'admin',
        status: 'active',
        bio: 'Platform administrator',
        location: 'Remote'
    }
];

async function createDemoUsers() {
    try {
        console.log('🌱 Creating demo users...\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        for (const userData of demoUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
                // Update password to ensure it matches
                existingUser.password = userData.password;
                await existingUser.save();
                console.log(`   ✅ Password updated to: demo123`);
            } else {
                await User.create(userData);
                console.log(`✅ Created ${userData.role}: ${userData.email}`);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('   🎉 Demo Users Ready!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        console.log('   👤 CLIENT:');
        console.log('      Email:    john@company.com');
        console.log('      Password: demo123');
        console.log('');
        console.log('   💼 FREELANCER:');
        console.log('      Email:    sarah@gmail.com');
        console.log('      Password: demo123');
        console.log('');
        console.log('   🔑 ADMIN:');
        console.log('      Email:    admin@freequo.com');
        console.log('      Password: demo123');
        console.log('');
        console.log('═══════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('📭 Database connection closed');
        process.exit(0);
    }
}

// Run the script
createDemoUsers();
