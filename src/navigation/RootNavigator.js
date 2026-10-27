// AI-assisted: see docs/AI_LOG.md #18
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDriverSession } from '../context/DriverSessionContext';
import RegisterNavigator from './RegisterNavigator';
import MainDrawer from './MainDrawer';

const Stack = createNativeStackNavigator();

/**
 * Root navigator: registration vs main app based on mock session flags.
 */
export default function RootNavigator() {
  const { isAuthenticated, hasCompletedRegistration } = useDriverSession();
  const showRegister = !isAuthenticated || !hasCompletedRegistration;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showRegister ? (
          <Stack.Screen name="Register" component={RegisterNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
