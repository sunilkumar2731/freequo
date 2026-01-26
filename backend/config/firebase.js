import admin from 'firebase-admin';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

let serviceAccount;

// Path on Render for secret files is /etc/secrets/serviceAccountKey.json
// Locally it is in the backend root
const renderSecretPath = '/etc/secrets/serviceAccountKey.json';
const localSecretPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

if (fs.existsSync(renderSecretPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(renderSecretPath, 'utf8'));
    console.log('📦 Using Firebase service account from Render secrets');
} else if (fs.existsSync(localSecretPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(localSecretPath, 'utf8'));
    console.log('💻 Using Firebase service account from local file');
} else {
    // Fallback to the hardcoded require if paths aren't found (for legacy support)
    try {
        serviceAccount = require('../serviceAccountKey.json');
    } catch (error) {
        console.warn('⚠️ No Firebase service account file found. Social login may not work.');
    }
}

if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
}

export default admin;
