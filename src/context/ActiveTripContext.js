// AI-assisted: see docs/AI_LOG.md #4, #44, #46, #50
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { canTransition } from '../utils/canTransition';
import { calculateFare } from '../utils/calculateFare';
import {
  fetchDirectionsToDestination,
  fetchDirectionsToPickup,
  fetchDistanceMatrix,
} from '../services/googleMaps';
import { toLatLng } from '../utils/geo';
import { createTrip, updateTrip } from '../services/tripsService';
import { resolveRouteCoordinates } from '../utils/routeCoordinates';
import { useDriverSession } from './DriverSessionContext';

const ActiveTripContext = createContext(null);

const initialState = {
  trip: null,
  phase: 'idle',
};

/**
 * @param {string|undefined} status
 * @returns {'idle'|'incoming'|'active'|'summary'}
 */
function phaseFromStatus(status) {
  if (!status) return 'idle';
  if (status === 'requested') return 'incoming';
  if (status === 'completed' || status === 'paid') return 'summary';
  if (status === 'rejected' || status === 'cancelled') return 'idle';
  return 'active';
}

/**
 * @param {typeof initialState} state
 * @param {{ type: string, payload?: any }} action
 */
function tripReducer(state, action) {
  switch (action.type) {
    case 'SET_INCOMING':
      return { trip: action.payload, phase: 'incoming' };
    case 'CLEAR':
      return initialState;
    case 'SET_FROM_SNAPSHOT': {
      const routeCoordinates = resolveRouteCoordinates(
        action.payload,
        state.trip?.routeCoordinates
      );
      const nextTrip = {
        ...action.payload,
        routeCoordinates,
      };
      const phase = phaseFromStatus(nextTrip.status);
      if (phase === 'idle') {
        return initialState;
      }
      return { trip: nextTrip, phase };
    }
    case 'TRANSITION': {
      const { to, patch = {} } = action.payload;
      if (!state.trip || !canTransition(state.trip.status, to)) {
        return state;
      }
      return {
        ...state,
        trip: { ...state.trip, ...patch, status: to },
        phase: phaseFromStatus(to),
      };
    }
    case 'ACCEPT_AND_ARRIVE': {
      if (!state.trip || !canTransition(state.trip.status, 'accepted')) {
        return state;
      }
      if (!canTransition('accepted', 'driver_arriving')) {
        return state;
      }
      return {
        ...state,
        trip: {
          ...state.trip,
          ...action.payload,
          status: 'driver_arriving',
        },
        phase: 'active',
      };
    }
    case 'PATCH':
      if (!state.trip) return state;
      return { ...state, trip: { ...state.trip, ...action.payload } };
    default:
      return state;
  }
}

/**
 * Active trip: Firestore source of truth + Matrix/Directions per Spec.
 * @param {{ children: React.ReactNode }} props
 */
