// AI-assisted: see docs/AI_LOG.md #23, #27
import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { MOCK_TRIPS } from '../mocks/trips';
import { commonStyles } from '../theme/commonStyles';

/**
 * Trip detail with mock polyline representation.
 */
export default function TripDetailScreen({ route }) {
  const { tripId } = route.params ?? {};
  const trip = useMemo(
    () => MOCK_TRIPS.find((item) => item.tripId === tripId),
    [tripId]
  );

  if (!trip) {
    return (
      <View style={commonStyles.screen}>
        <Text style={commonStyles.muted}>Viaje no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #23, #27 */}
      <View style={commonStyles.mapStubCard}>
        <Text style={commonStyles.subtitle}>Ruta (Polyline mock)</Text>
        <Text style={commonStyles.caption}>{trip.routePolyline}</Text>
        <Text style={commonStyles.body}>A: {trip.origin.address}</Text>
        <Text style={commonStyles.body}>B: {trip.destination.address}</Text>
      </View>

      <Text style={commonStyles.title}>Detalle del viaje</Text>
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
    <View style={[commonStyles.card, commonStyles.row]}>
      <Text style={commonStyles.caption}>{label}</Text>
      <Text style={[commonStyles.body, { fontWeight: '600', maxWidth: '60%', textAlign: 'right' }]}>
        {value}
      </Text>
    </View>
  );
}
