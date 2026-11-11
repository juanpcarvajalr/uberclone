// AI-assisted: see docs/AI_LOG.md #58, #60
import { BACKEND_HOSTS, BACKEND_PORT } from '../config/backend';
import { PAYMENT_RETURN_URL } from '../config/payments';

/**
 * @param {string} host
 * @param {string} path
 * @returns {string}
 */
function buildUrl(host, path) {
  return `http://${host}:${BACKEND_PORT}${path}`;
}

/**
 * Tries each backend host until one responds.
 * @param {string} path
 * @param {RequestInit} [init]
 * @returns {Promise<object>}
 */
async function requestBackend(path, init = {}) {
  let lastError = null;

  for (const host of BACKEND_HOSTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(buildUrl(host, path), {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        throw new Error(
          payload?.error || `Backend ${path} failed (${response.status})`
        );
      }
      return payload;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : 'No se pudo contactar el backend de pagos'
  );
}

/**
 * Asks the backend to create a Mercado Pago Checkout Pro order.
 * @param {{ tripId: string, amount: number }} params
 * @returns {Promise<{ orderId: string, checkoutUrl: string }>}
 */
export async function createMercadoPagoCheckout({ tripId, amount }) {
  try {
    const payload = await requestBackend('/payments/mercadopago/checkout', {
      method: 'POST',
      body: JSON.stringify({
        tripId,
        amount,
        returnUrl: PAYMENT_RETURN_URL,
      }),
    });
    if (!payload?.checkoutUrl || !payload?.orderId) {
      throw new Error('Respuesta de checkout incompleta');
    }
    return {
      orderId: String(payload.orderId),
      checkoutUrl: String(payload.checkoutUrl),
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo crear el checkout'
    );
  }
}

/**
 * Asks the backend to verify the order with Mercado Pago and settle the trip.
 * @param {{ tripId: string, orderId?: string|null }} params
 * @returns {Promise<object>}
 */
export async function verifyMercadoPagoPayment({ tripId, orderId = null }) {
  try {
    return await requestBackend('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        tripId,
        ...(orderId ? { orderId } : {}),
      }),
    });
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'No se pudo verificar el pago'
    );
  }
}
