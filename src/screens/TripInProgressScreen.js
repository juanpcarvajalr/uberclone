// AI-assisted: see docs/AI_LOG.md #20, #27, #46, #50
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useActiveTrip } from '../context/ActiveTripContext';
import TripRouteMap from '../components/TripRouteMap';
import { resolveRouteCoordinates } from '../utils/routeCoordinates';
import { errorReasonLabel } from '../utils/displayLabels';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Trip in progress: Directions GPS→pickup then pickup→destination, with motion sim.
 */
export default function TripInProgressScreen({ navigation }) {
  const { trip, markPassengerOnBoard, completeTrip } = useActiveTrip();
  const [busy, setBusy] = useState(false);

  const onBoard = useCallback(async () => {
    setBusy(true);
    try {
      const result = await markPassengerOnBoard();
      if (!result?.ok) {
        Alert.alert(
          'Ruta',
          errorReasonLabel(
            result?.reason,
            'No se pudo obtener la ruta al destino.'
          )
        );
      }
    } finally {
      setBusy(false);
    }
  }, [markPassengerOnBoard]);

  const onFinish = useCallback(async () => {
    setBusy(true);
    try {
      const result = await completeTrip();
      if (!result?.ok) {
        Alert.alert(
          'Viaje',
          errorReasonLabel(
            result?.reason,
            'No se pudo finalizar el viaje.'
          )
        );
        return;
      }
      navigation.replace('TripSummary');
    } finally {
      setBusy(false);
    }
  }, [completeTrip, navigation]);

  const goingToPickup =
    trip?.status === 'accepted' || trip?.status === 'driver_arriving';
  const target = goingToPickup ? trip?.origin : trip?.destination;

  const roadCoordinates = useMemo(
    () => resolveRouteCoordinates(trip),
    [trip]
  );

  const durationMs = useMemo(() => {
    const minutes = Number(trip?.durationMin);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      return 45000;
    }
    return Math.min(90000, Math.max(25000, minutes * 2500));
  }, [trip?.durationMin]);

  if (!trip) {
    return (
      <View style={commonStyles.screen}>
        <Text style={commonStyles.muted}>Sin viaje activo</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.screen}>
      <TripRouteMap
        target={target}
        routeCoordinates={roadCoordinates}
        routePolyline={trip.routePolyline}
        targetTitle={goingToPickup ? 'Punto de recogida' : 'Destino'}
        simulationKey={`${trip.tripId}:${trip.status}:${trip.routePolyline ?? ''}`}
        durationMs={durationMs}
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
