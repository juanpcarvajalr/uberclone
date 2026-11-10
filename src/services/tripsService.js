// AI-assisted: see docs/AI_LOG.md #50
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { toTripDate } from '../utils/tripDates';
import { isValid } from 'date-fns';

/**
 * @param {unknown} value
 * @returns {string|null}
 */
function toIsoOrNull(value) {
  try {
    if (value == null) {
      return null;
    }
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    const date = toTripDate(value);
    return isValid(date) ? date.toISOString() : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} tripId
 * @param {object} data
 * @returns {object}
 */
function normalizeTrip(tripId, data) {
  return {
    tripId,
    ...data,
    createdAt: toIsoOrNull(data?.createdAt) ?? data?.createdAt ?? null,
    completedAt: toIsoOrNull(data?.completedAt),
  };
}

/**
 * @param {object} trip
 * @returns {object}
 */
export function toFirestoreTrip(trip) {
  const {
    routeCoordinates: _routeCoordinates,
    ...rest
  } = trip;
  return {
    ...rest,
    tip: rest.tip ?? 0,
    rating: rest.rating ?? null,
    paymentId: rest.paymentId ?? null,
    routePolyline: rest.routePolyline ?? null,
    completedAt: rest.completedAt ?? null,
  };
}

/**
 * Creates (or overwrites) a trip document. Used when the passenger request arrives.
 * @param {object} trip
 * @returns {Promise<object>}
 */
export async function createTrip(trip) {
  try {
    if (!trip?.tripId) {
      throw new Error('trip.tripId is required');
    }
    const payload = toFirestoreTrip(trip);
    await setDoc(doc(db, 'trips', trip.tripId), payload);
    return payload;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Patches a trip document (status transitions and payment fields).
 * @param {string} tripId
 * @param {object} patch
 * @returns {Promise<void>}
 */
export async function updateTrip(tripId, patch) {
  try {
    if (!tripId) {
      throw new Error('tripId is required');
    }
    const {
      routeCoordinates: _routeCoordinates,
      ...rest
    } = patch;
    await updateDoc(doc(db, 'trips', tripId), rest);
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Loads trips for a driver (client filters paid / history).
 * @param {string} driverId
 * @returns {Promise<object[]>}
 */
export async function fetchTripsByDriver(driverId) {
  try {
    if (!driverId) {
      return [];
    }
    const tripsQuery = query(
      collection(db, 'trips'),
      where('driverId', '==', driverId)
    );
    const snapshot = await getDocs(tripsQuery);
    return snapshot.docs.map((item) => normalizeTrip(item.id, item.data()));
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Loads a single trip by id.
 * @param {string} tripId
 * @returns {Promise<object|null>}
 */
export async function fetchTripById(tripId) {
  try {
    if (!tripId) {
      return null;
    }
    const snap = await getDoc(doc(db, 'trips', tripId));
    if (!snap.exists()) {
      return null;
    }
    return normalizeTrip(snap.id, snap.data());
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
