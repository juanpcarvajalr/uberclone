// AI-assisted: see docs/AI_LOG.md #20, #27
import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { commonStyles } from '../theme/commonStyles';

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
      <View style={commonStyles.screen}>
        <Text style={commonStyles.muted}>Sin viaje activo</Text>
      </View>
    );
  }

  const goingToPickup = trip.status === 'accepted' || trip.status === 'driver_arriving';
  const target = goingToPickup ? trip.origin : trip.destination;

  return (
    <View style={commonStyles.screen}>
      {/* AI-assisted: see docs/AI_LOG.md #20, #27 */}
      <View style={commonStyles.mapStub}>
        <Text style={[commonStyles.subtitle, { textAlign: 'center' }]}>
          {goingToPickup ? t(lang, 'goingToPickup') : t(lang, 'goingToDestination')}
        </Text>
        <Text style={[commonStyles.body, { textAlign: 'center', marginTop: 12 }]}>
          {target.address}
        </Text>
        <Text style={commonStyles.caption}>
          {target.lat.toFixed(4)}, {target.lng.toFixed(4)}
        </Text>
        <Text style={[commonStyles.caption, { marginTop: 16 }]}>Estado: {trip.status}</Text>
      </View>

      <View style={commonStyles.panel}>
        <Text style={commonStyles.title}>{t(lang, 'tripInProgress')}</Text>
        <Text style={commonStyles.caption}>
          {trip.origin.address} → {trip.destination.address}
        </Text>
        {goingToPickup ? (
          <Pressable style={commonStyles.primaryButton} onPress={onBoard}>
            <Text style={commonStyles.primaryButtonText}>{t(lang, 'passengerOnBoard')}</Text>
          </Pressable>
        ) : (
          <Pressable style={commonStyles.primaryButton} onPress={onFinish}>
            <Text style={commonStyles.primaryButtonText}>{t(lang, 'finishTrip')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
