// AI-assisted: see docs/AI_LOG.md #22
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { parseISO, isSameDay, isSameWeek, isSameMonth, format } from 'date-fns';
import { MOCK_TRIPS } from '../mocks/trips';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';

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
      list = list.filter((t) => isSameDay(parseISO(t.completedAt ?? t.createdAt), now));
    } else if (period === 'week') {
      list = list.filter((t) =>
        isSameWeek(parseISO(t.completedAt ?? t.createdAt), now, { weekStartsOn: 1 })
      );
    } else if (period === 'month') {
      list = list.filter((t) =>
        isSameMonth(parseISO(t.completedAt ?? t.createdAt), now)
      );
    }

    if (paymentMethod) {
      list = list.filter((t) => t.paymentMethod === paymentMethod);
    }

    return list.slice(0, 20);
  }, [period, paymentMethod]);

  return (
    <View style={styles.container}>
      {/* AI-assisted: see docs/AI_LOG.md #22 */}
      <Text style={styles.title}>{t(lang, 'historyTitle')}</Text>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.chip, period === f.key && styles.chipActive]}
            onPress={() => setPeriod(f.key)}
          >
            <Text style={styles.chipText}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filters}>
        {PAYMENT_FILTERS.map((f) => (
          <Pressable
            key={String(f.key)}
            style={[styles.chip, paymentMethod === f.key && styles.chipActive]}
            onPress={() => setPaymentMethod(f.key)}
          >
            <Text style={styles.chipText}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.tripId}
        contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{t(lang, 'emptyHistory')}</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() => navigation.navigate('TripDetail', { tripId: item.tripId })}
          >
            <Text style={styles.itemDate}>
              {format(parseISO(item.completedAt ?? item.createdAt), 'dd/MM/yyyy HH:mm')}
            </Text>
            <Text style={styles.itemRoute}>
              {item.origin.address} → {item.destination.address}
            </Text>
            <View style={styles.itemFooter}>
              <Text style={styles.meta}>{item.category}</Text>
              <Text style={styles.meta}>${item.fare.toLocaleString('es-CO')}</Text>
              <Text style={styles.net}>
                ${item.driverEarnings.toLocaleString('es-CO')}
              </Text>
              <Text style={styles.meta}>{item.paymentStatus}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 12 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  empty: { textAlign: 'center', color: colors.textMuted, fontSize: 16 },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemDate: { color: colors.textMuted, fontSize: 12 },
  itemRoute: { color: colors.text, fontWeight: '600', marginTop: 4 },
  itemFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  meta: { color: colors.textMuted, fontSize: 12 },
  net: { color: colors.accent, fontWeight: '700', fontSize: 12 },
});
