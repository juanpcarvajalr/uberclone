// AI-assisted: see docs/AI_LOG.md #18
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { DriverSessionProvider } from './src/context/DriverSessionContext';
import { ActiveTripProvider } from './src/context/ActiveTripContext';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * App entry: providers + root navigation (mock data mode).
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DriverSessionProvider>
          <ActiveTripProvider>
            <RootNavigator />
            <StatusBar style="light" />
          </ActiveTripProvider>
        </DriverSessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
