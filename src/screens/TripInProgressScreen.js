// AI-assisted: see docs/AI_LOG.md #20
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';

/**
 * Trip in progress: pickup phase then destination phase (mock route labels).
 */
export default function TripInProgressScreen({ navigation }) {
  const { trip, markPassengerOnBoard, completeTrip } = useActiveTrip();
  const { driver } = useDriverSession();
  const lang = driver.language ?? 'es';

  const onBoard = useCallback(() => {
    markPassengerOnBoard();
  }, [markPassengerOnBoard]);

  const onFinish = useCallback(() => {
    completeTrip();
    navigation.replace('TripSummary');
  }, [completeTrip, navigation]);

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Sin viaje activo</Text>
      </View>
    );
  }

  const goingToPickup = trip.status === 'accepted' || trip.status === 'driver_arriving';
  const target = goingToPickup ? trip.origin : trip.destination;

  return (
    <View style={styles.container}>
      {/* AI-assisted: see docs/AI_LOG.md #20 */}
      <View style={styles.mapStub}>
        <Text style={styles.phase}>
          {goingToPickup ? t(lang, 'goingToPickup') : t(lang, 'goingToDestination')}
        </Text>
        <Text style={styles.address}>{target.address}</Text>
        <Text style={styles.coords}>
          {target.lat.toFixed(4)}, {target.lng.toFixed(4)}
        </Text>
        <Text style={styles.status}>Estado: {trip.status}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>{t(lang, 'tripInProgress')}</Text>
        <Text style={styles.meta}>
          {trip.origin.address} → {trip.destination.address}
        </Text>
        {goingToPickup ? (
          <Pressable style={styles.primary} onPress={onBoard}>
            <Text style={styles.primaryText}>{t(lang, 'passengerOnBoard')}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primary} onPress={onFinish}>
            <Text style={styles.primaryText}>{t(lang, 'finishTrip')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapStub: {
    flex: 1,
    backgroundColor: colors.mapStub,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  phase: { fontSize: 18, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  address: { marginTop: 12, fontSize: 16, color: colors.text, textAlign: 'center' },
  coords: { marginTop: 6, color: colors.textMuted },
  status: { marginTop: 16, color: colors.textMuted },
  panel: {
    backgroundColor: colors.surface,
    padding: 20,
    gap: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  meta: { color: colors.textMuted },
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  muted: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
});
