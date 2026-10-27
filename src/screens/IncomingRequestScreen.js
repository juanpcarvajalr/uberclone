// AI-assisted: see docs/AI_LOG.md #19, #29
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';

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
      <View style={styles.container}>
        <Text style={styles.muted}>Sin solicitud activa</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* AI-assisted: see docs/AI_LOG.md #19 */}
      <Text style={styles.title}>{t(lang, 'incomingTitle')}</Text>
      <Text style={styles.timer}>{secondsLeft}s</Text>

      <View style={styles.card}>
        <Text style={styles.line}>Pasajero: {trip.passengerName ?? '—'}</Text>
        <Text style={styles.line}>Origen: {trip.origin.address}</Text>
        <Text style={styles.line}>Destino: {trip.destination.address}</Text>
        <Text style={styles.line}>
          Distancia: {trip.distanceKm} km · {trip.durationMin} min
        </Text>
        <Text style={styles.line}>Categoría: {trip.category}</Text>
        <Text style={styles.line}>Pago: {trip.paymentMethod}</Text>
        <Text style={styles.fare}>Tarifa estimada: ${trip.fare.toLocaleString('es-CO')}</Text>
        <Text style={styles.earn}>
          Ganancia neta: ${trip.driverEarnings.toLocaleString('es-CO')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.reject]} onPress={onReject}>
          <Text style={styles.btnText}>{t(lang, 'reject')}</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.accept]} onPress={onAccept}>
          <Text style={styles.btnText}>{t(lang, 'accept')}</Text>
        </Pressable>
      </View>
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
  title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  timer: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.warning,
    textAlign: 'center',
    marginVertical: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  line: { color: colors.text, fontSize: 15 },
  fare: { marginTop: 8, fontWeight: '700', color: colors.primary, fontSize: 16 },
  earn: { fontWeight: '600', color: colors.accent, fontSize: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  reject: { backgroundColor: colors.danger },
  accept: { backgroundColor: colors.accent },
  btnText: { color: '#fff', fontWeight: '700' },
  muted: { textAlign: 'center', color: colors.textMuted },
});
