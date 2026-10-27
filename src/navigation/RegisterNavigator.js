// AI-assisted: see docs/AI_LOG.md #18, #24, #28
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataTab, { isPersonalTabValid } from '../screens/register/PersonalDataTab';
import VehicleTab, { isVehicleTabValid } from '../screens/register/VehicleTab';
import DocumentsTab, { isDocumentsTabValid } from '../screens/register/DocumentsTab';
import { useDriverSession } from '../context/DriverSessionContext';
import { getTechnicalInspectionRequiredFrom } from '../validation/isTechnicalInspectionRequired';
import { PRICING } from '../config/pricing';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

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
    <View style={styles.wrapper}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen name="Personal">
          {() => <PersonalDataTab values={personal} onChange={onPersonal} />}
        </Tab.Screen>
        <Tab.Screen name="Vehicle">
          {() => <VehicleTab values={vehicle} onChange={onVehicle} />}
        </Tab.Screen>
        <Tab.Screen name="Documents">
          {() => (
            <DocumentsTab
              values={documents}
              registrationDate={vehicle.registrationDate}
              onChange={onDocuments}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <Pressable
        style={[styles.submit, !canSubmit && styles.submitDisabled]}
        onPress={onSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.submitText}>Enviar registro</Text>
      </Pressable>
      <Pressable style={styles.skip} onPress={signInMock}>
        <Text style={styles.skipText}>Saltar y usar conductor mock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  submit: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: '#fff', fontWeight: '700' },
  skip: {
    marginHorizontal: 12,
    marginBottom: 12,
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: { color: colors.textMuted, fontWeight: '600' },
});
