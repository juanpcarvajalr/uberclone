// AI-assisted: see docs/AI_LOG.md #10
import { useEffect, useRef } from 'react';
import { useDriverSession } from '../context/DriverSessionContext';

const TICK_MS = 5000;
const JITTER = 0.00015;

/**
 * Simulates watchPosition while the driver is available (mock GPS).
 * Cleans up the interval on unavailability or unmount.
 */
export function useDriverLocation() {
  const { isAvailable, location, updateLocation } = useDriverSession();
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if (!isAvailable) return undefined;

    const id = setInterval(() => {
      const current = locationRef.current;
      updateLocation({
        lat: Number((current.lat + (Math.random() - 0.5) * JITTER).toFixed(6)),
        lng: Number((current.lng + (Math.random() - 0.5) * JITTER).toFixed(6)),
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [isAvailable, updateLocation]);

  return { location, isTracking: isAvailable };
}
