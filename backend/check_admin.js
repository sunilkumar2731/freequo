import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await User.findOne({
            $or: [
                { role: 'admin' },
                { email: 'freequoo@gmail.com' }
            ]
        });
        console.log(admin ? `Admin found: ${admin.email}` : 'Admin NOT found');

        if (admin) {
            console.log(`Admin Role: ${admin.role}`);
        }

        const allAdmins = await User.find({ role: 'admin' });
        console.log(`Total workers with admin role: ${allAdmins.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

check();
