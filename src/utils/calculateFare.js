// AI-assisted: see docs/AI_LOG.md #2
import { PRICING } from '../config/pricing';

/**
 * Rounds a COP amount to the nearest multiple of 100.
 * @param {number} amount - Amount in COP.
 * @returns {number} Rounded amount.
 */
export function roundTo100(amount) {
  return Math.round(amount / 100) * 100;
}

/**
 * Pure fare calculator shared by passenger and driver flows.
 * @param {{ distanceKm: number, durationMin: number, category: string, tip?: number }} params
 * @returns {{ fare: number, commission: number, driverEarnings: number }}
 */
export function calculateFare({ distanceKm, durationMin, category, tip = 0 }) {
  const multiplier = PRICING.categoryMultipliers[category] ?? 1;
  const fareRaw =
    (PRICING.baseFare + distanceKm * PRICING.perKm + durationMin * PRICING.perMin) *
    multiplier;
  const fare = roundTo100(Math.max(PRICING.minimumFare, fareRaw));
  const commission = Math.round(fare * PRICING.commissionRate);
  const driverEarnings = fare - commission + tip;
  return { fare, commission, driverEarnings };
}
