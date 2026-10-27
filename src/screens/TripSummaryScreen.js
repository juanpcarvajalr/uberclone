// AI-assisted: see docs/AI_LOG.md #21, #27
import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverSession } from '../context/DriverSessionContext';
import { PRICING } from '../config/pricing';
import { t } from '../i18n';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Fare summary and mock payment confirmation.
 */
export default function TripSummaryScreen({ navigation }) {
  const { trip, markPaid, clearTrip } = useActiveTrip();
  const { driver } = useDriverSession();
  const lang = driver.language ?? 'es';

  const onConfirmPayment = useCallback(() => {
    const status = trip?.paymentMethod === 'cash' ? 'cash_received' : 'approved';
    markPaid(status);
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

  const paymentLabel =
    trip.status === 'paid'
      ? trip.paymentMethod === 'cash'
        ? 'Efectivo'
        : trip.paymentStatus === 'approved'
          ? 'Aprobado'
          : trip.paymentStatus
      : 'Pendiente';

  return (
    <View style={[commonStyles.screenPadded, { justifyContent: 'center' }]}>
      {/* AI-assisted: see docs/AI_LOG.md #21, #27 */}
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
        {t(lang, 'summaryTitle')}
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
        <Row label="Método de pago" value={trip.paymentMethod} />
        <Row label="Estado del pago" value={paymentLabel} />
      </View>

      {trip.status !== 'paid' ? (
        <Pressable
          style={[commonStyles.primaryButton, { marginTop: 20 }]}
          onPress={onConfirmPayment}
        >
          <Text style={commonStyles.primaryButtonText}>
            {trip.paymentMethod === 'cash'
              ? 'Marcar efectivo recibido'
              : 'Simular pago aprobado'}
          </Text>
        </Pressable>
      ) : (
        <Pressable style={[commonStyles.primaryButton, { marginTop: 20 }]} onPress={onDone}>
          <Text style={commonStyles.primaryButtonText}>Volver al inicio</Text>
        </Pressable>
      )}
    </View>
  );
}

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
