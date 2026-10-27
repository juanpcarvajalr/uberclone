// AI-assisted: see docs/AI_LOG.md #26, #27
import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { radii, spacing, typography } from './tokens';

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.primary,
  },
  body: {
    ...typography.body,
    color: colors.text,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  panel: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.md,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  mapStub: {
    flex: 1,
    backgroundColor: colors.mapStub,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  mapStubCard: {
    backgroundColor: colors.mapStub,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    minHeight: 160,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  secondaryButton: {
    backgroundColor: colors.accentMuted,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  outlineButton: {
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineButtonText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  accentButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  fieldError: {
    ...typography.caption,
    color: colors.danger,
  },
  infoBanner: {
    color: colors.text,
    backgroundColor: colors.accentMuted,
    padding: spacing.md,
    borderRadius: radii.sm,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    color: colors.textOnPrimaryMuted,
    fontSize: 13,
  },
  balanceValue: {
    ...typography.balance,
    color: colors.onPrimary,
    marginTop: spacing.xs,
  },
  timer: {
    ...typography.timer,
    color: colors.warning,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
