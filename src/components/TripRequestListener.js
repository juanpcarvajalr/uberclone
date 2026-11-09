// AI-assisted: see docs/AI_LOG.md #44
import { useTripRequests } from '../hooks/useTripRequests';

/**
 * Keeps the incoming-request Firestore listener mounted app-wide.
 * @returns {null}
 */
export default function TripRequestListener() {
  useTripRequests();
  return null;
}
