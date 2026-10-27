// AI-assisted: see docs/AI_LOG.md #29
import { colors } from './colors';
import { typography } from './tokens';

export const headerScreenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.onPrimary,
  headerTitleStyle: { ...typography.bodyStrong, color: colors.onPrimary },
};

export const registerTabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarShowIcon: true,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 58,
    paddingTop: 4,
    paddingBottom: 6,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
  },
};
