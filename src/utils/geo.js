// AI-assisted: see docs/AI_LOG.md #50

/**
 * @param {unknown} value
 * @returns {{ lat: number, lng: number }|null}
 */
export function toLatLng(value) {
  try {
    if (!value || typeof value !== 'object') {
      return null;
    }
    const lat = Number(value.lat ?? value.latitude);
    const lng = Number(value.lng ?? value.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }
    if (lat === 0 && lng === 0) {
      return null;
    }
    return { lat, lng };
  } catch {
    return null;
  }
}

/**
 * Approximate distance in meters between two { lat, lng } points.
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number}
 */
export function distanceMeters(a, b) {
  try {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const earth = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

