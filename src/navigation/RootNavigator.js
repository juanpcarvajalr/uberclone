// AI-assisted: see docs/AI_LOG.md #18
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDriverSession } from '../context/DriverSessionContext';
import RegisterNavigator from './RegisterNavigator';
import MainDrawer from './MainDrawer';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

/**
 * Root navigator: registration vs main app based on Auth + Firestore profile.
 */
export default function RootNavigator() {
  const { isAuthenticated, hasCompletedRegistration, authReady } = useDriverSession();
  const showRegister = !isAuthenticated || !hasCompletedRegistration;

  if (!authReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
