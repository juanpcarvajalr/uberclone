// AI-assisted: see docs/AI_LOG.md #46
import { MAPS } from '../config/maps';
import {
  fetchDirections as fetchDirectionsApi,
  fetchDistanceMatrix as fetchDistanceMatrixApi,
} from './googleMapsApi';

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
