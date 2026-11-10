// AI-assisted: see docs/AI_LOG.md #46
import { decodePolyline } from '../utils/decodePolyline';

/**
 * @param {{ lat: number, lng: number }} point
 * @returns {string}
 */
function toLatLngParam(point) {
  return `${point.lat},${point.lng}`;
}

/**
 * @param {string|undefined} apiKey
 * @returns {string}
 */
function requireApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('Google Maps API key is required');
  }
  return apiKey.trim();
}

/**
 * Resolves a postal address to { lat, lng, address } for the trips model (11).
 * @param {{ address: string, apiKey: string }} params
 * @returns {Promise<{ lat: number, lng: number, address: string }>}
 */
export async function geocodeAddress({ address, apiKey }) {
  try {
    const key = requireApiKey(apiKey);
    const query = typeof address === 'string' ? address.trim() : '';
    if (!query) {
      throw new Error('address is required for geocoding');
    }

    const url =
      'https://maps.googleapis.com/maps/api/geocode/json' +
      `?address=${encodeURIComponent(query)}` +
      '&region=co' +
      '&language=es' +
      `&key=${encodeURIComponent(key)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK' || !data.results?.[0]) {
      const detail = data.error_message ? ` — ${data.error_message}` : '';
      if (data.status === 'ZERO_RESULTS') {
        throw new Error(
          `Geocoding ZERO_RESULTS for "${query}". ` +
            'Usa una dirección más específica (ej. incluye ciudad: "Robledo, Medellín").'
        );
      }
      if (data.status === 'REQUEST_DENIED') {
        throw new Error(
          `Geocoding REQUEST_DENIED${detail}. ` +
            'Enable Geocoding API and allow this KEY for server/CLI use ' +
            '(Android-only key restrictions cause REQUEST_DENIED).'
        );
      }
      throw new Error(`Geocoding status: ${data.status}${detail}`);
    }

    const result = data.results[0];
    const location = result.geometry?.location;
    if (!location) {
      throw new Error('Geocoding response missing geometry.location');
    }

    return {
      lat: Number(location.lat),
      lng: Number(location.lng),
      address: result.formatted_address || query,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Distance Matrix: origin → destination (Spec 12).
 * @param {{
 *   origin: { lat: number, lng: number },
 *   destination: { lat: number, lng: number },
 *   apiKey: string,
 * }} params
 * @returns {Promise<{ distanceKm: number, durationMin: number }>}
 */
export async function fetchDistanceMatrix({ origin, destination, apiKey }) {
  try {
    const key = requireApiKey(apiKey);
    const url =
      'https://maps.googleapis.com/maps/api/distancematrix/json' +
      `?origins=${encodeURIComponent(toLatLngParam(origin))}` +
      `&destinations=${encodeURIComponent(toLatLngParam(destination))}` +
      '&units=metric' +
      `&key=${encodeURIComponent(key)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Distance Matrix HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix status: ${data.status}`);
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      throw new Error(`Distance Matrix element: ${element?.status ?? 'missing'}`);
    }

    return {
      distanceKm: Number((element.distance.value / 1000).toFixed(2)),
      durationMin: Number((element.duration.value / 60).toFixed(1)),
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Builds a dense road path from Directions legs/steps when available.
 * @param {object} route
 * @returns {{ latitude: number, longitude: number }[]}
 */
function coordinatesFromRoute(route) {
  const fromSteps = [];
  const legs = Array.isArray(route?.legs) ? route.legs : [];
  for (const leg of legs) {
    const steps = Array.isArray(leg?.steps) ? leg.steps : [];
    for (const step of steps) {
      const encoded = step?.polyline?.points;
      if (!encoded) continue;
      const part = decodePolyline(encoded);
      for (const point of part) {
        const last = fromSteps[fromSteps.length - 1];
        if (
          last &&
          last.latitude === point.latitude &&
          last.longitude === point.longitude
        ) {
          continue;
        }
        fromSteps.push(point);
      }
    }
  }
  if (fromSteps.length > 1) {
    return fromSteps;
  }
  const overview = route?.overview_polyline?.points;
  return overview ? decodePolyline(overview) : [];
}

/**
 * Directions on accept and phase change (Spec 2 / 12).
 * @param {{
 *   origin: { lat: number, lng: number },
 *   destination: { lat: number, lng: number },
 *   apiKey: string,
 * }} params
 * @returns {Promise<{
 *   routePolyline: string,
 *   coordinates: { latitude: number, longitude: number }[],
 * }>}
 */
export async function fetchDirections({ origin, destination, apiKey }) {
  try {
    const key = requireApiKey(apiKey);
    if (
      !Number.isFinite(Number(origin?.lat)) ||
      !Number.isFinite(Number(origin?.lng)) ||
      !Number.isFinite(Number(destination?.lat)) ||
      !Number.isFinite(Number(destination?.lng))
    ) {
      throw new Error(
        `Directions invalid coordinates: origin=${JSON.stringify(origin)} destination=${JSON.stringify(destination)}`
      );
    }

    const url =
      'https://maps.googleapis.com/maps/api/directions/json' +
      `?origin=${encodeURIComponent(toLatLngParam(origin))}` +
      `&destination=${encodeURIComponent(toLatLngParam(destination))}` +
      '&mode=driving' +
      `&key=${encodeURIComponent(key)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Directions HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      const detail = data.error_message ? ` — ${data.error_message}` : '';
      throw new Error(
        `Directions status: ${data.status}${detail} (from ${toLatLngParam(origin)} to ${toLatLngParam(destination)})`
      );
    }

    const route = data.routes?.[0];
    const routePolyline = route?.overview_polyline?.points;
    if (!routePolyline) {
      throw new Error('Directions response missing overview_polyline');
    }

    const coordinates = coordinatesFromRoute(route);
    if (!coordinates || coordinates.length < 2) {
      throw new Error(
        `Directions polyline decoded to ${coordinates?.length ?? 0} points (from ${toLatLngParam(origin)} to ${toLatLngParam(destination)})`
      );
    }

    return {
      routePolyline,
      coordinates,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
