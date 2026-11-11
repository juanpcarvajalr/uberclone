// AI-assisted: see docs/AI_LOG.md #25, #27, #28, #65
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDriverSession } from '../context/DriverSessionContext';
import FormField from '../components/FormField';
import FormScrollView from '../components/FormScrollView';
import SelectField from '../components/SelectField';
import { updateDriverProfile } from '../services/driverProfileService';
import {
  accountStatusLabel,
  categoryLabel,
} from '../utils/displayLabels';
import {
  BRAND_MODEL_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  digitsOnly,
  sanitizeTextInput,
  validateBrandOrModel,
  validateEmail,
  validateFullName,
  validatePassengerCapacity,
  validatePhone,
} from '../validation/registerValidators';
import {
  COLOR_OPTIONS,
  getCapacityOptions,
} from '../constants/registerOptions';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Profile and settings for the authenticated driver.
 */
export default function ProfileSettingsScreen() {
  const { driver, vehicle, signOut, isAuthenticated } = useDriverSession();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [mercadoPagoEmail, setMercadoPagoEmail] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [passengerCapacity, setPassengerCapacity] = useState('');
  const [errors, setErrors] = useState({});

  const capacityOptions = useMemo(
    () => getCapacityOptions(vehicle?.category),
    [vehicle?.category]
  );

  useEffect(() => {
    if (!editing) {
      setFullName(driver?.fullName ?? '');
      setPhone(driver?.phone ?? '');
      setMercadoPagoEmail(driver?.mercadoPagoEmail ?? '');
      setBrand(vehicle?.brand ?? '');
      setModel(vehicle?.model ?? '');
      setColor(vehicle?.color ?? '');
      setPassengerCapacity(String(vehicle?.passengerCapacity ?? ''));
      setErrors({});
    }
  }, [driver, vehicle, editing]);

  const onSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const onSave = useCallback(async () => {
    const nextErrors = {
      fullName: validateFullName(fullName),
      phone: validatePhone(phone),
      mercadoPagoEmail: validateEmail(mercadoPagoEmail),
      brand: validateBrandOrModel(brand, 'Marca'),
      model: validateBrandOrModel(model, 'Modelo'),
      color: !(color ?? '').trim() ? 'Color obligatorio' : null,
      passengerCapacity: validatePassengerCapacity(
        vehicle?.category,
        passengerCapacity
      ),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setBusy(true);
    try {
      await updateDriverProfile({
        uid: driver.uid,
        vehicleId: vehicle.vehicleId || driver.vehicleId,
        driverPatch: {
          fullName: fullName.trim().replace(/\s+/g, ' '),
          phone: phone.trim(),
          mercadoPagoEmail: mercadoPagoEmail.trim(),
        },
        vehiclePatch: {
          brand: brand.trim(),
          model: model.trim(),
          color: color.trim(),
          passengerCapacity: Number(passengerCapacity),
        },
      });
      setEditing(false);
      Alert.alert('Perfil', 'Cambios guardados.');
    } catch (error) {
      Alert.alert(
        'Perfil',
        error instanceof Error ? error.message : 'No se pudo guardar el perfil.'
      );
    } finally {
      setBusy(false);
    }
  }, [
    fullName,
    phone,
    brand,
    model,
    passengerCapacity,
    color,
    mercadoPagoEmail,
    vehicle,
    driver,
  ]);

  if (!isAuthenticated) {
    return (
      <View style={commonStyles.screenPadded}>
        <Text style={commonStyles.title}>Sesión cerrada</Text>
        <Text style={commonStyles.muted}>
          Regístrate o inicia sesión para continuar.
        </Text>
      </View>
    );
  }

  return (
    <FormScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
    >
      <Text style={commonStyles.title}>Perfil</Text>

      {!editing ? (
        <>
          <Section title="Conductor">
            <Line label="Nombre" value={driver.fullName} />
            <Line label="Documento" value={driver.documentNumber} />
            <Line label="Celular" value={driver.phone} />
            <Line label="Correo" value={driver.email} />
            <Line
              label="Estado de la cuenta"
              value={accountStatusLabel(driver.accountStatus)}
            />
            <Line label="Mercado Pago" value={driver.mercadoPagoEmail || '—'} />
          </Section>

          <Section title="Vehículo">
            <Line label="Placa" value={vehicle.plate} />
            <Line
              label="Marca / modelo"
              value={`${vehicle.brand} ${vehicle.model}`}
            />
            <Line label="Año" value={String(vehicle.year)} />
            <Line label="Categoría" value={categoryLabel(vehicle.category)} />
            <Line label="Color" value={vehicle.color} />
            <Line label="Capacidad" value={String(vehicle.passengerCapacity)} />
          </Section>

          <Section title="Documentos">
            <Line
              label="Licencia"
              value={driver.documents?.driverLicense?.number || '—'}
            />
            <Line
              label="Vence licencia"
              value={
                driver.documents?.driverLicense?.expiresAt
                  ? String(driver.documents.driverLicense.expiresAt).slice(0, 10)
                  : '—'
              }
            />
            <Line
              label="Vence SOAT"
              value={
                driver.documents?.soat?.expiresAt
                  ? String(driver.documents.soat.expiresAt).slice(0, 10)
                  : '—'
              }
            />
          </Section>

          <Pressable
            style={commonStyles.primaryButton}
            onPress={() => setEditing(true)}
          >
            <Text style={commonStyles.primaryButtonText}>Editar perfil</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Section title="Conductor">
            <FormField
              label="Nombre completo"
              value={fullName}
              onChangeText={(value) =>
                setFullName(sanitizeTextInput(value, FULL_NAME_MAX_LENGTH))
              }
              maxLength={FULL_NAME_MAX_LENGTH}
              autoCapitalize="words"
              error={errors.fullName}
            />
            <FormField
              label="Celular"
              value={phone}
              onChangeText={(value) =>
                setPhone(digitsOnly(value, PHONE_MAX_LENGTH))
              }
              keyboardType="number-pad"
              maxLength={PHONE_MAX_LENGTH}
              error={errors.phone}
            />
            <FormField
              label="Correo de Mercado Pago"
              value={mercadoPagoEmail}
              onChangeText={(value) =>
                setMercadoPagoEmail(
                  sanitizeTextInput(value, EMAIL_MAX_LENGTH).trimStart()
                )
              }
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={EMAIL_MAX_LENGTH}
              error={errors.mercadoPagoEmail}
            />
            <Line label="Documento" value={driver.documentNumber} />
            <Line label="Correo" value={driver.email} />
          </Section>

          <Section title="Vehículo">
            <FormField
              label="Marca"
              value={brand}
              onChangeText={(value) =>
                setBrand(sanitizeTextInput(value, BRAND_MODEL_MAX_LENGTH))
              }
              maxLength={BRAND_MODEL_MAX_LENGTH}
              error={errors.brand}
            />
            <FormField
              label="Modelo"
              value={model}
              onChangeText={(value) =>
                setModel(sanitizeTextInput(value, BRAND_MODEL_MAX_LENGTH))
              }
              maxLength={BRAND_MODEL_MAX_LENGTH}
              error={errors.model}
            />
            <SelectField
              label="Color"
              value={color}
              options={COLOR_OPTIONS}
              onChange={setColor}
              error={errors.color}
            />
            <SelectField
              label="Capacidad de pasajeros"
              value={String(passengerCapacity ?? '')}
              options={capacityOptions}
              onChange={setPassengerCapacity}
              error={errors.passengerCapacity}
            />
            <Line label="Placa" value={vehicle.plate} />
            <Line label="Categoría" value={categoryLabel(vehicle.category)} />
            <Line label="Año" value={String(vehicle.year)} />
          </Section>

          <Pressable
            style={commonStyles.primaryButton}
            onPress={onSave}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={commonStyles.primaryButtonText}>Guardar cambios</Text>
            )}
          </Pressable>
          <Pressable
            style={commonStyles.secondaryButton}
            onPress={() => setEditing(false)}
            disabled={busy}
          >
            <Text style={commonStyles.secondaryButtonText}>Cancelar</Text>
          </Pressable>
        </>
      )}

      <Section title="Configuración">
        <Pressable style={commonStyles.dangerButton} onPress={onSignOut}>
          <Text style={commonStyles.primaryButtonText}>Cerrar sesión</Text>
        </Pressable>
      </Section>
    </FormScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.subtitle}>{title}</Text>
      {children}
    </View>
  );
}

function Line({ label, value }) {
  return (
    <View style={commonStyles.row}>
      <Text style={commonStyles.caption}>{label}</Text>
      <Text
        style={[
          commonStyles.body,
          { fontWeight: '600', flexShrink: 1, textAlign: 'right' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
