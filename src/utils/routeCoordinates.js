// AI-assisted: see docs/AI_LOG.md #46, #50
import { decodePolyline } from './decodePolyline';

/**
 * @param {{ latitude: number, longitude: number }} a
 * @param {{ latitude: number, longitude: number }} b
 * @returns {number}
 */
function haversineMeters(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Resolves road coordinates from explicit points or an encoded polyline.
 * Never invents a straight line between origin and destination.
 * @param {{
 *   routeCoordinates?: { latitude: number, longitude: number }[] | null,
 *   routePolyline?: string | null,
 * }|null|undefined} trip
 * @param {{ latitude: number, longitude: number }[]|null|undefined} [previous]
 * @returns {{ latitude: number, longitude: number }[]|null}
 */
export function resolveRouteCoordinates(trip, previous = null) {
  try {
    if (Array.isArray(trip?.routeCoordinates) && trip.routeCoordinates.length > 1) {
      return trip.routeCoordinates;
    }
    if (trip?.routePolyline) {
      const decoded = decodePolyline(trip.routePolyline);
      if (decoded.length > 1) {
        return decoded;
      }
    }
    if (Array.isArray(previous) && previous.length > 1) {
      return previous;
    }
    return null;
  } catch {
    return Array.isArray(previous) && previous.length > 1 ? previous : null;
  }
}

/**
 * Densifies a polyline so the vehicle marker can animate smoothly.
 * @param {{ latitude: number, longitude: number }[]} coordinates
 * @param {number} [stepMeters]
 * @returns {{ latitude: number, longitude: number }[]}
 */
export function densifyRoute(coordinates, stepMeters = 12) {
  try {
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return [];
    }

    const densified = [coordinates[0]];
    for (let i = 1; i < coordinates.length; i += 1) {
      const from = coordinates[i - 1];
      const to = coordinates[i];
      const distance = haversineMeters(from, to);
      const steps = Math.max(1, Math.ceil(distance / stepMeters));
      for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        densified.push({
          latitude: from.latitude + (to.latitude - from.latitude) * t,
          longitude: from.longitude + (to.longitude - from.longitude) * t,
        });
      }
    }
    return densified;
  } catch {
    return Array.isArray(coordinates) ? coordinates : [];
  }
}

/**
 * Heading in degrees between two coordinates.
 * @param {{ latitude: number, longitude: number }} from
 * @param {{ latitude: number, longitude: number }} to
 * @returns {number}
 */
export function bearingDegrees(from, to) {
  try {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const dLng = toRad(to.longitude - from.longitude);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  } catch {
    return 0;
  }
}
