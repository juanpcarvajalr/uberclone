import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import DriverMap from '../components/DriverMap';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * Home screen: map, availability toggle and request simulation.
 */
export default function HomeScreen({ navigation }) {
  const { driver, isAvailable, setAvailability } = useDriverSession();
  const { phase } = useActiveTrip();
  const { location, isTracking, hasPermission, hasRealFix } = useDriverLocation();
  const { triggerMockRequest } = useTripRequests();

  const onToggle = useCallback(
    async (value) => {
      const result = await setAvailability(value);
      if (!result.ok) {
        Alert.alert(
          'Cuenta pendiente',
          'No puedes ponerte Disponible hasta que accountStatus sea approved.'
        );
      }
    },
    [setAvailability]
  );

  const onSimulate = useCallback(() => {
    const ok = triggerMockRequest();
    if (ok) {
      navigation.navigate('IncomingRequest');
      return;
    }
    Alert.alert('No disponible', 'Activa Disponible y no tengas un viaje activo.');
  }, [triggerMockRequest, navigation]);

  const onOpenMenu = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  React.useEffect(() => {
    if (phase === 'incoming') {
      navigation.navigate('IncomingRequest');
    } else if (phase === 'active') {
      navigation.navigate('TripInProgress');
    } else if (phase === 'summary') {
      navigation.navigate('TripSummary');
    }
  }, [phase, navigation]);

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
        <Pressable
          style={[commonStyles.primaryButton, !isAvailable && commonStyles.buttonDisabled]}
          onPress={onSimulate}
          disabled={!isAvailable}
        >
          <Text style={commonStyles.primaryButtonText}>Simular solicitud</Text>
        </Pressable>
        <Pressable style={commonStyles.outlineButton} onPress={onOpenMenu}>
          <Text style={commonStyles.outlineButtonText}>Abrir menú</Text>
        </Pressable>
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
});
