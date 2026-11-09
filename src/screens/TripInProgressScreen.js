// AI-assisted: see docs/AI_LOG.md #20, #27, #46
import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverSession } from '../context/DriverSessionContext';
import TripRouteMap from '../components/TripRouteMap';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Trip in progress: Directions to pickup, then to destination (Spec §6).
 */
export default function TripInProgressScreen({ navigation }) {
  const { trip, markPassengerOnBoard, completeTrip } = useActiveTrip();
  const { location } = useDriverSession();
  const [busy, setBusy] = useState(false);

  const onBoard = useCallback(async () => {
    setBusy(true);
    try {
      const result = await markPassengerOnBoard();
      if (!result?.ok) {
        Alert.alert(
          'Ruta',
          result?.reason ?? 'No se pudo obtener la ruta al destino (Directions).'
        );
      }
    } finally {
      setBusy(false);
    }
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

  const goingToPickup =
    trip.status === 'accepted' || trip.status === 'driver_arriving';
  const target = goingToPickup ? trip.origin : trip.destination;

  return (
    <View style={commonStyles.screen}>
      <TripRouteMap
        driverLocation={location}
        target={target}
        routeCoordinates={trip.routeCoordinates}
        targetTitle={goingToPickup ? 'Punto de recogida' : 'Destino'}
      />

      <View style={commonStyles.panel}>
        <Text style={commonStyles.title}>Viaje en curso</Text>
        <Text style={commonStyles.caption}>
          {goingToPickup ? 'Rumbo al punto de recogida' : 'Rumbo al destino'}
        </Text>
        <Text style={commonStyles.body}>{target.address}</Text>
        <Text style={commonStyles.caption}>
          {trip.origin.address} → {trip.destination.address}
        </Text>
        {busy ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />
        ) : goingToPickup ? (
          <Pressable style={commonStyles.primaryButton} onPress={onBoard}>
            <Text style={commonStyles.primaryButtonText}>Pasajero a bordo</Text>
          </Pressable>
        ) : (
          <Pressable style={commonStyles.primaryButton} onPress={onFinish}>
            <Text style={commonStyles.primaryButtonText}>Finalizar viaje</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
