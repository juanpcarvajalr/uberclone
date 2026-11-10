// AI-assisted: see docs/AI_LOG.md #11, #44, #45, #50
import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';
import { db } from '../config/firebaseConfig';
import {
  DEV_INCOMING_TRIP_COLLECTION,
  DEV_INCOMING_TRIP_DOC,
} from '../config/devTriggers';
import {
  TRIP_REQUEST_INBOX_HOSTS,
  TRIP_REQUEST_INBOX_PORT,
} from '../config/tripRequestInbox';
import { navigateToIncomingRequest } from '../navigation/navigationRef';

const INBOX_POLL_MS = 1500;

/**
 * @param {object|null|undefined} requestInput
 * @param {string|null|undefined} driverCategory
 * @returns {boolean}
 */
function matchesDriverCategory(requestInput, driverCategory) {
  if (!driverCategory) {
    return false;
  }
  const requestCategory = requestInput?.category;
  return Boolean(requestCategory) && requestCategory === driverCategory;
}

/**
 * Listens for passenger requests from the CLI inbox / Firestore trigger.
 */
export function useTripRequests() {
  const { isAvailable, vehicle } = useDriverSession();
  const { trip, phase, receiveIncomingRequest } = useActiveTrip();
  const [lastReceivedAt, setLastReceivedAt] = useState(null);
  const lastTriggerIdRef = useRef(null);
  const firestoreReadyRef = useRef(false);
  const driverCategory = vehicle?.category ?? null;

  const applyIncoming = useCallback(
    async (requestInput, triggerId) => {
      try {
        if (!isAvailable || trip) {
          return false;
        }
        if (!matchesDriverCategory(requestInput, driverCategory)) {
          return false;
        }
        if (triggerId && triggerId === lastTriggerIdRef.current) {
          return false;
        }
        if (triggerId) {
          lastTriggerIdRef.current = triggerId;
        }
        const result = await receiveIncomingRequest(requestInput);
        if (!result?.ok) {
          lastTriggerIdRef.current = null;
          return false;
        }
        setLastReceivedAt(new Date().toISOString());
        navigateToIncomingRequest();
        return true;
      } catch {
        return false;
      }
    },
    [isAvailable, trip, driverCategory, receiveIncomingRequest]
  );

  useEffect(() => {
    if (!isAvailable || phase !== 'idle' || !driverCategory) {
      return undefined;
    }

    const triggerRef = doc(
      db,
      DEV_INCOMING_TRIP_COLLECTION,
      DEV_INCOMING_TRIP_DOC
    );

    const unsubscribe = onSnapshot(
      triggerRef,
      (snap) => {
        try {
          if (!snap.exists()) {
            firestoreReadyRef.current = true;
            return;
          }

          const data = snap.data();
          const triggerId = data?.triggerId;
          if (!triggerId || !data?.trip) {
            firestoreReadyRef.current = true;
            return;
          }

          if (!firestoreReadyRef.current) {
            lastTriggerIdRef.current = triggerId;
            firestoreReadyRef.current = true;
            return;
          }

          if (!matchesDriverCategory(data.trip, driverCategory)) {
            return;
          }

          applyIncoming(data.trip, triggerId);
        } catch {
          // ignore malformed trigger payloads
        }
      },
      () => {
        firestoreReadyRef.current = true;
      }
    );

    return () => unsubscribe();
  }, [isAvailable, phase, driverCategory, applyIncoming]);

  useEffect(() => {
    if (!isAvailable || phase !== 'idle' || !driverCategory) {
      return undefined;
    }

    let cancelled = false;

    const pollInbox = async () => {
      for (const host of TRIP_REQUEST_INBOX_HOSTS) {
        if (cancelled) return;
        try {
          const response = await fetch(
            `http://${host}:${TRIP_REQUEST_INBOX_PORT}/?category=${encodeURIComponent(driverCategory)}`,
            { method: 'GET' }
          );
          if (response.status === 204) {
            return;
          }
          if (!response.ok) continue;
          const data = await response.json();
          if (!data?.trip || !data?.triggerId) continue;
          applyIncoming(data.trip, data.triggerId);
          return;
        } catch {
          // try next host
        }
      }
    };

    pollInbox();
    const id = setInterval(pollInbox, INBOX_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isAvailable, phase, driverCategory, applyIncoming]);

  return {
    hasActiveRequest: phase === 'incoming',
    lastReceivedAt,
    driverCategory,
  };
}
