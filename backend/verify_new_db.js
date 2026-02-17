import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Use Cloudflare DNS as fallback
try {
    dns.setServers(['1.1.1.1']);
} catch (e) { }

dotenv.config();

async function testConnection() {
    console.log('Testing New MongoDB Connection...');
    const uri = process.env.MONGODB_URI;
    console.log('URI:', uri.replace(/:([^@]+)@/, ':****@'));

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        console.log('✅ Connection Successful!');

        // Show collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in database:', collections.map(c => c.name));

        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }
}

testConnection();
