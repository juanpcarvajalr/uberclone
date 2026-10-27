// AI-assisted: see docs/AI_LOG.md #12, #29
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { useDriverSession } from '../context/DriverSessionContext';
import { useActiveTrip } from '../context/ActiveTripContext';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { useTripRequests } from '../hooks/useTripRequests';
import { t } from '../i18n';
import { colors } from '../theme/colors';

/**
 * Home screen: mock map, availability toggle and request simulation.
 */
export default function HomeScreen({ navigation }) {
  const { driver, isAvailable, setAvailability } = useDriverSession();
  const { phase } = useActiveTrip();
  const { location, isTracking } = useDriverLocation();
  const { triggerMockRequest } = useTripRequests();
  const lang = driver.language ?? 'es';

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
    <View style={styles.container}>
      {/* AI-assisted: see docs/AI_LOG.md #12 */}
      <View style={styles.mapStub}>
        <Text style={styles.mapLabel}>Mapa (mock)</Text>
        <Text style={styles.coords}>
          {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </Text>
        <Text style={styles.tracking}>
          {isTracking ? 'GPS simulado activo' : 'GPS detenido'}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.greeting}>Hola, {driver.fullName.split(' ')[0]}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>
            {isAvailable ? t(lang, 'available') : t(lang, 'unavailable')}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </View>
        <Pressable
          style={[styles.button, !isAvailable && styles.buttonDisabled]}
          onPress={onSimulate}
          disabled={!isAvailable}
        >
          <Text style={styles.buttonText}>{t(lang, 'simulateRequest')}</Text>
        </Pressable>
        <Pressable style={styles.menuButton} onPress={onOpenMenu}>
          <Text style={styles.menuButtonText}>Abrir menú</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapStub: {
    flex: 1,
    backgroundColor: colors.mapStub,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: { fontSize: 18, fontWeight: '700', color: colors.primary },
  coords: { marginTop: 8, color: colors.text, fontVariant: ['tabular-nums'] },
  tracking: { marginTop: 4, color: colors.textMuted },
  panel: {
    backgroundColor: colors.surface,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { fontSize: 16, color: colors.text },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontWeight: '600' },
  menuButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuButtonText: { color: colors.primary, fontWeight: '600' },
});
