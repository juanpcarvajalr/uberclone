// AI-assisted: see docs/AI_LOG.md #19, #27, #28
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

const COUNTDOWN_SECONDS = 15;

/**
 * Incoming request with 15s auto-reject timer.
 */
export default function IncomingRequestScreen({ navigation }) {
  const { trip, acceptTrip, rejectTrip } = useActiveTrip();
  const { driver } = useDriverSession();
  const lang = driver.language ?? 'es';
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const expireAllowedRef = useRef(false);

  const onReject = useCallback(() => {
    rejectTrip();
    navigation.navigate('Home');
  }, [rejectTrip, navigation]);

  const onAccept = useCallback(() => {
    acceptTrip();
    navigation.replace('TripInProgress');
  }, [acceptTrip, navigation]);

  useEffect(() => {
    if (!trip || trip.status !== 'requested') {
      navigation.navigate('Home');
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
  }, [trip?.tripId, trip?.status, navigation]);

  useEffect(() => {
    if (
      secondsLeft !== 0 ||
      !expireAllowedRef.current ||
      !trip ||
      trip.status !== 'requested'
    ) {
      return undefined;
    }
    expireAllowedRef.current = false;
    rejectTrip();
    navigation.navigate('Home');
    return undefined;
  }, [secondsLeft, trip, rejectTrip, navigation]);

  if (!trip) {
    return (
      <View style={[commonStyles.screenPadded, styles.centered]}>
        <Text style={commonStyles.muted}>Sin solicitud activa</Text>
      </View>
    );
  }

  return (
    <View style={[commonStyles.screenPadded, styles.centered]}>
      {/* AI-assisted: see docs/AI_LOG.md #19, #27 */}
      <Text style={[commonStyles.title, styles.centerText]}>{t(lang, 'incomingTitle')}</Text>
      <Text style={commonStyles.timer}>{secondsLeft}s</Text>

      <View style={commonStyles.card}>
        <Text style={commonStyles.body}>Pasajero: {trip.passengerName ?? '—'}</Text>
        <Text style={commonStyles.body}>Origen: {trip.origin.address}</Text>
        <Text style={commonStyles.body}>Destino: {trip.destination.address}</Text>
        <Text style={commonStyles.body}>
          Distancia: {trip.distanceKm} km · {trip.durationMin} min
        </Text>
        <Text style={commonStyles.body}>Categoría: {trip.category}</Text>
        <Text style={commonStyles.body}>Pago: {trip.paymentMethod}</Text>
        <Text style={styles.fare}>
          Tarifa estimada: ${trip.fare.toLocaleString('es-CO')}
        </Text>
        <Text style={styles.earn}>
          Ganancia neta: ${trip.driverEarnings.toLocaleString('es-CO')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, commonStyles.dangerButton]} onPress={onReject}>
          <Text style={commonStyles.primaryButtonText}>{t(lang, 'reject')}</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, commonStyles.accentButton]} onPress={onAccept}>
          <Text style={commonStyles.primaryButtonText}>{t(lang, 'accept')}</Text>
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
