// AI-assisted: see docs/AI_LOG.md #18
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
      <DriverSessionProvider>
        <ActiveTripProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </ActiveTripProvider>
      </DriverSessionProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
