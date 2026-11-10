// AI-assisted: see docs/AI_LOG.md #50
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TripStack from './TripStack';
import HistoryStack from './HistoryStack';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import { colors } from '../theme/colors';
import { headerScreenOptions } from '../theme/navigationTheme';

const Tab = createBottomTabNavigator();

/**
 * @param {string} routeName
 * @param {boolean} focused
 * @returns {keyof typeof Ionicons.glyphMap}
 */
function iconName(routeName, focused) {
  if (routeName === 'TripFlow') {
    return focused ? 'home' : 'home-outline';
  }
  if (routeName === 'Earnings') {
    return focused ? 'cash' : 'cash-outline';
  }
  if (routeName === 'History') {
    return focused ? 'time' : 'time-outline';
  }
  return focused ? 'person' : 'person-outline';
}

/**
 * Bottom tabs: inicio, ganancias, historial, perfil.
 */
export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerScreenOptions,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={iconName(route.name, focused)}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="TripFlow"
        component={TripStack}
        options={{ title: 'Inicio', headerShown: false }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Ganancias' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{ title: 'Historial', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileSettingsScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
