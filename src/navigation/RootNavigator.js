import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDriverSession } from '../context/DriverSessionContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterNavigator from './RegisterNavigator';
import MainDrawer from './MainDrawer';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

/**
 * Root navigator: welcome/login, registration or main app.
 */
export default function RootNavigator() {
  const { isAuthenticated, hasCompletedRegistration, authReady } = useDriverSession();

  if (!authReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (isAuthenticated && hasCompletedRegistration) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  if (isAuthenticated && !hasCompletedRegistration) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Register" component={RegisterNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Register" component={RegisterNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
