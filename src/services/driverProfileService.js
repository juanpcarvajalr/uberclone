// AI-assisted: see docs/AI_LOG.md #65
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Updates editable driver and vehicle fields in a single batch.
 * @param {{
 *   uid: string,
 *   vehicleId: string,
 *   driverPatch: object,
 *   vehiclePatch: object,
 * }} params
 * @returns {Promise<void>}
 */
export async function updateDriverProfile({
  uid,
  vehicleId,
  driverPatch,
  vehiclePatch,
}) {
  if (!uid || !vehicleId) {
    throw new Error('uid and vehicleId are required');
  }

  const batch = writeBatch(db);
  const now = serverTimestamp();

  batch.update(doc(db, 'drivers', uid), {
    ...driverPatch,
    updatedAt: now,
  });
  batch.update(doc(db, 'vehicles', vehicleId), {
    ...vehiclePatch,
    updatedAt: now,
  });

  await batch.commit();
}
