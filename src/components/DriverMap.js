// AI-assisted: see docs/AI_LOG.md #42
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MAPS } from '../config/maps';
import { colors } from '../theme/colors';

/**
 * Driver home map centered on the current location (Google Maps / react-native-maps).
 * @param {{
 *   location: { lat: number, lng: number },
 *   isTracking?: boolean,
 *   showDeviceLocation?: boolean,
 * }} props
 */
export default function DriverMap({
  location,
  isTracking = false,
  showDeviceLocation = false,
}) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const latitude = Number(location?.lat) || 6.2442;
  const longitude = Number(location?.lng) || -75.5812;

  const region = useMemo(
    () => ({
      latitude,
      longitude,
      ...MAPS.defaultDelta,
    }),
    [latitude, longitude]
  );

  useEffect(() => {
    if (!mapReady) return undefined;
    const timer = setTimeout(() => {
      mapRef.current?.animateToRegion(region, 400);
    }, 100);
    return () => clearTimeout(timer);
  }, [mapReady, region]);

  return (
    <View style={styles.container} collapsable={false}>
      {/* AI-assisted: see docs/AI_LOG.md #42 */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={showDeviceLocation}
        showsMyLocationButton={showDeviceLocation}
        loadingEnabled
        loadingIndicatorColor={colors.accent}
        moveOnMarkerPress={false}
        toolbarEnabled={false}
        googleRenderer="LATEST"
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Tu ubicación"
          description={isTracking ? 'En seguimiento' : 'Ubicación actual'}
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
