// AI-assisted: see docs/AI_LOG.md #21
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverSession } from '../context/DriverSessionContext';
import { PRICING } from '../config/pricing';
import { t } from '../i18n';
import { colors } from '../theme/colors';

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
      <View style={styles.container}>
        <Text style={styles.muted}>Sin resumen disponible</Text>
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
    <View style={styles.container}>
      {/* AI-assisted: see docs/AI_LOG.md #21 */}
      <Text style={styles.title}>{t(lang, 'summaryTitle')}</Text>

      <View style={styles.card}>
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
        <Pressable style={styles.primary} onPress={onConfirmPayment}>
          <Text style={styles.primaryText}>
            {trip.paymentMethod === 'cash'
              ? 'Marcar efectivo recibido'
              : 'Simular pago aprobado'}
          </Text>
        </Pressable>
      ) : (
        <Pressable style={styles.primary} onPress={onDone}>
          <Text style={styles.primaryText}>Volver al inicio</Text>
        </Pressable>
      )}
    </View>
  );
}

function Row({ label, value, emphasize }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, emphasize && styles.emphasize]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600' },
  emphasize: { color: colors.accent, fontSize: 16 },
  primary: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  muted: { textAlign: 'center', color: colors.textMuted },
});
