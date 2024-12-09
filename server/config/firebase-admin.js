import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    admin.initializeApp({
        // Use the service account file
        credential: admin.credential.cert(join(__dirname, '../../web-project-supplier-firebase-adminsdk-zk261-6688967cc9.json')),
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}


export default admin;