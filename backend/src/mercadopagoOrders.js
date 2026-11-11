// AI-assisted: see docs/AI_LOG.md #56, #60, #61, #63
import { randomUUID } from 'node:crypto';

const MP_ORDERS_URL = 'https://api.mercadopago.com/v1/orders';

/**
 * Formats a COP amount for Mercado Pago Orders.
 * Colombia has no cents: the API pattern rejects values like "19200.00".
 * @param {number} amountCop
 * @returns {string}
 */
export function formatAmount(amountCop) {
  const amount = Number(amountCop);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('amount must be a positive number');
  }
  return String(Math.round(amount));
}

/**
 * Creates a Checkout Pro order via Orders API.
 * @param {{
 *   accessToken: string,
 *   tripId: string,
 *   amount: number,
 *   payerEmail: string,
 *   returnUrl: string,
 * }} params
 * @returns {Promise<{ orderId: string, checkoutUrl: string, status: string }>}
 */
export async function createCheckoutOrder({
  accessToken,
  tripId,
  amount,
  payerEmail,
  returnUrl,
}) {
  const totalAmount = formatAmount(amount);
  const body = {
    type: 'online',
    processing_mode: 'manual',
    total_amount: totalAmount,
    external_reference: tripId,
    description: `UberClone trip ${tripId}`,
    payer: {
      email: payerEmail,
    },
    items: [
      {
        title: `Viaje ${tripId}`,
        unit_price: totalAmount,
        quantity: 1,
      },
    ],
    config: {
      online: {
        success_url: returnUrl,
        failure_url: returnUrl,
        pending_url: returnUrl,
        auto_return: 'all',
      },
    },
  };

  const response = await fetch(MP_ORDERS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      payload?.message ||
      payload?.error ||
      JSON.stringify(payload) ||
      response.statusText;
    throw new Error(`Mercado Pago create order failed: ${detail}`);
  }

  const orderId = payload?.id;
  const checkoutUrl = payload?.checkout_url;
  if (!orderId || !checkoutUrl) {
    throw new Error('Mercado Pago response missing id or checkout_url');
  }

  return {
    orderId,
    checkoutUrl,
    status: payload?.status ?? 'created',
  };
}

/**
 * Fetches an order by id from Mercado Pago.
 * @param {{ accessToken: string, orderId: string }} params
 * @returns {Promise<object>}
 */
export async function getOrderById({ accessToken, orderId }) {
  const response = await fetch(
    `${MP_ORDERS_URL}/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      payload?.message ||
      payload?.error ||
      JSON.stringify(payload) ||
      response.statusText;
    throw new Error(`Mercado Pago get order failed: ${detail}`);
  }

  return payload;
}

/**
 * Maps Mercado Pago order status to trip paymentStatus.
 * Card rejections often leave the order in `action_required`/`waiting_retry`
 * while `transactions.payments[]` already has `status: failed`.
 * @param {object} order
 * @returns {'approved'|'pending'|'rejected'}
 */
export function mapOrderPaymentStatus(order) {
  const status = String(order?.status ?? '');
  const detail = String(order?.status_detail ?? '');
  const payments = Array.isArray(order?.transactions?.payments)
    ? order.transactions.payments
    : [];

  if (status === 'processed' && detail === 'accredited') {
    return 'approved';
  }

  const hasAccreditedPayment = payments.some(
    (payment) =>
      String(payment?.status ?? '') === 'processed' &&
      String(payment?.status_detail ?? '') === 'accredited'
  );
  if (hasAccreditedPayment) {
    return 'approved';
  }

  if (status === 'failed' || status === 'canceled' || status === 'cancelled') {
    return 'rejected';
  }

  const hasFailedPayment = payments.some(
    (payment) => String(payment?.status ?? '') === 'failed'
  );
  if (hasFailedPayment) {
    return 'rejected';
  }

  return 'pending';
}
