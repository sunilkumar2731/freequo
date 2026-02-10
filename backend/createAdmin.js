import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'freequoo@gmail.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);

            // Update role to admin if it's not
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin role');
            }
        } else {
            // Create new admin user
            const adminUser = await User.create({
                email: 'freequoo@gmail.com',
                password: 'Admin@27', // You can change this
                name: 'Admin',
                role: 'admin',
                status: 'active',
                signupMethod: 'email'
            });

            console.log('✅ Admin user created successfully!');
            console.log('Email:', adminUser.email);
            console.log('Password: Admin@27');
            console.log('Role:', adminUser.role);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdminUser();
