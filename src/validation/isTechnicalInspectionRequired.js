// AI-assisted: see docs/AI_LOG.md #5
import { addYears, startOfDay } from 'date-fns';
import { TECHNICAL_INSPECTION_YEARS } from '../config/pricing';

/**
 * Compares calendar dates only (year-month-day), ignoring time of day.
 * @param {Date|string|number} registrationDate
 * @param {Date} [today]
 * @returns {boolean}
 */
export function isTechnicalInspectionRequired(registrationDate, today = new Date()) {
  const regDay = startOfDay(new Date(registrationDate));
  const todayDay = startOfDay(today);
  const requiredFrom = addYears(regDay, TECHNICAL_INSPECTION_YEARS);
  return todayDay >= requiredFrom;
}

/**
 * Date from which technical inspection becomes required.
 * @param {Date|string|number} registrationDate
 * @returns {Date}
 */
export function getTechnicalInspectionRequiredFrom(registrationDate) {
  return addYears(startOfDay(new Date(registrationDate)), TECHNICAL_INSPECTION_YEARS);
}
