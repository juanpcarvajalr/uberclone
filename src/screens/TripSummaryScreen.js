// AI-assisted: see docs/AI_LOG.md #21, #27, #50, #58
import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { PRICING } from '../config/pricing';
import { createMercadoPagoCheckout } from '../services/paymentsService';
import {
  errorReasonLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from '../utils/displayLabels';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Fare summary with cash confirmation or Mercado Pago checkout.
 */
export default function TripSummaryScreen({ navigation }) {
  const { trip, markPaid, clearTrip } = useActiveTrip();
  const [busy, setBusy] = useState(false);

  const onConfirmCash = useCallback(async () => {
    if (trip?.paymentMethod !== 'cash') {
      Alert.alert('Pago', 'Este viaje no es en efectivo.');
      return;
    }
    setBusy(true);
    try {
      const result = await markPaid();
      if (!result?.ok) {
        Alert.alert(
          'Pago',
          errorReasonLabel(
            result?.reason,
            'No se pudo confirmar el pago en efectivo.'
          )
        );
      }
    } finally {
      setBusy(false);
    }
  }, [markPaid, trip?.paymentMethod]);

  const onOpenMercadoPago = useCallback(async () => {
    if (trip?.paymentMethod !== 'mercadopago') {
      Alert.alert('Pago', 'Este viaje no usa Mercado Pago.');
      return;
    }
    if (!trip?.tripId || !Number.isFinite(Number(trip?.fare))) {
      Alert.alert('Pago', 'Faltan datos del viaje para crear el checkout.');
      return;
    }

    setBusy(true);
    try {
      const checkout = await createMercadoPagoCheckout({
        tripId: trip.tripId,
        amount: Number(trip.fare),
      });
      navigation.navigate('MercadoPagoCheckout', {
        tripId: trip.tripId,
        orderId: checkout.orderId,
        checkoutUrl: checkout.checkoutUrl,
      });
    } catch (error) {
      Alert.alert(
        'Pago',
        error instanceof Error
          ? error.message
          : 'No se pudo abrir Mercado Pago.'
      );
    } finally {
      setBusy(false);
    }
  }, [navigation, trip]);

  const onDone = useCallback(() => {
    clearTrip();
    navigation.navigate('Home');
  }, [clearTrip, navigation]);

  if (!trip) {
    return (
      <View style={[commonStyles.screenPadded, { justifyContent: 'center' }]}>
        <Text style={commonStyles.muted}>Sin resumen disponible</Text>
      </View>
    );
  }

  const isCash = trip.paymentMethod === 'cash';
  const isMercadoPago = trip.paymentMethod === 'mercadopago';

  return (
    <View style={[commonStyles.screenPadded, { justifyContent: 'center' }]}>
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
        Cobro y resumen
      </Text>

      <View style={commonStyles.card}>
        <Row label="Tarifa final" value={`$${trip.fare.toLocaleString('es-CO')}`} />
        <Row
          label={`Comisión (${(trip.commissionRate ?? PRICING.commissionRate) * 100} %)`}
          value={`$${trip.commission.toLocaleString('es-CO')}`}
        />
        <Row label="Propina" value={`$${(trip.tip ?? 0).toLocaleString('es-CO')}`} />
        <Row
          label="Ganancia neta"
          value={`$${trip.driverEarnings.toLocaleString('es-CO')}`}
          emphasize
        />
        <Row
          label="Método de pago"
          value={paymentMethodLabel(trip.paymentMethod)}
        />
        <Row
          label="Estado del pago"
          value={paymentStatusLabel(trip.paymentStatus, trip.status)}
        />
      </View>

      {trip.status !== 'paid' ? (
        <>
          {isCash ? (
            <Pressable
              style={[commonStyles.primaryButton, { marginTop: 20 }]}
              onPress={onConfirmCash}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={commonStyles.primaryButtonText}>
                  Confirmar pago en efectivo
                </Text>
              )}
            </Pressable>
          ) : null}

          {isMercadoPago ? (
            <Pressable
              style={[commonStyles.primaryButton, { marginTop: 20 }]}
              onPress={onOpenMercadoPago}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={commonStyles.primaryButtonText}>
                  Pagar con Mercado Pago
                </Text>
              )}
            </Pressable>
          ) : null}
        </>
      ) : (
        <Pressable style={[commonStyles.primaryButton, { marginTop: 20 }]} onPress={onDone}>
          <Text style={commonStyles.primaryButtonText}>Volver al inicio</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * @param {{ label: string, value: string, emphasize?: boolean }} props
 */
function Row({ label, value, emphasize }) {
  return (
    <View style={commonStyles.row}>
      <Text style={commonStyles.caption}>{label}</Text>
      <Text
        style={[
          commonStyles.body,
          { fontWeight: '600' },
          emphasize ? { color: colors.accent } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
