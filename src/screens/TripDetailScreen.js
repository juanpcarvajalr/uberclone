// AI-assisted: see docs/AI_LOG.md #23
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { MOCK_TRIPS } from '../mocks/trips';
import { colors } from '../theme/colors';

/**
 * Trip detail with mock polyline representation.
 */
export default function TripDetailScreen({ route }) {
  const { tripId } = route.params ?? {};
  const trip = useMemo(
    () => MOCK_TRIPS.find((t) => t.tripId === tripId),
    [tripId]
  );

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Viaje no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #23 */}
      <View style={styles.mapStub}>
        <Text style={styles.mapTitle}>Ruta (Polyline mock)</Text>
        <Text style={styles.poly}>{trip.routePolyline}</Text>
        <Text style={styles.point}>A: {trip.origin.address}</Text>
        <Text style={styles.point}>B: {trip.destination.address}</Text>
      </View>

      <Text style={styles.heading}>Detalle del viaje</Text>
      <Detail
        label="Fecha"
        value={format(parseISO(trip.completedAt ?? trip.createdAt), 'dd/MM/yyyy HH:mm')}
      />
      <Detail label="Duración" value={`${trip.durationMin} min`} />
      <Detail label="Distancia" value={`${trip.distanceKm} km`} />
      <Detail label="Categoría" value={trip.category} />
      <Detail label="Tarifa" value={`$${trip.fare.toLocaleString('es-CO')}`} />
      <Detail label="Comisión" value={`$${trip.commission.toLocaleString('es-CO')}`} />
      <Detail label="Propina" value={`$${(trip.tip ?? 0).toLocaleString('es-CO')}`} />
      <Detail
        label="Ganancia neta"
        value={`$${trip.driverEarnings.toLocaleString('es-CO')}`}
      />
      <Detail label="Pago" value={`${trip.paymentMethod} · ${trip.paymentStatus}`} />
      <Detail label="Calificación" value={String(trip.rating ?? '—')} />
    </ScrollView>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 8 },
  mapStub: {
    backgroundColor: colors.mapStub,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    minHeight: 160,
    justifyContent: 'center',
  },
  mapTitle: { fontWeight: '700', color: colors.primary, marginBottom: 8 },
  poly: { color: colors.textMuted, fontSize: 12, marginBottom: 8 },
  point: { color: colors.text, marginTop: 4 },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.textMuted },
  value: { color: colors.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  muted: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
});
