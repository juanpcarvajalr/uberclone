// AI-assisted: see docs/AI_LOG.md #22, #27, #50
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { isValid } from 'date-fns';
import { useDriverSession } from '../context/DriverSessionContext';
import { auth } from '../config/firebaseConfig';
import { fetchTripsByDriver } from '../services/tripsService';
import {
  categoryLabel,
  paymentStatusLabel,
} from '../utils/displayLabels';
import {
  formatTripDate,
  isSameAppDay,
  isSameAppMonth,
  isSameAppWeek,
  tripEventDate,
} from '../utils/tripDates';
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
  { key: 'cash', label: 'Efectivo' },
  { key: 'mercadopago', label: 'Mercado Pago' },
  { key: 'stripe', label: 'Stripe' },
];

/**
 * Trip history FlatList from Firestore trips.
 */
export default function TripHistoryScreen({ navigation }) {
  const { driver } = useDriverSession();
  const driverId = driver?.uid || auth.currentUser?.uid || null;
  const [period, setPeriod] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const list = driverId ? await fetchTripsByDriver(driverId) : [];
      setTrips(list);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTrips);
    return unsubscribe;
  }, [navigation, loadTrips]);

  const data = useMemo(() => {
    const now = new Date();
    let list = [...trips].sort(
      (a, b) => tripEventDate(b).getTime() - tripEventDate(a).getTime()
    );

    if (period === 'today') {
      list = list.filter((item) => {
        const date = tripEventDate(item);
        return isValid(date) && isSameAppDay(date, now);
      });
    } else if (period === 'week') {
      list = list.filter((item) => {
        const date = tripEventDate(item);
        return isValid(date) && isSameAppWeek(date, now);
      });
    } else if (period === 'month') {
      list = list.filter((item) => {
        const date = tripEventDate(item);
        return isValid(date) && isSameAppMonth(date, now);
      });
    }

    if (paymentMethod) {
      list = list.filter((item) => item.paymentMethod === paymentMethod);
    }

    return list.slice(0, 20);
  }, [trips, period, paymentMethod]);

  return (
    <View style={[commonStyles.screen, styles.topPad]}>
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
            style={[
              commonStyles.chip,
              paymentMethod === f.key && commonStyles.chipActive,
            ]}
            onPress={() => setPaymentMethod(f.key)}
          >
            <Text style={commonStyles.chipText}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.tripId}
          contentContainerStyle={
            data.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            <Text style={commonStyles.muted}>No hay viajes en este periodo</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[commonStyles.card, styles.item]}
              onPress={() =>
                navigation.navigate('TripDetail', { tripId: item.tripId })
              }
            >
              <Text style={commonStyles.caption}>{formatTripDate(item)}</Text>
              <Text style={styles.itemRoute}>
                {item.origin?.address} → {item.destination?.address}
              </Text>
              <View style={styles.itemFooter}>
                <Text style={commonStyles.caption}>
                  {categoryLabel(item.category)}
                </Text>
                <Text style={commonStyles.caption}>
                  ${(item.fare ?? 0).toLocaleString('es-CO')}
                </Text>
                <Text style={styles.net}>
                  ${(item.driverEarnings ?? 0).toLocaleString('es-CO')}
                </Text>
                <Text style={commonStyles.caption}>
                  {paymentStatusLabel(item.paymentStatus, item.status)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topPad: { paddingTop: spacing.md },
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
