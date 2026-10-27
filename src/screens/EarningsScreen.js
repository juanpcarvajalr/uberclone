// AI-assisted: see docs/AI_LOG.md #15, #27
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useEarnings } from '../hooks/useEarnings';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

/**
 * Earnings dashboard over mock trips (today / week / month + balance).
 */
export default function EarningsScreen() {
  const { driver } = useDriverSession();
  const { today, week, month, balance } = useEarnings();
  const [period, setPeriod] = useState('today');
  const lang = driver.language ?? 'es';

  const summary = period === 'today' ? today : period === 'week' ? week : month;

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #15, #27 */}
      <Text style={commonStyles.title}>{t(lang, 'earningsTitle')}</Text>

      <View style={commonStyles.balanceCard}>
        <Text style={commonStyles.balanceLabel}>Saldo del conductor</Text>
        <Text style={commonStyles.balanceValue}>${balance.toLocaleString('es-CO')}</Text>
        <Text style={styles.hint}>
          Pasarela − comisiones de efectivo (calculado desde trips)
        </Text>
      </View>

      <View style={styles.tabs}>
        {PERIODS.map((p) => (
          <Pressable
            key={p.key}
            style={[styles.tab, period === p.key && commonStyles.chipActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text
              style={[
                styles.tabText,
                period === p.key && styles.tabTextActive,
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Stat label="Viajes" value={String(summary.tripCount)} />
      <Stat label="Total facturado" value={`$${summary.totalBilled.toLocaleString('es-CO')}`} />
      <Stat
        label="Comisiones"
        value={`$${summary.totalCommissions.toLocaleString('es-CO')}`}
      />
      <Stat label="Propinas" value={`$${summary.totalTips.toLocaleString('es-CO')}`} />
      <Stat
        label="Ganancia neta"
        value={`$${summary.netEarnings.toLocaleString('es-CO')}`}
        highlight
      />
      <Stat
        label="Promedio por viaje"
        value={`$${summary.averagePerTrip.toLocaleString('es-CO')}`}
      />
    </ScrollView>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <View style={[commonStyles.card, styles.stat]}>
      <Text style={commonStyles.caption}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.textOnPrimaryMuted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.accent },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontWeight: '700' },
  highlight: { color: colors.accent },
});
