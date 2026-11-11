// AI-assisted: see docs/AI_LOG.md #64, #68
import admin from 'firebase-admin';
import { getFirestore } from './firestoreAdmin.js';

/**
 * Sends a trip-request push to available drivers matching a category.
 * @param {{
 *   category: string,
 *   title?: string,
 *   body?: string,
 * }} params
 * @returns {Promise<{ sent: number, skipped: number }>}
 */
export async function notifyAvailableDrivers({
  category,
  title = 'Nueva solicitud',
  body = 'Tienes una solicitud de viaje entrante.',
}) {
  const db = getFirestore();
  const locationsSnap = await db
    .collection('driverLocations')
    .where('isAvailable', '==', true)
    .where('category', '==', category)
    .get();

  let sent = 0;
  let skipped = 0;

  for (const locationDoc of locationsSnap.docs) {
    const uid = locationDoc.id;
    const driverSnap = await db.collection('drivers').doc(uid).get();
    const token = driverSnap.exists ? String(driverSnap.data()?.fcmToken ?? '').trim() : '';
    if (!token) {
      skipped += 1;
      continue;
    }

    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data: {
          type: 'incoming_trip',
          category: String(category),
        },
        android: {
          priority: 'high',
        },
      });
      sent += 1;
    } catch (error) {
      skipped += 1;
      console.warn(
        `Push to ${uid} failed:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return { sent, skipped };
}
