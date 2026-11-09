// AI-assisted: see docs/AI_LOG.md #44, #46
import { PRICING } from '../config/pricing';
import { calculateFare } from './calculateFare';

export const TRIP_REQUEST_CATEGORIES = ['economy', 'xl', 'premium'];
export const TRIP_REQUEST_PAYMENT_METHODS = ['mercadopago', 'stripe', 'cash'];

/**
 * @typedef {object} TripPlace
 * @property {number} lat
 * @property {number} lng
 * @property {string} address
 */

/**
 * @typedef {object} TripRequestInput
 * @property {string} [tripId]
 * @property {string|null} [driverId]
 * @property {string} [passengerId]
 * @property {string|null} [vehicleId]
 * @property {TripPlace} origin
 * @property {TripPlace} destination
 * @property {number} distanceKm
 * @property {number} durationMin
 * @property {'economy'|'xl'|'premium'} category
 * @property {number} [tip]
 * @property {'mercadopago'|'stripe'|'cash'} paymentMethod
 * @property {string} [passengerName]
 */

/**
 * @param {TripPlace|undefined} place
 * @param {string} label
 * @returns {TripPlace}
 */
function requirePlace(place, label) {
  if (!place || typeof place !== 'object') {
    throw new Error(`${label} is required ({ lat, lng, address })`);
  }
  const lat = Number(place.lat);
  const lng = Number(place.lng);
  const address = typeof place.address === 'string' ? place.address.trim() : '';
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`${label} lat/lng must be numbers`);
  }
  if (!address) {
    throw new Error(`${label} address is required`);
  }
  return { lat, lng, address };
}

/**
 * Builds a trip document in `requested` status.
 * Origin/destination and Matrix metrics must come from the passenger request.
 * @param {TripRequestInput} input
 * @returns {object}
 */
export function buildTripRequest(input = {}) {
  try {
    const category = input.category;
    const paymentMethod = input.paymentMethod;
    const distanceKm = Number(input.distanceKm);
    const durationMin = Number(input.durationMin);
    const tip = Number(input.tip ?? 0);
    const origin = requirePlace(input.origin, 'origin');
    const destination = requirePlace(input.destination, 'destination');

    if (!TRIP_REQUEST_CATEGORIES.includes(category)) {
      throw new Error(
        `Invalid category "${category}". Use: ${TRIP_REQUEST_CATEGORIES.join(', ')}`
      );
    }

    if (!TRIP_REQUEST_PAYMENT_METHODS.includes(paymentMethod)) {
      throw new Error(
        `Invalid paymentMethod "${paymentMethod}". Use: ${TRIP_REQUEST_PAYMENT_METHODS.join(', ')}`
      );
    }

    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
      throw new Error('distanceKm must be a non-negative number (Distance Matrix)');
    }

    if (!Number.isFinite(durationMin) || durationMin < 0) {
      throw new Error('durationMin must be a non-negative number (Distance Matrix)');
    }

    if (!Number.isFinite(tip) || tip < 0) {
      throw new Error('tip must be a non-negative number');
    }

    const breakdown = calculateFare({
      distanceKm,
      durationMin,
      category,
      tip,
    });

    return {
      tripId: input.tripId ?? `trip_req_${Date.now()}`,
      driverId: input.driverId ?? null,
      passengerId: input.passengerId ?? 'passenger_incoming',
      vehicleId: input.vehicleId ?? null,
      origin,
      destination,
      distanceKm,
      durationMin,
      category,
      ...breakdown,
      tip,
      commissionRate: PRICING.commissionRate,
      paymentMethod,
      paymentStatus: 'pending',
      paymentId: null,
      status: 'requested',
      rating: null,
      routePolyline: null,
      routeCoordinates: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      passengerName: input.passengerName ?? 'Pasajero',
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
