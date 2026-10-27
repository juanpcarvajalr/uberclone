// AI-assisted: see docs/AI_LOG.md #18, #24, #27, #29
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PersonalDataTab, { isPersonalTabValid } from '../screens/register/PersonalDataTab';
import VehicleTab, { isVehicleTabValid } from '../screens/register/VehicleTab';
import DocumentsTab, { isDocumentsTabValid } from '../screens/register/DocumentsTab';
import { useDriverSession } from '../context/DriverSessionContext';
import { getTechnicalInspectionRequiredFrom } from '../validation/isTechnicalInspectionRequired';
import { PRICING } from '../config/pricing';
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
  language: 'es',
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
};

const initialDocuments = {
  licenseNumber: '',
  licenseExpiresAt: '2028-01-01',
  soatExpiresAt: '2027-06-01',
  inspectionExpiresAt: '2027-06-01',
  mercadoPagoEmail: '',
  termsAccepted: false,
};

/**
 * Registration tabs with shared form state and submit gate.
 */
export default function RegisterNavigator() {
  const insets = useSafeAreaInsets();
  const { completeRegistration, signInMock } = useDriverSession();
  const [personal, setPersonal] = useState(initialPersonal);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [documents, setDocuments] = useState(initialDocuments);

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

  const onSubmit = useCallback(() => {
    if (!canSubmit) return;
    const requiredFrom = getTechnicalInspectionRequiredFrom(vehicle.registrationDate);
    completeRegistration({
      driver: {
        fullName: personal.fullName.trim(),
        documentNumber: personal.documentNumber.trim(),
        phone: personal.phone.trim(),
        birthDate: new Date(personal.birthDate).toISOString(),
        gender: personal.gender.trim(),
        email: personal.email.trim(),
        language: personal.language === 'en' ? 'en' : 'es',
        profilePhotoUrl: 'https://placehold.co/120x120/png',
        mercadoPagoEmail: documents.mercadoPagoEmail.trim(),
        termsAcceptedAt: new Date().toISOString(),
        termsCommissionRate: PRICING.commissionRate,
        documents: {
          driverLicense: {
            number: documents.licenseNumber.trim(),
            photoUrl: 'https://placehold.co/200x120/png',
            expiresAt: new Date(documents.licenseExpiresAt).toISOString(),
          },
          soat: {
            photoUrl: 'https://placehold.co/200x120/png',
            expiresAt: new Date(documents.soatExpiresAt).toISOString(),
          },
          technicalInspection: {
            required: false,
            requiredFrom: requiredFrom.toISOString(),
          },
        },
        accountStatus: 'pending',
      },
      vehicle: {
        category: vehicle.category.trim(),
        plate: vehicle.plate.trim().toUpperCase(),
        brand: vehicle.brand.trim(),
        model: vehicle.model.trim(),
        year: Number(vehicle.year),
        registrationDate: new Date(vehicle.registrationDate).toISOString(),
        color: vehicle.color.trim(),
        passengerCapacity: Number(vehicle.passengerCapacity),
        photoUrl: 'https://placehold.co/320x180/png',
      },
    });
  }, [canSubmit, personal, vehicle, documents, completeRegistration]);

  return (
    <View style={styles.root}>
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
        <Pressable
          style={[
            commonStyles.primaryButton,
            !canSubmit && commonStyles.buttonDisabled,
          ]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Text style={commonStyles.primaryButtonText}>Enviar registro</Text>
        </Pressable>
        <Pressable style={commonStyles.outlineButton} onPress={signInMock}>
          <Text style={commonStyles.outlineButtonText}>Saltar y usar conductor mock</Text>
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
});
