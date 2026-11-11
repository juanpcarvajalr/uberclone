// AI-assisted: see docs/AI_LOG.md #56, #57, #60
import express from 'express';
import cors from 'cors';
import { loadConfig } from './config.js';
import { initFirestore } from './firestoreAdmin.js';
import { createCheckoutOrder } from './mercadopagoOrders.js';
import {
  attachOrderToTrip,
  readTrip,
  verifyAndSettleTripPayment,
} from './tripPayments.js';
import { notifyAvailableDrivers } from './pushNotifications.js';

const config = loadConfig();
initFirestore(config.firebaseServiceAccountPath);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

/**
 * Creates a Mercado Pago Checkout Pro order for a completed trip.
 * Body: { tripId: string, amount: number, returnUrl: string }
 */
app.post('/payments/mercadopago/checkout', async (req, res) => {
  try {
    const tripId = String(req.body?.tripId ?? '').trim();
    const amount = Number(req.body?.amount);
    const returnUrl = String(req.body?.returnUrl ?? '').trim();

    if (!tripId) {
      res.status(400).json({ ok: false, error: 'tripId is required' });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ ok: false, error: 'amount must be a positive number' });
      return;
    }
    if (!returnUrl.startsWith('https://')) {
      res.status(400).json({
        ok: false,
        error: 'returnUrl must be an HTTPS URL',
      });
      return;
    }

    const trip = await readTrip(tripId);
    if (trip.data.status !== 'completed' && trip.data.status !== 'paid') {
      res.status(409).json({
        ok: false,
        error: `Trip must be completed (current: ${trip.data.status})`,
      });
      return;
    }

    const expectedFare = Number(trip.data.fare);
    if (Number.isFinite(expectedFare) && expectedFare !== amount) {
      res.status(400).json({
        ok: false,
        error: `amount does not match trip fare (${expectedFare})`,
      });
      return;
    }

    const order = await createCheckoutOrder({
      accessToken: config.mpAccessToken,
      tripId,
      amount,
      payerEmail: config.mpPayerEmail,
      returnUrl,
    });

    await attachOrderToTrip(tripId, order.orderId);

    res.status(201).json({
      ok: true,
      tripId,
      orderId: order.orderId,
      checkoutUrl: order.checkoutUrl,
      status: order.status,
    });
  } catch (error) {
    console.error('checkout failed:', error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Verifies order status with Mercado Pago and marks the trip paid when accredited.
 * Body: { tripId: string, orderId?: string }
 */
app.post('/payments/verify', async (req, res) => {
  try {
    const tripId = String(req.body?.tripId ?? '').trim();
    const orderId = req.body?.orderId
      ? String(req.body.orderId).trim()
      : null;

    if (!tripId) {
      res.status(400).json({ ok: false, error: 'tripId is required' });
      return;
    }

    const result = await verifyAndSettleTripPayment({
      accessToken: config.mpAccessToken,
      tripId,
      orderId,
    });

    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('verify failed:', error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Notifies available drivers (FCM) about an incoming trip request.
 * Body: { category: string, title?: string, body?: string }
 */
app.post('/notifications/trip-request', async (req, res) => {
  try {
    const category = String(req.body?.category ?? '').trim();
    if (!category) {
      res.status(400).json({ ok: false, error: 'category is required' });
      return;
    }
    const result = await notifyAvailableDrivers({
      category,
      title: req.body?.title ? String(req.body.title) : undefined,
      body: req.body?.body ? String(req.body.body) : undefined,
    });
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('trip-request notification failed:', error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Webhook / topic notification from Mercado Pago (best-effort).
 * Always re-queries the Orders API before updating Firestore.
 */
app.post('/webhooks/mercadopago', async (req, res) => {
  try {
    const orderId =
      req.body?.data?.id ||
      req.body?.id ||
      req.query?.['data.id'] ||
      req.query?.id ||
      null;
    const externalReference =
      req.body?.external_reference ||
      req.body?.data?.external_reference ||
      null;

    if (!orderId && !externalReference) {
      res.status(200).json({ ok: true, ignored: true });
      return;
    }

    let tripId = externalReference ? String(externalReference) : null;
    if (!tripId && orderId) {
      const { getOrderById } = await import('./mercadopagoOrders.js');
      const order = await getOrderById({
        accessToken: config.mpAccessToken,
        orderId: String(orderId),
      });
      tripId = order?.external_reference
        ? String(order.external_reference)
        : null;
    }

    if (!tripId) {
      res.status(200).json({ ok: true, ignored: true });
      return;
    }

    const result = await verifyAndSettleTripPayment({
      accessToken: config.mpAccessToken,
      tripId,
      orderId: orderId ? String(orderId) : null,
    });

    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error('webhook failed:', error);
    res.status(200).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`UberClone backend listening on ${config.port}`);
});
