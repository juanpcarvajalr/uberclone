// AI-assisted: see docs/AI_LOG.md #18, #24, #27, #29, #30
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PersonalDataTab, { isPersonalTabValid } from '../screens/register/PersonalDataTab';
import VehicleTab, { isVehicleTabValid } from '../screens/register/VehicleTab';
import DocumentsTab, { isDocumentsTabValid } from '../screens/register/DocumentsTab';
import { useDriverSession } from '../context/DriverSessionContext';
import { registerDriver } from '../services/registerDriver';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { registerTabScreenOptions } from '../theme/navigationTheme';
import { spacing } from '../theme/tokens';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Personal: 'person-outline',
  Vehicle: 'car-outline',
  Documents: 'document-text-outline',
};

const initialPersonal = {
  fullName: '',
  documentNumber: '',
  phone: '',
  birthDate: '1995-01-15',
  gender: '',
  email: '',
  password: '',
  profilePhotoUri: null,
};

const initialVehicle = {
  category: 'economy',
  plate: '',
  brand: '',
  model: '',
  year: '2022',
  registrationDate: '2023-02-10',
  color: '',
  passengerCapacity: '4',
  vehiclePhotoUri: null,
};

const initialDocuments = {
  licenseNumber: '',
  licenseExpiresAt: '2028-01-01',
  soatExpiresAt: '2027-06-01',
  inspectionExpiresAt: '2027-06-01',
  mercadoPagoEmail: '',
  termsAccepted: false,
  licensePhotoUri: null,
  soatPhotoUri: null,
  inspectionPhotoUri: null,
};

/**
 * Registration tabs with shared form state and Firebase submit.
 */
export default function RegisterNavigator() {
  const insets = useSafeAreaInsets();
  const { applyRegistrationResult } = useDriverSession();
  const [personal, setPersonal] = useState(initialPersonal);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [documents, setDocuments] = useState(initialDocuments);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const onPersonal = useCallback((key, value) => {
    setPersonal((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onVehicle = useCallback((key, value) => {
    setVehicle((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onDocuments = useCallback((key, value) => {
    setDocuments((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canSubmit = useMemo(
    () =>
      isPersonalTabValid(personal) &&
      isVehicleTabValid(vehicle) &&
      isDocumentsTabValid(documents, vehicle.registrationDate),
    [personal, vehicle, documents]
  );

  const onSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await registerDriver({ personal, vehicle, documents });
      applyRegistrationResult(result);
    } catch (error) {
      const message =
        error?.code === 'auth/email-already-in-use'
          ? 'Ese correo ya está registrado'
          : error?.message ?? 'No se pudo completar el registro';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, personal, vehicle, documents, applyRegistrationResult]);

  return (
    <View style={styles.root}>
      {/* AI-assisted: see docs/AI_LOG.md #30 */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, spacing.sm) + spacing.sm },
        ]}
      >
        <Text style={styles.headerTitle}>Registro del conductor</Text>
        <Text style={styles.headerSubtitle}>Completa las tres pestañas para enviar</Text>
      </View>

      <View style={commonStyles.screen}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            ...registerTabScreenOptions,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={TAB_ICONS[route.name] ?? 'ellipse-outline'}
                size={size ?? 22}
                color={color}
              />
            ),
          })}
        >
          <Tab.Screen name="Personal" options={{ title: 'Datos' }}>
            {() => <PersonalDataTab values={personal} onChange={onPersonal} />}
          </Tab.Screen>
          <Tab.Screen name="Vehicle" options={{ title: 'Vehículo' }}>
            {() => <VehicleTab values={vehicle} onChange={onVehicle} />}
          </Tab.Screen>
          <Tab.Screen name="Documents" options={{ title: 'Documentos' }}>
            {() => (
              <DocumentsTab
                values={documents}
                registrationDate={vehicle.registrationDate}
                onChange={onDocuments}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </View>

      <View
        style={[
          commonStyles.panel,
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        {submitError ? (
          <Text style={[commonStyles.fieldError, styles.submitError]}>{submitError}</Text>
        ) : null}
        <Pressable
          style={[
            commonStyles.primaryButton,
            (!canSubmit || submitting) && commonStyles.buttonDisabled,
          ]}
          onPress={onSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>Enviar registro</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    color: colors.onPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textOnPrimaryMuted,
    marginTop: spacing.xs,
    fontSize: 13,
  },
  footer: {
    backgroundColor: colors.surface,
  },
  submitError: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
