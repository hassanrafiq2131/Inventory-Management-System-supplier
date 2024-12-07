import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// try {
//     admin.initializeApp({
//         // Use the service account file
//         credential: admin.credential.cert(join(__dirname, '../../inventory-mgmt-sys-d2e11-firebase-adminsdk-4yuvh-4fb4199357.json')),
//     });
//     console.log('Firebase Admin initialized successfully');
// } catch (error) {
//     console.error('Firebase Admin initialization error:', error);
// }

try {
    // Parse the service account key from the environment variable
    const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

    // Initialize Firebase Admin SDK
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
    });

    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}

export default admin;