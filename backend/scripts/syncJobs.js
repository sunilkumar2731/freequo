import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jobSyncService from '../services/jobSyncService.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Main sync function
const syncJobs = async () => {
    try {
        console.log('🚀 Starting job sync from Remotive API...\n');

        await connectDB();

        // Sync jobs with options
        const result = await jobSyncService.syncJobs({
            limit: 100,        // Fetch up to 100 jobs
            removeOld: true    // Remove expired jobs
        });

        console.log('\n📊 Sync Results:');
        console.log(`   ✅ Inserted: ${result.inserted} jobs`);
        console.log(`   🔄 Updated: ${result.updated} jobs`);
        console.log(`   📈 Total: ${result.total} jobs`);

        // Get stats
        const stats = await jobSyncService.getSyncStats();
        console.log('\n📈 Database Stats:');
        console.log(`   Total Jobs: ${stats.total}`);
        console.log(`   Remote Jobs: ${stats.remote}`);
        console.log(`   Platform Jobs: ${stats.platform}`);
        console.log(`   Expired Jobs: ${stats.expired}`);

        console.log('\n✅ Job sync completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);
        process.exit(1);
    }
};

// Run the sync
syncJobs();
