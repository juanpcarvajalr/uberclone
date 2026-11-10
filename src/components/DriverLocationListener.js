// AI-assisted: see docs/AI_LOG.md #50
import { useDriverLocation } from '../hooks/useDriverLocation';

/**
 * Keeps GPS watch mounted app-wide so driverLocations and trip maps stay live.
 * @returns {null}
 */
export default function DriverLocationListener() {
  useDriverLocation();
  return null;
}
