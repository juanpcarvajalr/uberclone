// AI-assisted: see docs/AI_LOG.md #46
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MAPS } from '../config/maps';
import { colors } from '../theme/colors';

/**
 * Map for an active trip: driver, target place and Directions polyline.
 * @param {{
 *   driverLocation: { lat: number, lng: number },
 *   target: { lat: number, lng: number, address?: string },
 *   routeCoordinates?: { latitude: number, longitude: number }[] | null,
 *   targetTitle?: string,
 * }} props
 */
export default function TripRouteMap({
  driverLocation,
  target,
  routeCoordinates = null,
  targetTitle = 'Destino',
}) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const driverCoord = useMemo(
    () => ({
      latitude: Number(driverLocation?.lat) || 0,
      longitude: Number(driverLocation?.lng) || 0,
    }),
    [driverLocation]
  );

  const targetCoord = useMemo(
    () => ({
      latitude: Number(target?.lat) || 0,
      longitude: Number(target?.lng) || 0,
    }),
    [target]
  );

  const coordinates = useMemo(() => {
    if (Array.isArray(routeCoordinates) && routeCoordinates.length > 1) {
      return routeCoordinates;
    }
    return [driverCoord, targetCoord];
  }, [routeCoordinates, driverCoord, targetCoord]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || coordinates.length < 2) {
      return undefined;
    }
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
        animated: true,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [mapReady, coordinates]);

  return (
    <View style={styles.container} collapsable={false}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...driverCoord,
          ...MAPS.defaultDelta,
        }}
        onMapReady={() => setMapReady(true)}
        loadingEnabled
        toolbarEnabled={false}
        googleRenderer="LATEST"
      >
        <Marker coordinate={driverCoord} title="Conductor" pinColor={colors.accent} />
        <Marker
          coordinate={targetCoord}
          title={targetTitle}
          description={target?.address}
        />
        <Polyline
          coordinates={coordinates}
          strokeColor={colors.primary}
          strokeWidth={4}
        />
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
  map: {
    flex: 1,
    width: '100%',
    minHeight: 240,
  },
});
