// AI-assisted: see docs/AI_LOG.md #57
import fs from 'node:fs';
import admin from 'firebase-admin';

let firestore = null;

/**
 * Initializes Firebase Admin with a service account JSON file.
 * @param {string} serviceAccountPath
 * @returns {FirebaseFirestore.Firestore}
 */
export function initFirestore(serviceAccountPath) {
  try {
    if (firestore) {
      return firestore;
    }

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        `Firebase service account not found at ${serviceAccountPath}. ` +
          'Download it from Firebase Console → Project settings → Service accounts.'
      );
    }

    const raw = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(raw);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firestore = admin.firestore();
    return firestore;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to initialize Firebase Admin'
    );
  }
}

/**
 * @returns {FirebaseFirestore.Firestore}
 */
export function getFirestore() {
  if (!firestore) {
    throw new Error('Firestore Admin is not initialized');
  }
  return firestore;
}
