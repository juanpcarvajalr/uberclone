// AI-assisted: see docs/AI_LOG.md #58, #60, #62
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { PAYMENT_RETURN_URL } from '../config/payments';
import { verifyMercadoPagoPayment } from '../services/paymentsService';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Opens Mercado Pago Checkout Pro and verifies payment on return.
 */
export default function MercadoPagoCheckoutScreen({ navigation, route }) {
  const checkoutUrl = route.params?.checkoutUrl;
  const tripId = route.params?.tripId;
  const orderId = route.params?.orderId ?? null;
  const [busy, setBusy] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const settlingRef = useRef(false);

  const settlePayment = useCallback(async () => {
    if (!tripId || settlingRef.current) {
      return;
    }
    settlingRef.current = true;
    setBusy(true);
    try {
      const result = await verifyMercadoPagoPayment({ tripId, orderId });
      if (result?.paymentStatus === 'approved') {
        Alert.alert('Pago', 'El pago fue aprobado.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      if (result?.paymentStatus === 'rejected') {
        setShowVerifyButton(false);
        Alert.alert('Pago', 'El pago fue rechazado.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }
      setShowVerifyButton(true);
      Alert.alert(
        'Pago',
        'El pago sigue pendiente. Puedes verificar de nuevo en unos segundos.'
      );
    } catch (error) {
      setShowVerifyButton(true);
      Alert.alert(
        'Pago',
        error instanceof Error ? error.message : 'No se pudo verificar el pago.'
      );
    } finally {
      setBusy(false);
      settlingRef.current = false;
    }
  }, [tripId, orderId, navigation]);

  const onShouldStartLoadWithRequest = useCallback(
    (request) => {
      const url = String(request?.url ?? '');
      if (url.startsWith(PAYMENT_RETURN_URL)) {
        settlePayment();
        return false;
      }
      return true;
    },
    [settlePayment]
  );

  if (!checkoutUrl || !tripId) {
    return (
      <View style={[commonStyles.screenPadded, { justifyContent: 'center' }]}>
        <Text style={commonStyles.muted}>Checkout no disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: checkoutUrl }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}
      />
      {showVerifyButton ? (
        <View style={styles.footer}>
          <Pressable
            style={commonStyles.primaryButton}
            onPress={settlePayment}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Verificar pago</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