export function ActiveTripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const { location, driver, vehicle } = useDriverSession();
  const tripIdRef = useRef(null);

  useEffect(() => {
    const tripId = state.trip?.tripId;
    tripIdRef.current = tripId ?? null;
    if (!tripId) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'trips', tripId),
      (snap) => {
        if (!snap.exists()) {
          return;
        }
        dispatch({
          type: 'SET_FROM_SNAPSHOT',
          payload: { tripId: snap.id, ...snap.data() },
        });
      },
      (error) => {
        console.warn('trips onSnapshot failed:', error?.message ?? String(error));
      }
    );

    return () => unsubscribe();
  }, [state.trip?.tripId]);

  const receiveIncomingRequest = useCallback(async (tripRequest) => {
    try {
      if (!tripRequest || typeof tripRequest !== 'object') {
        throw new Error('tripRequest is required');
      }
      if (tripRequest.paymentMethod !== 'cash') {
        throw new Error('Por ahora solo está habilitado el cobro en efectivo.');
      }

      const payload = {
        ...tripRequest,
        status: 'requested',
        createdAt: tripRequest.createdAt ?? new Date().toISOString(),
        completedAt: null,
        paymentStatus: 'pending',
        paymentId: null,
        routePolyline: null,
      };

      await createTrip(payload);
      dispatch({
        type: 'SET_INCOMING',
        payload: {
          ...payload,
          routeCoordinates: null,
        },
      });
      return { ok: true };
    } catch (error) {
      console.warn(
        'receiveIncomingRequest failed:',
        error instanceof Error ? error.message : String(error)
      );
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }, []);

  const acceptTrip = useCallback(async () => {
    try {
      const trip = state.trip;
      if (!trip) {
        return { ok: false, reason: 'no_trip' };
      }

      const driverId = driver?.uid ?? null;
      const vehicleId = vehicle?.vehicleId ?? driver?.vehicleId ?? null;
      if (!driverId) {
        return { ok: false, reason: 'driver_not_authenticated' };
      }

      const matrix = await fetchDistanceMatrix({
        origin: trip.origin,
        destination: trip.destination,
      });
      const breakdown = calculateFare({
        distanceKm: matrix.distanceKm,
        durationMin: matrix.durationMin,
        category: trip.category,
        tip: trip.tip ?? 0,
      });

      const pickup = toLatLng(trip.origin);
      if (!pickup) {
        throw new Error('Trip origin coordinates are invalid');
      }
      const driverGps = toLatLng(location);
      if (!driverGps) {
        throw new Error(
          'Sin ubicación del conductor. Espera a ver coordenadas reales en Inicio antes de aceptar.'
        );
      }

      const toPickup = await fetchDirectionsToPickup({
        driverLocation: driverGps,
        pickup,
      });

      await updateTrip(trip.tripId, {
        status: 'accepted',
        driverId,
        vehicleId,
      });

      const arrivingPatch = {
        driverId,
        vehicleId,
        distanceKm: matrix.distanceKm,
        durationMin: matrix.durationMin,
        ...breakdown,
        routePolyline: toPickup.routePolyline,
      };

      await updateTrip(trip.tripId, {
        status: 'driver_arriving',
        ...arrivingPatch,
      });

      dispatch({
        type: 'ACCEPT_AND_ARRIVE',
        payload: {
          ...arrivingPatch,
          routeCoordinates: toPickup.coordinates,
        },
      });

      return { ok: true };
    } catch (error) {
      console.warn(
        'acceptTrip failed:',
        error instanceof Error ? error.message : String(error)
      );
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }, [state.trip, location, driver, vehicle]);

  const rejectTrip = useCallback(async () => {
    try {
      const trip = state.trip;
      if (trip?.tripId && canTransition(trip.status, 'rejected')) {
        await updateTrip(trip.tripId, { status: 'rejected' });
      }
      dispatch({ type: 'CLEAR' });
      return { ok: true };
    } catch (error) {
      dispatch({ type: 'CLEAR' });
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }, [state.trip]);

  const markPassengerOnBoard = useCallback(async () => {
    try {
      const trip = state.trip;
      if (!trip) {
        return { ok: false, reason: 'no_trip' };
      }

      const toDestination = await fetchDirectionsToDestination({
        pickup: trip.origin,
        dropoff: trip.destination,
      });

      await updateTrip(trip.tripId, {
        status: 'in_progress',
        routePolyline: toDestination.routePolyline,
      });

      dispatch({
        type: 'TRANSITION',
        payload: {
          to: 'in_progress',
          patch: {
            routeCoordinates: toDestination.coordinates,
            routePolyline: toDestination.routePolyline,
          },
        },
      });

      return { ok: true };
    } catch (error) {
      console.warn(
        'markPassengerOnBoard failed:',
        error instanceof Error ? error.message : String(error)
      );
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }, [state.trip]);

  const completeTrip = useCallback(async () => {
    try {
      const trip = state.trip;
      if (!trip) {
        return { ok: false, reason: 'no_trip' };
      }
      const breakdown = calculateFare({
        distanceKm: trip.distanceKm,
        durationMin: trip.durationMin,
        category: trip.category,
        tip: trip.tip ?? 0,
      });
      const completedAt = new Date().toISOString();
      await updateTrip(trip.tripId, {
        status: 'completed',
        ...breakdown,
        completedAt,
      });
      dispatch({
        type: 'TRANSITION',
        payload: {
          to: 'completed',
          patch: {
            ...breakdown,
            completedAt,
          },
        },
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }, [state.trip]);

  const markPaid = useCallback(async () => {
    try {
      const trip = state.trip;
      if (!trip) {
        return { ok: false, reason: 'no_trip' };
      }
      if (trip.paymentMethod !== 'cash') {
        return { ok: false, reason: 'only_cash_supported' };
      }

      await updateTrip(trip.tripId, {
        status: 'paid',
        paymentMethod: 'cash',
        paymentStatus: 'cash_received',
        paymentId: null,
      });

      dispatch({
        type: 'TRANSITION',
        payload: {
          to: 'paid',
          patch: {
            paymentMethod: 'cash',
            paymentStatus: 'cash_received',
            paymentId: null,
          },
        },
      });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }, [state.trip]);

  const clearTrip = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = useMemo(
    () => ({
      trip: state.trip,
      phase: state.phase,
      receiveIncomingRequest,
      acceptTrip,
      rejectTrip,
      markPassengerOnBoard,
      completeTrip,
      markPaid,
      clearTrip,
    }),
    [
      state.trip,
      state.phase,
      receiveIncomingRequest,
      acceptTrip,
      rejectTrip,
      markPassengerOnBoard,
      completeTrip,
      markPaid,
      clearTrip,
    ]
  );

  return (
    <ActiveTripContext.Provider value={value}>{children}</ActiveTripContext.Provider>
  );
}

/**
 * @returns {object}
 */
export function useActiveTrip() {
  const ctx = useContext(ActiveTripContext);
  if (!ctx) {
    throw new Error('useActiveTrip must be used within ActiveTripProvider');
  }
  return ctx;
}
