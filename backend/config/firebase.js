import admin from 'firebase-admin';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

let serviceAccount;

// Method 1: Environment variable (Render production - most secure)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        console.log('🌐 Using Firebase service account from environment variable');
    } catch (e) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env var:', e.message);
    }
}

// Method 2: Render secret file path
const renderSecretPath = '/etc/secrets/serviceAccountKey.json';
// Method 3: Local file (development)
const localSecretPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

if (!serviceAccount && fs.existsSync(renderSecretPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(renderSecretPath, 'utf8'));
    console.log('📦 Using Firebase service account from Render secrets');
} else if (!serviceAccount && fs.existsSync(localSecretPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(localSecretPath, 'utf8'));
    console.log('💻 Using Firebase service account from local file');
} else if (!serviceAccount) {
    try {
        serviceAccount = require('../serviceAccountKey.json');
    } catch (error) {
        console.warn('⚠️ No Firebase service account found. Social login may not work.');
    }
}

if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
}

export default admin;
