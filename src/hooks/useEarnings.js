// AI-assisted: see docs/AI_LOG.md #14, #50
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isValid,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from 'date-fns';
import { useDriverSession } from '../context/DriverSessionContext';
import { auth } from '../config/firebaseConfig';
import { fetchTripsByDriver } from '../services/tripsService';
import {
  isSameAppDay,
  isSameAppMonth,
  isSameAppWeek,
  tripEventDate,
} from '../utils/tripDates';

/**
 * @param {object} trip
 * @returns {boolean}
 */
function isPaidTrip(trip) {
  return trip.status === 'paid';
}

/**
 * Aggregates earnings for a trip list.
 * @param {object[]} trips
 */
function summarize(trips) {
  const count = trips.length;
  const billed = trips.reduce((sum, t) => sum + (t.fare ?? 0), 0);
  const commissions = trips.reduce((sum, t) => sum + (t.commission ?? 0), 0);
  const tips = trips.reduce((sum, t) => sum + (t.tip ?? 0), 0);
  const net = trips.reduce((sum, t) => sum + (t.driverEarnings ?? 0), 0);
  return {
    tripCount: count,
    totalBilled: billed,
    totalCommissions: commissions,
    totalTips: tips,
    netEarnings: net,
    averagePerTrip: count ? Math.round(net / count) : 0,
  };
}

/**
 * Balance = gateway paid earnings − commissions of cash trips.
 * @param {object[]} trips
 * @returns {number}
 */
export function calculateDriverBalance(trips) {
  return trips.filter(isPaidTrip).reduce((balance, trip) => {
    if (trip.paymentMethod === 'cash') {
      return balance - (trip.commission ?? 0);
    }
    return balance + (trip.driverEarnings ?? 0);
  }, 0);
}

/**
 * Earnings hook over Firestore paid trips.
 * @param {{ from?: Date, to?: Date, paymentMethod?: string|null }} [filters]
 */
export function useEarnings(filters = {}) {
  const { from, to, paymentMethod = null } = filters;
  const { driver } = useDriverSession();
  const driverId = driver?.uid || auth.currentUser?.uid || null;
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = driverId ? await fetchTripsByDriver(driverId) : [];
        if (!cancelled) {
          setTrips(list);
        }
      } catch {
        if (!cancelled) {
          setTrips([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [driverId, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const filteredTrips = useMemo(() => {
    let list = trips.filter(isPaidTrip);
    if (paymentMethod) {
      list = list.filter((t) => t.paymentMethod === paymentMethod);
    }
    if (from && to) {
      const interval = { start: startOfDay(from), end: endOfDay(to) };
      list = list.filter((t) => {
        const date = tripEventDate(t);
        return isValid(date) && isWithinInterval(date, interval);
      });
    }
    return list;
  }, [trips, from, to, paymentMethod]);

  const today = useMemo(() => {
    const now = new Date();
    return summarize(
      filteredTrips.filter((t) => {
        const date = tripEventDate(t);
        return isValid(date) && isSameAppDay(date, now);
      })
    );
  }, [filteredTrips]);

  const week = useMemo(() => {
    const now = new Date();
    return summarize(
      filteredTrips.filter((t) => {
        const date = tripEventDate(t);
        return isValid(date) && isSameAppWeek(date, now);
      })
    );
  }, [filteredTrips]);

  const month = useMemo(() => {
    const now = new Date();
    return summarize(
      filteredTrips.filter((t) => {
        const date = tripEventDate(t);
        return isValid(date) && isSameAppMonth(date, now);
      })
    );
  }, [filteredTrips]);

  const balance = useMemo(() => calculateDriverBalance(trips), [trips]);

  return { today, week, month, balance, trips: filteredTrips, loading, refresh };
}
