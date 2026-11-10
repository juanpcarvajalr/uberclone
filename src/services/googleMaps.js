// AI-assisted: see docs/AI_LOG.md #46, #50
import { MAPS } from '../config/maps';
import {
  fetchDirections as fetchDirectionsApi,
  fetchDistanceMatrix as fetchDistanceMatrixApi,
} from './googleMapsApi';
import { toLatLng } from '../utils/geo';

/**
 * @returns {string}
 */
function resolveApiKey() {
  const apiKey = MAPS.apiKey;
  if (!apiKey) {
    throw new Error('Google Maps API key is missing (KEY / expo extra.googleMapsApiKey)');
  }
  return apiKey;
}

/**
 * Ensures the animated path starts at the given GPS / place point.
 * @param {{ latitude: number, longitude: number }[]} coordinates
 * @param {{ lat: number, lng: number }} start
 * @returns {{ latitude: number, longitude: number }[]}
 */
function withExplicitStart(coordinates, start) {
  const startCoord = {
    latitude: start.lat,
    longitude: start.lng,
  };
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return [startCoord];
  }
  const first = coordinates[0];
  if (
    Math.abs(first.latitude - startCoord.latitude) < 0.00001 &&
    Math.abs(first.longitude - startCoord.longitude) < 0.00001
  ) {
    return coordinates;
  }
  return [startCoord, ...coordinates];
}

/**
 * @param {{
 *   origin: { lat: number, lng: number },
 *   destination: { lat: number, lng: number },
 * }} params
 * @returns {Promise<{ distanceKm: number, durationMin: number }>}
 */
export function fetchDistanceMatrix(params) {
  return fetchDistanceMatrixApi({ ...params, apiKey: resolveApiKey() });
}

/**
 * @param {{
 *   origin: { lat: number, lng: number },
 *   destination: { lat: number, lng: number },
 * }} params
 * @returns {Promise<{
 *   routePolyline: string,
 *   coordinates: { latitude: number, longitude: number }[],
 * }>}
 */
export function fetchDirections(params) {
  return fetchDirectionsApi({ ...params, apiKey: resolveApiKey() });
}

/**
 * Directions from the driver's current GPS to the passenger pickup.
 * @param {{
 *   driverLocation: { lat?: number, lng?: number, latitude?: number, longitude?: number },
 *   pickup: { lat: number, lng: number },
 * }} params
 * @returns {Promise<{
 *   routePolyline: string,
 *   coordinates: { latitude: number, longitude: number }[],
 *   origin: { lat: number, lng: number },
 * }>}
 */
export async function fetchDirectionsToPickup({ driverLocation, pickup }) {
  try {
    const origin = toLatLng(driverLocation);
    const destination = toLatLng(pickup);
    if (!origin) {
      throw new Error(
        'Ubicación del conductor no válida. Espera el GPS o fíjala en el emulador cerca del origen del viaje.'
      );
    }
    if (!destination) {
      throw new Error('Coordenadas del punto de recogida no válidas');
    }

    const route = await fetchDirections({ origin, destination });
    return {
      ...route,
      coordinates: withExplicitStart(route.coordinates, origin),
      origin,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Directions from passenger pickup to trip destination.
 * @param {{
 *   pickup: { lat: number, lng: number },
 *   dropoff: { lat: number, lng: number },
 * }} params
 * @returns {Promise<{
 *   routePolyline: string,
 *   coordinates: { latitude: number, longitude: number }[],
 * }>}
 */
export async function fetchDirectionsToDestination({ pickup, dropoff }) {
  try {
    const origin = toLatLng(pickup);
    const destination = toLatLng(dropoff);
    if (!origin || !destination) {
      throw new Error('Coordenadas de origen/destino del viaje no válidas');
    }

    const route = await fetchDirections({ origin, destination });
    return {
      ...route,
      coordinates: withExplicitStart(route.coordinates, origin),
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
