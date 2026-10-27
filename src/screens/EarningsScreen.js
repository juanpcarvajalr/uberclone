// AI-assisted: see docs/AI_LOG.md #15
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useEarnings } from '../hooks/useEarnings';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #15 */}
      <Text style={styles.title}>{t(lang, 'earningsTitle')}</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo del conductor</Text>
        <Text style={styles.balanceValue}>${balance.toLocaleString('es-CO')}</Text>
        <Text style={styles.hint}>
          Pasarela − comisiones de efectivo (calculado desde trips)
        </Text>
      </View>

      <View style={styles.tabs}>
        {PERIODS.map((p) => (
          <Pressable
            key={p.key}
            style={[styles.tab, period === p.key && styles.tabActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>
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
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  balanceLabel: { color: '#BCCCDC', fontSize: 13 },
  balanceValue: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  hint: { color: '#9FB3C8', fontSize: 12, marginTop: 6 },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.accent },
  stat: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.textMuted },
  statValue: { color: colors.text, fontWeight: '700' },
  highlight: { color: colors.accent },
});
