// AI-assisted: see docs/AI_LOG.md #11
import { useCallback, useEffect, useState } from 'react';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';

/**
 * Mock incoming-request listener: when available and idle, can simulate a request.
 */
export function useTripRequests() {
  const { isAvailable } = useDriverSession();
  const { trip, phase, simulateIncomingRequest } = useActiveTrip();
  const [lastSimulatedAt, setLastSimulatedAt] = useState(null);

  useEffect(() => {
    if (!isAvailable || phase !== 'idle') return undefined;
    return undefined;
  }, [isAvailable, phase]);

  const triggerMockRequest = useCallback(() => {
    if (!isAvailable || trip) return false;
    simulateIncomingRequest();
    setLastSimulatedAt(new Date().toISOString());
    return true;
  }, [isAvailable, trip, simulateIncomingRequest]);

  return {
    hasActiveRequest: phase === 'incoming',
    triggerMockRequest,
    lastSimulatedAt,
  };
}
