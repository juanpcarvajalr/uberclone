// AI-assisted: see docs/AI_LOG.md #46, #50
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouteSimulation } from '../hooks/useRouteSimulation';
import { resolveRouteCoordinates } from '../utils/routeCoordinates';
import { MAPS } from '../config/maps';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Map for an active trip: road polyline from Directions + simulated vehicle motion.
 * @param {{
 *   target: { lat: number, lng: number, address?: string },
 *   routeCoordinates?: { latitude: number, longitude: number }[] | null,
 *   routePolyline?: string | null,
 *   targetTitle?: string,
 *   simulationKey?: string|number|null,
 *   durationMs?: number,
 * }} props
 */
export default function TripRouteMap({
  target,
  routeCoordinates = null,
  routePolyline = null,
  targetTitle = 'Destino',
  simulationKey = null,
  durationMs = 45000,
}) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [tracksVehicle, setTracksVehicle] = useState(true);

  const roadCoordinates = useMemo(
    () =>
      resolveRouteCoordinates({
        routeCoordinates,
        routePolyline,
      }),
    [routeCoordinates, routePolyline]
  );

  const { position: vehiclePosition, heading } = useRouteSimulation(
    roadCoordinates,
    {
      playing: Boolean(roadCoordinates && roadCoordinates.length > 1),
      durationMs,
      resetKey: simulationKey ?? `${routePolyline ?? ''}:${roadCoordinates?.length ?? 0}`,
    }
  );

  const targetCoord = useMemo(
    () => ({
      latitude: Number(target?.lat) || 0,
      longitude: Number(target?.lng) || 0,
    }),
    [target]
  );

  const initialCoord = useMemo(() => {
    if (roadCoordinates?.[0]) {
      return roadCoordinates[0];
    }
    return targetCoord;
  }, [roadCoordinates, targetCoord]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !roadCoordinates || roadCoordinates.length < 2) {
      return undefined;
    }
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(roadCoordinates, {
        edgePadding: { top: 56, right: 48, bottom: 56, left: 48 },
        animated: true,
      });
    }, 120);
    return () => clearTimeout(timer);
  }, [mapReady, roadCoordinates]);

  useEffect(() => {
    setTracksVehicle(true);
    const timer = setTimeout(() => setTracksVehicle(false), 700);
    return () => clearTimeout(timer);
  }, [simulationKey, routePolyline]);

  const lastCameraAtRef = useRef(0);
  useEffect(() => {
    if (!mapReady || !mapRef.current || !vehiclePosition) {
      return undefined;
    }
    const now = Date.now();
    if (now - lastCameraAtRef.current < 400) {
      return undefined;
    }
    lastCameraAtRef.current = now;
    mapRef.current.animateCamera(
      {
        center: vehiclePosition,
        heading,
        pitch: 0,
        zoom: 15,
      },
      { duration: 350 }
    );
    return undefined;
  }, [mapReady, vehiclePosition, heading]);

  if (!roadCoordinates || roadCoordinates.length < 2) {
    return (
      <View style={[styles.container, styles.centered]} collapsable={false}>
        <Text style={commonStyles.muted}>
          Esperando ruta por vías (Directions)…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} collapsable={false}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...initialCoord,
          ...MAPS.defaultDelta,
        }}
        onMapReady={() => setMapReady(true)}
        loadingEnabled
        toolbarEnabled={false}
        googleRenderer="LATEST"
      >
        <Polyline
          coordinates={roadCoordinates}
          strokeColor={colors.primary}
          strokeWidth={5}
        />
        <Marker
          coordinate={targetCoord}
          title={targetTitle}
          description={target?.address}
        />
        {vehiclePosition ? (
          <Marker
            coordinate={vehiclePosition}
            title="Vehículo"
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksVehicle}
          >
            <View style={styles.vehicleRing}>
              <View style={styles.vehicleCore} />
            </View>
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 240,
    backgroundColor: colors.mapStub,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  map: {
    flex: 1,
    width: '100%',
    minHeight: 240,
  },
  vehicleRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  vehicleCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
});
