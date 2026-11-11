// AI-assisted: see docs/AI_LOG.md #57
import { getFirestore } from './firestoreAdmin.js';
import { getOrderById, mapOrderPaymentStatus } from './mercadopagoOrders.js';

/**
 * @param {string} tripId
 * @returns {Promise<{ id: string, data: FirebaseFirestore.DocumentData }>}
 */
export async function readTrip(tripId) {
  const snap = await getFirestore().collection('trips').doc(tripId).get();
  if (!snap.exists) {
    throw new Error(`Trip not found: ${tripId}`);
  }
  return { id: snap.id, data: snap.data() };
}

/**
 * Stores Mercado Pago order id on the trip while payment is pending.
 * @param {string} tripId
 * @param {string} orderId
 * @returns {Promise<void>}
 */
export async function attachOrderToTrip(tripId, orderId) {
  await getFirestore().collection('trips').doc(tripId).update({
    paymentId: orderId,
    paymentStatus: 'pending',
    paymentMethod: 'mercadopago',
  });
}

/**
 * Verifies the order with Mercado Pago and updates payment fields when approved.
 * @param {{
 *   accessToken: string,
 *   tripId: string,
 *   orderId?: string|null,
 * }} params
 * @returns {Promise<{
 *   tripId: string,
 *   orderId: string,
 *   orderStatus: string,
 *   paymentStatus: 'approved'|'pending'|'rejected',
 *   tripStatus: string,
 *   updated: boolean,
 * }>}
 */
export async function verifyAndSettleTripPayment({
  accessToken,
  tripId,
  orderId = null,
}) {
  const trip = await readTrip(tripId);
  const resolvedOrderId = orderId || trip.data.paymentId;
  if (!resolvedOrderId) {
    throw new Error('orderId is required (trip has no paymentId yet)');
  }

  if (trip.data.paymentMethod && trip.data.paymentMethod !== 'mercadopago') {
    throw new Error('Trip paymentMethod is not mercadopago');
  }

  const order = await getOrderById({
    accessToken,
    orderId: resolvedOrderId,
  });

  const paymentStatus = mapOrderPaymentStatus(order);
  const patch = {
    paymentId: resolvedOrderId,
    paymentStatus,
    paymentMethod: 'mercadopago',
  };

  let tripStatus = trip.data.status;
  let updated = false;

  if (paymentStatus === 'approved' && trip.data.status !== 'paid') {
    if (trip.data.status !== 'completed' && trip.data.status !== 'paid') {
      throw new Error(
        `Trip must be completed before marking paid (current: ${trip.data.status})`
      );
    }
    patch.status = 'paid';
    tripStatus = 'paid';
    updated = true;
  } else if (trip.data.paymentStatus !== paymentStatus) {
    updated = true;
  }

  if (updated || trip.data.paymentId !== resolvedOrderId) {
    await getFirestore().collection('trips').doc(tripId).update(patch);
    updated = true;
  }

  return {
    tripId,
    orderId: resolvedOrderId,
    orderStatus: String(order.status ?? ''),
    paymentStatus,
    tripStatus,
    updated,
  };
}
