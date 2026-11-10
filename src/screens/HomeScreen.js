// AI-assisted: see docs/AI_LOG.md #16, #42, #50
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import DriverMap from '../components/DriverMap';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * Home screen: map and availability toggle.
 */
export default function HomeScreen({ navigation }) {
  const {
    driver,
    isAvailable,
    setAvailability,
    location,
    hasLocationPermission,
    hasRealFix,
  } = useDriverSession();
  const { phase } = useActiveTrip();
  const isFocused = useIsFocused();
  const isTracking = isAvailable;
  const hasPermission = hasLocationPermission;

  const onToggle = useCallback(
    async (value) => {
      const result = await setAvailability(value);
      if (!result.ok) {
        Alert.alert(
          'Cuenta pendiente',
          'No puedes ponerte Disponible hasta que la cuenta esté aprobada.'
        );
      }
    },
    [setAvailability]
  );

  React.useEffect(() => {
    if (!isFocused) {
      return undefined;
    }
    if (phase === 'incoming') {
      navigation.navigate('IncomingRequest');
    } else if (phase === 'active') {
      navigation.navigate('TripInProgress');
    } else if (phase === 'summary') {
      navigation.navigate('TripSummary');
    }
    return undefined;
  }, [phase, navigation, isFocused]);

  return (
    <View style={commonStyles.screen}>
      <DriverMap
        location={location}
        isTracking={isTracking}
        showDeviceLocation={hasPermission}
      />

      <View style={commonStyles.panel}>
        <Text style={commonStyles.title}>Hola, {driver.fullName.split(' ')[0]}</Text>
        <Text style={styles.coords}>
          {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </Text>
        <Text style={[commonStyles.caption, styles.tracking]}>
          {hasRealFix
            ? isTracking
              ? 'Seguimiento GPS activo'
              : 'Ubicación GPS obtenida'
            : hasPermission
              ? 'Esperando GPS del emulador…'
              : 'Sin permiso de ubicación'}
        </Text>
        <View style={commonStyles.row}>
          <Text style={commonStyles.body}>
            {isAvailable ? 'Disponible' : 'No disponible'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </View>
        <Text style={[commonStyles.caption, styles.hint]}>
          Las solicitudes llegan con el script request-trip (misma categoría). Usa
          el menú inferior para Ganancias, Historial y Perfil.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coords: {
    marginTop: spacing.sm,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  tracking: { marginTop: spacing.xs },
  hint: { marginTop: spacing.md, marginBottom: spacing.sm },
});
