// AI-assisted: see docs/AI_LOG.md #18
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TripStack from './TripStack';
import EarningsScreen from '../screens/EarningsScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

/**
 * Drawer: trip flow, earnings, history, profile.
 */
export default function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        drawerActiveTintColor: colors.accent,
      }}
    >
      <Drawer.Screen
        name="TripFlow"
        component={TripStack}
        options={{ title: 'Inicio', headerShown: false }}
      />
      <Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Ganancias' }}
      />
      <Drawer.Screen
        name="History"
        component={TripHistoryScreen}
        options={{ title: 'Historial' }}
      />
      <Drawer.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          title: 'Detalle del viaje',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileSettingsScreen}
        options={{ title: 'Perfil y configuración' }}
      />
    </Drawer.Navigator>
  );
}
