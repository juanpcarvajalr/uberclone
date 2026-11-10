// AI-assisted: see docs/AI_LOG.md #50
import {
  format,
  isValid,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';

const APP_TIME_ZONE = 'America/Bogota';

/**
 * Normalizes trip date fields from ISO strings, Date, or Firestore Timestamp.
 * @param {unknown} value
 * @returns {Date}
 */
export function toTripDate(value) {
  try {
    if (value == null) {
      return new Date(NaN);
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return new Date(value);
    }
    if (typeof value?.toDate === 'function') {
      return value.toDate();
    }
    if (
      typeof value === 'object' &&
      value.seconds != null &&
      Number.isFinite(Number(value.seconds))
    ) {
      return new Date(Number(value.seconds) * 1000);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return new Date(NaN);
      }
      const parsed = parseISO(trimmed);
      if (isValid(parsed)) {
        return parsed;
      }
      return new Date(trimmed);
    }
    return new Date(NaN);
  } catch {
    return new Date(NaN);
  }
}

/**
 * @param {object|null|undefined} trip
 * @returns {Date}
 */
export function tripEventDate(trip) {
  return toTripDate(trip?.completedAt ?? trip?.createdAt);
}

/**
 * Calendar parts in the app timezone (Colombia), independent of device TZ.
 * @param {Date} date
 * @param {string} [timeZone]
 * @returns {{ year: number, month: number, day: number }}
 */
export function toZonedDateParts(date, timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

/**
 * Builds a Date at local noon for zoned Y-M-D (stable for week/month compares).
 * @param {{ year: number, month: number, day: number }} parts
 * @returns {Date}
 */
function dateFromParts(parts) {
  return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
}

/**
 * @param {Date} left
 * @param {Date} right
 * @returns {boolean}
 */
export function isSameAppDay(left, right) {
  if (!isValid(left) || !isValid(right)) {
    return false;
  }
  const a = toZonedDateParts(left);
  const b = toZonedDateParts(right);
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/**
 * @param {Date} date
 * @param {Date} now
 * @returns {boolean}
 */
export function isSameAppWeek(date, now) {
  if (!isValid(date) || !isValid(now)) {
    return false;
  }
  const zonedNow = dateFromParts(toZonedDateParts(now));
  const zonedDate = dateFromParts(toZonedDateParts(date));
  const start = startOfWeek(zonedNow, { weekStartsOn: 1 });
  const end = endOfWeek(zonedNow, { weekStartsOn: 1 });
  return isWithinInterval(zonedDate, { start, end });
}

/**
 * @param {Date} date
 * @param {Date} now
 * @returns {boolean}
 */
export function isSameAppMonth(date, now) {
  if (!isValid(date) || !isValid(now)) {
    return false;
  }
  const a = toZonedDateParts(date);
  const b = toZonedDateParts(now);
  return a.year === b.year && a.month === b.month;
}

/**
 * @param {object|null|undefined} trip
 * @param {string} [pattern]
 * @returns {string}
 */
export function formatTripDate(trip, pattern = 'dd/MM/yyyy HH:mm') {
  try {
    const date = tripEventDate(trip);
    if (!isValid(date)) {
      return '—';
    }
    return format(date, pattern);
  } catch {
    return '—';
  }
}
