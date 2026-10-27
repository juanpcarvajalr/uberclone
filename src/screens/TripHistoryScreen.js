// AI-assisted: see docs/AI_LOG.md #22, #27
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { parseISO, isSameDay, isSameWeek, isSameMonth, format } from 'date-fns';
import { MOCK_TRIPS } from '../mocks/trips';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

const PAYMENT_FILTERS = [
  { key: null, label: 'Pago' },
  { key: 'mercadopago', label: 'MP' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'cash', label: 'Efectivo' },
];

/**
 * Trip history FlatList with period and payment filters (mock data).
 */
export default function TripHistoryScreen({ navigation }) {
  const { driver } = useDriverSession();
  const lang = driver.language ?? 'es';
  const [period, setPeriod] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState(null);

  const data = useMemo(() => {
    const now = new Date();
    let list = [...MOCK_TRIPS].sort(
      (a, b) =>
        new Date(b.completedAt ?? b.createdAt) - new Date(a.completedAt ?? a.createdAt)
    );

    if (period === 'today') {
      list = list.filter((item) =>
        isSameDay(parseISO(item.completedAt ?? item.createdAt), now)
      );
    } else if (period === 'week') {
      list = list.filter((item) =>
        isSameWeek(parseISO(item.completedAt ?? item.createdAt), now, { weekStartsOn: 1 })
      );
    } else if (period === 'month') {
      list = list.filter((item) =>
        isSameMonth(parseISO(item.completedAt ?? item.createdAt), now)
      );
    }

    if (paymentMethod) {
      list = list.filter((item) => item.paymentMethod === paymentMethod);
    }

    return list.slice(0, 20);
  }, [period, paymentMethod]);

  return (
    <View style={[commonStyles.screen, styles.topPad]}>
      {/* AI-assisted: see docs/AI_LOG.md #22, #27 */}
      <Text style={[commonStyles.title, styles.titlePad]}>{t(lang, 'historyTitle')}</Text>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[commonStyles.chip, period === f.key && commonStyles.chipActive]}
            onPress={() => setPeriod(f.key)}
          >
            <Text style={commonStyles.chipText}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filters}>
        {PAYMENT_FILTERS.map((f) => (
          <Pressable
            key={String(f.key)}
            style={[commonStyles.chip, paymentMethod === f.key && commonStyles.chipActive]}
            onPress={() => setPaymentMethod(f.key)}
          >
            <Text style={commonStyles.chipText}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.tripId}
        contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <Text style={commonStyles.muted}>{t(lang, 'emptyHistory')}</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[commonStyles.card, styles.item]}
            onPress={() => navigation.navigate('TripDetail', { tripId: item.tripId })}
          >
            <Text style={commonStyles.caption}>
              {format(parseISO(item.completedAt ?? item.createdAt), 'dd/MM/yyyy HH:mm')}
            </Text>
            <Text style={styles.itemRoute}>
              {item.origin.address} → {item.destination.address}
            </Text>
            <View style={styles.itemFooter}>
              <Text style={commonStyles.caption}>{item.category}</Text>
              <Text style={commonStyles.caption}>${item.fare.toLocaleString('es-CO')}</Text>
              <Text style={styles.net}>${item.driverEarnings.toLocaleString('es-CO')}</Text>
              <Text style={commonStyles.caption}>{item.paymentStatus}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topPad: { paddingTop: spacing.md },
  titlePad: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: { padding: spacing.lg, gap: spacing.md },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },
  item: { marginBottom: spacing.md },
  itemRoute: { color: colors.text, fontWeight: '600', marginTop: spacing.xs },
  itemFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  net: { color: colors.accent, fontWeight: '700', fontSize: 12 },
});
