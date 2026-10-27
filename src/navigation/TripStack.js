// AI-assisted: see docs/AI_LOG.md #18, #29
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import IncomingRequestScreen from '../screens/IncomingRequestScreen';
import TripInProgressScreen from '../screens/TripInProgressScreen';
import TripSummaryScreen from '../screens/TripSummaryScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

/**
 * Opens the parent drawer from a nested stack screen.
 * @param {object} navigation
 */
function openDrawer(navigation) {
  navigation.dispatch(DrawerActions.openDrawer());
}

/**
 * Trip flow stack: Home → Incoming → InProgress → Summary.
 */
export default function TripStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Inicio',
          headerLeft: () => (
            <Pressable
              onPress={() => openDrawer(navigation)}
              style={styles.menuBtn}
              accessibilityRole="button"
              accessibilityLabel="Abrir menú"
            >
              <Text style={styles.menuIcon}>☰</Text>
            </Pressable>
          ),
        })}
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
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  menuBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  menuIcon: { color: '#fff', fontSize: 22, fontWeight: '700' },
});
