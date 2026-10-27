// AI-assisted: see docs/AI_LOG.md #4
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { canTransition } from '../utils/canTransition';
import { calculateFare } from '../utils/calculateFare';
import { MOCK_INCOMING_REQUEST } from '../mocks/trips';

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
 * Active trip state with validated status transitions (mock data).
 * @param {{ children: React.ReactNode }} props
 */
export function ActiveTripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  const simulateIncomingRequest = useCallback(() => {
    dispatch({
      type: 'SET_INCOMING',
      payload: {
        ...MOCK_INCOMING_REQUEST,
        createdAt: new Date().toISOString(),
      },
    });
  }, []);

  const acceptTrip = useCallback(() => {
    dispatch({
      type: 'ACCEPT_AND_ARRIVE',
      payload: {
        driverId: 'driver_mock_001',
        vehicleId: 'vehicle_mock_001',
      },
    });
  }, []);

  const rejectTrip = useCallback(() => {
    dispatch({
      type: 'TRANSITION',
      payload: { to: 'rejected' },
    });
    dispatch({ type: 'CLEAR' });
  }, []);

  const markPassengerOnBoard = useCallback(() => {
    dispatch({ type: 'TRANSITION', payload: { to: 'in_progress' } });
  }, []);

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
      simulateIncomingRequest,
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
      simulateIncomingRequest,
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
