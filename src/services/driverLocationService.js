// AI-assisted: see docs/AI_LOG.md #50
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Writes driverLocations/{uid} while available / on trip (Spec 6 / 11).
 * @param {{
 *   uid: string,
 *   isAvailable: boolean,
 *   location: { lat: number, lng: number },
 *   category: string,
 * }} params
 * @returns {Promise<void>}
 */
export async function upsertDriverLocation({
  uid,
  isAvailable,
  location,
  category,
}) {
  try {
    if (!uid) {
      throw new Error('uid is required');
    }
    await setDoc(
      doc(db, 'driverLocations', uid),
      {
        isAvailable: Boolean(isAvailable),
        location: {
          lat: Number(location.lat),
          lng: Number(location.lng),
        },
        category: category || 'economy',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
