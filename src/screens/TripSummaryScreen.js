// AI-assisted: see docs/AI_LOG.md #21, #27, #50
import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { PRICING } from '../config/pricing';
import {
  errorReasonLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from '../utils/displayLabels';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Fare summary and cash payment confirmation.
 */
export default function TripSummaryScreen({ navigation }) {
  const { trip, markPaid, clearTrip } = useActiveTrip();
  const [busy, setBusy] = useState(false);

  const onConfirmPayment = useCallback(async () => {
    if (trip?.paymentMethod !== 'cash') {
      Alert.alert(
        'Pago',
        'Por ahora solo está habilitado el cobro en efectivo.'
      );
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
        <Pressable
          style={[commonStyles.primaryButton, { marginTop: 20 }]}
          onPress={onConfirmPayment}
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
          emphasize && { color: colors.accent, fontSize: 16 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
