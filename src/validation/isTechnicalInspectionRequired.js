// AI-assisted: see docs/AI_LOG.md #5, #59
import { addYears } from 'date-fns';
import { TECHNICAL_INSPECTION_YEARS } from '../config/pricing';

/**
 * Normalizes a value to a calendar day at local noon (avoids TZ edge cases).
 * Date-only strings (`YYYY-MM-DD`) are treated as civil dates, not UTC midnight.
 * @param {Date|string|number} value
 * @returns {Date}
 */
function toCalendarDay(value) {
  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0
  );
}

/**
 * Compares calendar dates only (year-month-day), ignoring time of day.
 * @param {Date|string|number} registrationDate
 * @param {Date} [today]
 * @returns {boolean}
 */
export function isTechnicalInspectionRequired(registrationDate, today = new Date()) {
  const regDay = toCalendarDay(registrationDate);
  const todayDay = toCalendarDay(today);
  const requiredFrom = addYears(regDay, TECHNICAL_INSPECTION_YEARS);
  return todayDay >= requiredFrom;
}

/**
 * Date from which technical inspection becomes required.
 * @param {Date|string|number} registrationDate
 * @returns {Date}
 */
export function getTechnicalInspectionRequiredFrom(registrationDate) {
  return addYears(toCalendarDay(registrationDate), TECHNICAL_INSPECTION_YEARS);
}
