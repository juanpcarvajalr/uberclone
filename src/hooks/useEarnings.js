// AI-assisted: see docs/AI_LOG.md #14
import { useMemo } from 'react';
import {
  isSameDay,
  isSameMonth,
  isSameWeek,
  parseISO,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from 'date-fns';
import { MOCK_TRIPS } from '../mocks/trips';

/**
 * @param {object} trip
 * @returns {boolean}
 */
function isPaidTrip(trip) {
  return trip.status === 'paid' || trip.status === 'completed';
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
 * Earnings hook over mock trip history with today/week/month periods.
 * @param {{ from?: Date, to?: Date, paymentMethod?: string|null }} [filters]
 */
export function useEarnings(filters = {}) {
  const { from, to, paymentMethod = null } = filters;

  const filteredTrips = useMemo(() => {
    let list = MOCK_TRIPS.filter(isPaidTrip);
    if (paymentMethod) {
      list = list.filter((t) => t.paymentMethod === paymentMethod);
    }
    if (from && to) {
      const interval = { start: startOfDay(from), end: endOfDay(to) };
      list = list.filter((t) =>
        isWithinInterval(parseISO(t.completedAt ?? t.createdAt), interval)
      );
    }
    return list;
  }, [from, to, paymentMethod]);

  const today = useMemo(() => {
    const now = new Date();
    return summarize(
      filteredTrips.filter((t) => isSameDay(parseISO(t.completedAt ?? t.createdAt), now))
    );
  }, [filteredTrips]);

  const week = useMemo(() => {
    const now = new Date();
    return summarize(
      filteredTrips.filter((t) =>
        isSameWeek(parseISO(t.completedAt ?? t.createdAt), now, { weekStartsOn: 1 })
      )
    );
  }, [filteredTrips]);

  const month = useMemo(() => {
    const now = new Date();
    return summarize(
      filteredTrips.filter((t) =>
        isSameMonth(parseISO(t.completedAt ?? t.createdAt), now)
      )
    );
  }, [filteredTrips]);

  const balance = useMemo(() => calculateDriverBalance(MOCK_TRIPS), []);

  return { today, week, month, balance, trips: filteredTrips };
}
