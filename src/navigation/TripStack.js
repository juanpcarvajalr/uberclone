// AI-assisted: see docs/AI_LOG.md #18, #29, #50, #58
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import IncomingRequestScreen from '../screens/IncomingRequestScreen';
import TripInProgressScreen from '../screens/TripInProgressScreen';
import TripSummaryScreen from '../screens/TripSummaryScreen';
import MercadoPagoCheckoutScreen from '../screens/MercadoPagoCheckoutScreen';
import { headerScreenOptions } from '../theme/navigationTheme';

const Stack = createNativeStackNavigator();

/**
 * Trip flow stack: Home → Incoming → InProgress → Summary.
 */
export default function TripStack() {
  return (
    <Stack.Navigator screenOptions={headerScreenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen
        name="IncomingRequest"
        component={IncomingRequestScreen}
        options={{ title: 'Solicitud', headerBackVisible: false }}
      />
      <Stack.Screen
        name="TripInProgress"
        component={TripInProgressScreen}
        options={{ title: 'Viaje', headerBackVisible: false }}
      />
      <Stack.Screen
        name="TripSummary"
        component={TripSummaryScreen}
        options={{ title: 'Resumen', headerBackVisible: false }}
      />
      <Stack.Screen
        name="MercadoPagoCheckout"
        component={MercadoPagoCheckoutScreen}
        options={{ title: 'Mercado Pago' }}
      />
    </Stack.Navigator>
  );
}
