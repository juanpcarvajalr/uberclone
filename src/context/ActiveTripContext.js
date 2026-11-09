// AI-assisted: see docs/AI_LOG.md #4, #44, #46
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { canTransition } from '../utils/canTransition';
import { calculateFare } from '../utils/calculateFare';
import { fetchDirections, fetchDistanceMatrix } from '../services/googleMaps';
import { useDriverSession } from './DriverSessionContext';

const ActiveTripContext = createContext(null);

const initialState = {
  trip: null,
  phase: 'idle',
};

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
    case 'TRANSITION': {
      const { to, patch = {} } = action.payload;
      if (!state.trip || !canTransition(state.trip.status, to)) {
        return state;
      }
      return {
        ...state,
        trip: { ...state.trip, ...patch, status: to },
        phase: to === 'completed' || to === 'paid' ? 'summary' : 'active',
      };
    }
    case 'ACCEPT_AND_ARRIVE': {
      if (!state.trip || !canTransition(state.trip.status, 'accepted')) {
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
 * Active trip state with Matrix/Directions on accept and phase change.
 * @param {{ children: React.ReactNode }} props
 */
export function ActiveTripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const { location, driver, vehicle } = useDriverSession();

  const receiveIncomingRequest = useCallback((tripRequest) => {
    try {
      if (!tripRequest || typeof tripRequest !== 'object') {
        throw new Error('tripRequest is required');
      }
      dispatch({
        type: 'SET_INCOMING',
        payload: {
          ...tripRequest,
          status: 'requested',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.warn(
        'receiveIncomingRequest failed:',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, []);

  const acceptTrip = useCallback(async () => {
    try {
      const trip = state.trip;
      if (!trip) {
        return { ok: false, reason: 'no_trip' };
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

      const toPickup = await fetchDirections({
        origin: location,
        destination: trip.origin,
      });

      dispatch({
        type: 'ACCEPT_AND_ARRIVE',
        payload: {
          driverId: driver?.uid ?? null,
          vehicleId: vehicle?.vehicleId ?? driver?.vehicleId ?? null,
          distanceKm: matrix.distanceKm,
          durationMin: matrix.durationMin,
          ...breakdown,
          routeCoordinates: toPickup.coordinates,
          routePolyline: null,
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

  const rejectTrip = useCallback(() => {
    dispatch({
      type: 'TRANSITION',
      payload: { to: 'rejected' },
    });
    dispatch({ type: 'CLEAR' });
  }, []);

  const markPassengerOnBoard = useCallback(async () => {
    try {
      const trip = state.trip;
      if (!trip) {
        return { ok: false, reason: 'no_trip' };
      }

      const toDestination = await fetchDirections({
        origin: trip.origin,
        destination: trip.destination,
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

  const completeTrip = useCallback(() => {
    const trip = state.trip;
    if (!trip) return;
    const breakdown = calculateFare({
      distanceKm: trip.distanceKm,
      durationMin: trip.durationMin,
      category: trip.category,
      tip: trip.tip ?? 0,
    });
    dispatch({
      type: 'TRANSITION',
      payload: {
        to: 'completed',
        patch: {
          ...breakdown,
          completedAt: new Date().toISOString(),
        },
      },
    });
  }, [state.trip]);

  const markPaid = useCallback((paymentStatus = 'approved') => {
    dispatch({
      type: 'TRANSITION',
      payload: {
        to: 'paid',
        patch: { paymentStatus },
      },
    });
  }, []);

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
