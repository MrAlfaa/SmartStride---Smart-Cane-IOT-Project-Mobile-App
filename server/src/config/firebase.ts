import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin with the service account
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  databaseURL: "https://smart-cane-57954-default-rtdb.firebaseio.com"
});

// Get database reference
const db = admin.database();

export { admin, db };