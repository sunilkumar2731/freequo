import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

async function fixAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const admin = await User.findOne({ 
            $or: [
                { role: 'admin' },
                { email: 'admin@freequo.com' },
                { email: 'freequoo@gmail.com' }
            ]
        });

        if (admin) {
            console.log(`Found admin: ${admin.email}`);
            admin.password = 'Admin@27';
            await admin.save();
            console.log('✅ Admin password updated to Admin@27 in database');
        } else {
            console.log('No admin user found. Creating one...');
            await User.create({
                name: 'System Admin',
                email: 'admin@freequo.com',
                password: 'Admin@27',
                role: 'admin',
                status: 'active'
            });
            console.log('✅ Created admin@freequo.com with password Admin@27');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

fixAdmin();
