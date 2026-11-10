// AI-assisted: see docs/AI_LOG.md #50
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import { headerScreenOptions } from '../theme/navigationTheme';

const Stack = createNativeStackNavigator();

/**
 * History list + trip detail with native back button.
 */
export default function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={headerScreenOptions}>
      <Stack.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{ title: 'Historial' }}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          title: 'Detalle del viaje',
          headerBackTitle: 'Historial',
        }}
      />
    </Stack.Navigator>
  );
}
