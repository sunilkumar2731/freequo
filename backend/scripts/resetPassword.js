import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

// Setup DNS servers for SRV resolution on this network
try {
    dns.setServers(['1.1.1.1', '8.8.4.4', '8.8.8.8']);
} catch (e) {
    console.warn('⚠️ Could not set custom DNS servers:', e.message);
}

dotenv.config();

// Get command line arguments: node scripts/resetPassword.js <email> <newPassword>
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
    console.log("Usage: node scripts/resetPassword.js <email> <newPassword>");
    console.log("Example: node scripts/resetPassword.js test@example.com 123456");
    process.exit(1);
}

async function reset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        // Update the password in database (Mongoose pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        console.log(`\n🎉 SUCCESS! Password for user "${user.name}" (${email}) has been reset to "${newPassword}".`);
        console.log("You can now log in with this new password!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error resetting password:", err.message);
        process.exit(1);
    }
}

reset();
