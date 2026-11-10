// AI-assisted: see docs/AI_LOG.md #19, #27, #28, #46, #50
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import {
  categoryLabel,
  errorReasonLabel,
  paymentMethodLabel,
} from '../utils/displayLabels';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

const COUNTDOWN_SECONDS = 15;

/**
 * Incoming request with 15s auto-reject timer.
 */
export default function IncomingRequestScreen({ navigation }) {
  const { trip, acceptTrip, rejectTrip } = useActiveTrip();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [busy, setBusy] = useState(false);
  const expireAllowedRef = useRef(false);

  const onReject = useCallback(async () => {
    setBusy(true);
    try {
      await rejectTrip();
      navigation.navigate('Home');
    } finally {
      setBusy(false);
    }
  }, [rejectTrip, navigation]);

  const onAccept = useCallback(async () => {
    setBusy(true);
    try {
      const result = await acceptTrip();
      if (!result?.ok) {
        Alert.alert(
          'No se pudo aceptar',
          errorReasonLabel(
            result?.reason,
            'No se pudo calcular la ruta o la distancia al aceptar.'
          )
        );
        return;
      }
      navigation.replace('TripInProgress');
    } finally {
      setBusy(false);
    }
  }, [acceptTrip, navigation]);

  useEffect(() => {
    if (!trip) {
      navigation.navigate('Home');
      return undefined;
    }
    if (trip.status !== 'requested') {
      return undefined;
    }

    expireAllowedRef.current = false;
    setSecondsLeft(COUNTDOWN_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          expireAllowedRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [trip?.tripId, trip?.status, trip, navigation]);

  useEffect(() => {
    if (
      secondsLeft !== 0 ||
      !expireAllowedRef.current ||
      !trip ||
      trip.status !== 'requested' ||
      busy
    ) {
      return undefined;
    }
    expireAllowedRef.current = false;
    (async () => {
      try {
        await rejectTrip();
      } finally {
        navigation.navigate('Home');
      }
    })();
    return undefined;
  }, [secondsLeft, trip, rejectTrip, navigation, busy]);

  if (!trip) {
    return (
      <View style={[commonStyles.screenPadded, styles.centered]}>
        <Text style={commonStyles.muted}>Sin solicitud activa</Text>
      </View>
    );
  }

  return (
    <View style={[commonStyles.screenPadded, styles.centered]}>
      <Text style={[commonStyles.title, styles.centerText]}>Solicitud entrante</Text>
      <Text style={commonStyles.timer}>{secondsLeft}s</Text>

      <View style={commonStyles.card}>
        <Text style={commonStyles.body}>Pasajero: {trip.passengerName ?? '—'}</Text>
        <Text style={commonStyles.body}>Origen: {trip.origin.address}</Text>
        <Text style={commonStyles.body}>Destino: {trip.destination.address}</Text>
        <Text style={commonStyles.body}>
          Distancia: {trip.distanceKm} km · {trip.durationMin} min
        </Text>
        <Text style={commonStyles.body}>
          Categoría: {categoryLabel(trip.category)}
        </Text>
        <Text style={commonStyles.body}>
          Pago: {paymentMethodLabel(trip.paymentMethod)}
        </Text>
        <Text style={commonStyles.body}>
          Propina: ${(trip.tip ?? 0).toLocaleString('es-CO')}
        </Text>
        <Text style={styles.fare}>
          Tarifa estimada: ${trip.fare.toLocaleString('es-CO')}
        </Text>
        <Text style={styles.earn}>
          Ganancia neta: ${trip.driverEarnings.toLocaleString('es-CO')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, commonStyles.dangerButton]}
          onPress={onReject}
          disabled={busy}
        >
          <Text style={commonStyles.primaryButtonText}>Rechazar</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, commonStyles.accentButton]}
          onPress={onAccept}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Aceptar</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  fare: {
    marginTop: spacing.sm,
    fontWeight: '700',
    color: colors.primary,
    fontSize: 16,
  },
  earn: { fontWeight: '600', color: colors.accent, fontSize: 16 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  actionBtn: { flex: 1 },
});
