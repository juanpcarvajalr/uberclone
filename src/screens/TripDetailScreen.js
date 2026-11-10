// AI-assisted: see docs/AI_LOG.md #23, #27, #50
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { fetchTripById } from '../services/tripsService';
import { decodePolyline } from '../utils/decodePolyline';
import {
  categoryLabel,
  paymentMethodLabel,
  paymentStatusLabel,
} from '../utils/displayLabels';
import { formatTripDate } from '../utils/tripDates';
import { MAPS } from '../config/maps';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * Trip detail with Directions polyline from Firestore (Spec 11).
 */
export default function TripDetailScreen({ route }) {
  const { tripId } = route.params ?? {};
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const next = tripId ? await fetchTripById(tripId) : null;
        if (!cancelled) {
          setTrip(next);
        }
      } catch {
        if (!cancelled) {
          setTrip(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  const routeCoordinates = useMemo(() => {
    try {
      if (!trip?.routePolyline) {
        return [];
      }
      return decodePolyline(trip.routePolyline);
    } catch {
      return [];
    }
  }, [trip?.routePolyline]);

  if (loading) {
    return (
      <View style={[commonStyles.screen, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={commonStyles.screen}>
        <Text style={commonStyles.muted}>Viaje no encontrado</Text>
      </View>
    );
  }

  const originCoord = {
    latitude: Number(trip.origin?.lat) || 0,
    longitude: Number(trip.origin?.lng) || 0,
  };
  const destinationCoord = {
    latitude: Number(trip.destination?.lat) || 0,
    longitude: Number(trip.destination?.lng) || 0,
  };

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      <View style={styles.mapCard}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            ...originCoord,
            ...MAPS.defaultDelta,
          }}
          toolbarEnabled={false}
          googleRenderer="LATEST"
        >
          <Marker coordinate={originCoord} title="Origen" />
          <Marker coordinate={destinationCoord} title="Destino" />
          {routeCoordinates.length > 1 ? (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={4}
            />
          ) : null}
        </MapView>
      </View>

      <Text style={commonStyles.title}>Detalle del viaje</Text>
      <Detail label="Fecha" value={formatTripDate(trip)} />
      <Detail label="Duración" value={`${trip.durationMin} min`} />
      <Detail label="Distancia" value={`${trip.distanceKm} km`} />
      <Detail label="Categoría" value={categoryLabel(trip.category)} />
      <Detail label="Tarifa" value={`$${(trip.fare ?? 0).toLocaleString('es-CO')}`} />
      <Detail
        label="Comisión"
        value={`$${(trip.commission ?? 0).toLocaleString('es-CO')}`}
      />
      <Detail label="Propina" value={`$${(trip.tip ?? 0).toLocaleString('es-CO')}`} />
      <Detail
        label="Ganancia neta"
        value={`$${(trip.driverEarnings ?? 0).toLocaleString('es-CO')}`}
      />
      <Detail
        label="Pago"
        value={`${paymentMethodLabel(trip.paymentMethod)} · ${paymentStatusLabel(trip.paymentStatus, trip.status)}`}
      />
      <Detail label="Calificación" value={String(trip.rating ?? '—')} />
    </ScrollView>
  );
}

/**
 * @param {{ label: string, value: string }} props
 */
function Detail({ label, value }) {
  return (
    <View style={[commonStyles.card, commonStyles.row]}>
      <Text style={commonStyles.caption}>{label}</Text>
      <Text
        style={[
          commonStyles.body,
          { fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: 'center', alignItems: 'center' },
  mapCard: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.mapStub,
  },
  map: { flex: 1 },
});
