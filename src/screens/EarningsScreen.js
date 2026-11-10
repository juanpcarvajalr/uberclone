// AI-assisted: see docs/AI_LOG.md #15, #27, #50
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEarnings } from '../hooks/useEarnings';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

/**
 * Earnings dashboard from Firestore paid trips (Spec 10).
 */
export default function EarningsScreen() {
  const navigation = useNavigation();
  const { today, week, month, balance, loading, refresh } = useEarnings();
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refresh);
    return unsubscribe;
  }, [navigation, refresh]);

  const summary = period === 'today' ? today : period === 'week' ? week : month;

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      <Text style={commonStyles.title}>Ganancias</Text>
      {loading ? (
        <Text style={commonStyles.muted}>Cargando viajes…</Text>
      ) : null}

      <View style={commonStyles.balanceCard}>
        <Text style={commonStyles.balanceLabel}>Saldo del conductor</Text>
        <Text style={commonStyles.balanceValue}>${balance.toLocaleString('es-CO')}</Text>
        <Text style={styles.hint}>
          Ganancias por pasarela menos comisiones de viajes en efectivo
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
