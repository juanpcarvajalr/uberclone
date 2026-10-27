// AI-assisted: see docs/AI_LOG.md #3
const ALLOWED = {
  requested: ['accepted', 'rejected', 'cancelled'],
  accepted: ['driver_arriving', 'cancelled'],
  driver_arriving: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: ['paid'],
  paid: [],
  cancelled: [],
  rejected: [],
};

/**
 * Validates whether a trip status transition is allowed.
 * @param {string} from - Current status.
 * @param {string} to - Target status.
 * @returns {boolean}
 */
export function canTransition(from, to) {
  return (ALLOWED[from] ?? []).includes(to);
}
