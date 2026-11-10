// AI-assisted: see docs/AI_LOG.md #50

const PAYMENT_METHOD_LABELS = {
  cash: 'Efectivo',
  mercadopago: 'Mercado Pago',
  stripe: 'Stripe',
};

const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cash_received: 'Confirmado',
};

const CATEGORY_LABELS = {
  economy: 'Económica',
  xl: 'XL',
  premium: 'Premium',
};

const ACCOUNT_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const TRIP_STATUS_LABELS = {
  requested: 'Solicitado',
  accepted: 'Aceptado',
  driver_arriving: 'En camino a recogida',
  in_progress: 'En curso',
  completed: 'Completado',
  paid: 'Pagado',
  cancelled: 'Cancelado',
  rejected: 'Rechazado',
};

/**
 * @param {string|null|undefined} method
 * @returns {string}
 */
export function paymentMethodLabel(method) {
  if (!method) return '—';
  return PAYMENT_METHOD_LABELS[method] ?? String(method);
}

/**
 * @param {string|null|undefined} status
 * @param {string|null|undefined} [tripStatus]
 * @returns {string}
 */
export function paymentStatusLabel(status, tripStatus) {
  if (tripStatus === 'paid' && status === 'cash_received') {
    return 'Confirmado';
  }
  if (!status) {
    return tripStatus === 'paid' ? 'Pagado' : 'Pendiente';
  }
  return PAYMENT_STATUS_LABELS[status] ?? String(status);
}

/**
 * @param {string|null|undefined} category
 * @returns {string}
 */
export function categoryLabel(category) {
  if (!category) return '—';
  return CATEGORY_LABELS[category] ?? String(category);
}

/**
 * @param {string|null|undefined} status
 * @returns {string}
 */
export function accountStatusLabel(status) {
  if (!status) return '—';
  return ACCOUNT_STATUS_LABELS[status] ?? String(status);
}

/**
 * @param {string|null|undefined} status
 * @returns {string}
 */
export function tripStatusLabel(status) {
  if (!status) return '—';
  return TRIP_STATUS_LABELS[status] ?? String(status);
}

/**
 * Maps internal error codes/messages to Spanish UI text.
 * @param {string|null|undefined} reason
 * @param {string} fallback
 * @returns {string}
 */
export function errorReasonLabel(reason, fallback) {
  if (!reason) return fallback;
  const known = {
    no_trip: 'No hay un viaje activo.',
    driver_not_authenticated: 'Debes iniciar sesión para continuar.',
    only_cash_supported: 'Por ahora solo está habilitado el cobro en efectivo.',
    account_not_approved: 'Tu cuenta aún no está aprobada.',
  };
  if (known[reason]) {
    return known[reason];
  }
  if (/^[a-z0-9_]+$/i.test(reason) && reason.includes('_')) {
    return fallback;
  }
  return reason;
}
