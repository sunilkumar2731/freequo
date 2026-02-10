import mongoose from 'mongoose';

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    // Check if MongoDB URI is configured
    if (!mongoUri) {
        console.error('❌ MONGODB_URI is not defined in environment variables');
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  MongoDB Setup Required                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  You need to configure MongoDB to run the backend.           ║
║                                                               ║
║  Option 1: MongoDB Atlas (Recommended - Free)                ║
║  1. Go to https://cloud.mongodb.com                          ║
║  2. Create a free cluster                                    ║
║  3. Get your connection string                               ║
║  4. Update MONGODB_URI in backend/.env                       ║
║                                                               ║
║  Option 2: Local MongoDB                                     ║
║  1. Install MongoDB Community Edition                        ║
║  2. Start MongoDB service                                    ║
║  3. Use: mongodb://localhost:27017/freequo                   ║
║                                                               ║
║  See SERVICES_SETUP.md for detailed instructions.            ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
`);
        process.exit(1);
    }

    try {
        // Detect if using local MongoDB or Atlas
        const isLocalMongo = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');

        // Connection options
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        };

        // Only add these options for Atlas (not for local MongoDB)
        if (!isLocalMongo) {
            options.maxPoolSize = 10;
            options.minPoolSize = 2;
            options.tls = true;
            options.tlsAllowInvalidCertificates = true;
            options.tlsAllowInvalidHostnames = false;
            options.directConnection = false;
        }

        console.log(`🔄 Connecting to ${isLocalMongo ? 'Local' : 'Atlas'} MongoDB...`);
        const conn = await mongoose.connect(mongoUri, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);

        // Check for specific SSL/TLS error
        if (error.message.includes('tlsv1 alert') || error.message.includes('SSL')) {
            console.log(`
┌─────────────────────────────────────────────────────────────┐
│  SSL/TLS Connection Error Detected                          │
│                                                              │
│  This is a known issue with Node.js 22 and MongoDB Atlas.   │
│                                                              │
│  Solutions:                                                  │
│  1. Downgrade to Node.js 20 LTS (Recommended)               │
│     - Download from: https://nodejs.org                      │
│                                                              │
│  2. Use MongoDB Compass to verify connection works          │
│     - Download: https://www.mongodb.com/products/compass     │
│                                                              │
│  3. Your IP: Make sure 0.0.0.0/0 is whitelisted in Atlas    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
`);
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log(`
┌─────────────────────────────────────────────────────────────┐
│  Could not connect to MongoDB                               │
│                                                             │
│  If using MongoDB Atlas:                                    │
│  - Check your connection string is correct                  │
│  - Ensure your IP is whitelisted                           │
│  - Verify username/password                                 │
└─────────────────────────────────────────────────────────────┘
`);
        }

        // Instead of exiting, we'll just log the error and let the app stay alive
        // This prevents the "Connection Refused" error on the frontend
        console.log('⚠️ Server will continue running without database connectivity.');
    }
};

export default connectDB;
