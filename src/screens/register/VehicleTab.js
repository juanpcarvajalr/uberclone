// AI-assisted: see docs/AI_LOG.md #24
import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import {
  validatePlate,
  validateBrandOrModel,
  validateYear,
  validateRegistrationDate,
  validatePassengerCapacity,
} from '../../validation/registerValidators';
import { colors } from '../../theme/colors';

/**
 * Registration tab: vehicle data.
 * @param {{ values: object, onChange: Function }} props
 */
export default function VehicleTab({ values, onChange }) {
  const year = Number(values.year) || new Date().getFullYear();
  const errors = {
    category: !(values.category ?? '').trim() ? 'Categoría obligatoria' : null,
    plate: validatePlate(values.plate),
    brand: validateBrandOrModel(values.brand, 'Marca'),
    model: validateBrandOrModel(values.model, 'Modelo'),
    year: validateYear(values.year),
    registrationDate: validateRegistrationDate(values.registrationDate, year),
    color: !(values.color ?? '').trim() ? 'Color obligatorio' : null,
    passengerCapacity: validatePassengerCapacity(
      values.category,
      values.passengerCapacity
    ),
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #24 */}
      <Field
        label="Categoría (economy|xl|premium)"
        value={values.category}
        onChangeText={(v) => onChange('category', v)}
        error={errors.category}
      />
      <Field
        label="Placa"
        value={values.plate}
        onChangeText={(v) => onChange('plate', v.toUpperCase())}
        autoCapitalize="characters"
        error={errors.plate}
      />
      <Field
        label="Marca"
        value={values.brand}
        onChangeText={(v) => onChange('brand', v)}
        error={errors.brand}
      />
      <Field
        label="Modelo"
        value={values.model}
        onChangeText={(v) => onChange('model', v)}
        error={errors.model}
      />
      <Field
        label="Año"
        value={String(values.year ?? '')}
        onChangeText={(v) => onChange('year', v)}
        keyboardType="number-pad"
        error={errors.year}
      />
      <Field
        label="Fecha de matrícula (AAAA-MM-DD)"
        value={values.registrationDate}
        onChangeText={(v) => onChange('registrationDate', v)}
        error={errors.registrationDate}
      />
      <Field
        label="Color"
        value={values.color}
        onChangeText={(v) => onChange('color', v)}
        error={errors.color}
      />
      <Field
        label="Capacidad de pasajeros"
        value={String(values.passengerCapacity ?? '')}
        onChangeText={(v) => onChange('passengerCapacity', v)}
        keyboardType="number-pad"
        error={errors.passengerCapacity}
      />
      <Text style={styles.hint}>Foto del vehículo: mock URL al enviar</Text>
    </ScrollView>
  );
}

/**
 * @param {object} values
 * @returns {boolean}
 */
export function isVehicleTabValid(values) {
  const year = Number(values.year) || new Date().getFullYear();
  return (
    !!(values.category ?? '').trim() &&
    !validatePlate(values.plate) &&
    !validateBrandOrModel(values.brand, 'Marca') &&
    !validateBrandOrModel(values.model, 'Modelo') &&
    !validateYear(values.year) &&
    !validateRegistrationDate(values.registrationDate, year) &&
    !!(values.color ?? '').trim() &&
    !validatePassengerCapacity(values.category, values.passengerCapacity)
  );
}

function Field({ label, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...inputProps} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  field: { gap: 4 },
  label: { color: colors.textMuted, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  error: { color: colors.danger, fontSize: 12 },
  hint: { color: colors.textMuted, fontSize: 12 },
});
