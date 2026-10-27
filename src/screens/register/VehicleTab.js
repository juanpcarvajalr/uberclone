// AI-assisted: see docs/AI_LOG.md #24, #27, #29
import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import {
  validatePlate,
  validateBrandOrModel,
  validateYear,
  validateRegistrationDate,
  validatePassengerCapacity,
} from '../../validation/registerValidators';
import FormField from '../../components/FormField';
import { commonStyles } from '../../theme/commonStyles';

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
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* AI-assisted: see docs/AI_LOG.md #24, #29 */}
      <Text style={commonStyles.title}>Vehículo</Text>
      <View style={commonStyles.card}>
        <FormField
          label="Categoría (economy|xl|premium)"
          value={values.category}
          onChangeText={(v) => onChange('category', v)}
          error={errors.category}
        />
        <FormField
          label="Placa"
          value={values.plate}
          onChangeText={(v) => onChange('plate', v.toUpperCase())}
          autoCapitalize="characters"
          error={errors.plate}
        />
        <FormField
          label="Marca"
          value={values.brand}
          onChangeText={(v) => onChange('brand', v)}
          error={errors.brand}
        />
        <FormField
          label="Modelo"
          value={values.model}
          onChangeText={(v) => onChange('model', v)}
          error={errors.model}
        />
        <FormField
          label="Año"
          value={String(values.year ?? '')}
          onChangeText={(v) => onChange('year', v)}
          keyboardType="number-pad"
          error={errors.year}
        />
        <FormField
          label="Fecha de matrícula (AAAA-MM-DD)"
          value={values.registrationDate}
          onChangeText={(v) => onChange('registrationDate', v)}
          error={errors.registrationDate}
        />
        <FormField
          label="Color"
          value={values.color}
          onChangeText={(v) => onChange('color', v)}
          error={errors.color}
        />
        <FormField
          label="Capacidad de pasajeros"
          value={String(values.passengerCapacity ?? '')}
          onChangeText={(v) => onChange('passengerCapacity', v)}
          keyboardType="number-pad"
          error={errors.passengerCapacity}
        />
        <Text style={commonStyles.caption}>Foto del vehículo: mock URL al enviar</Text>
      </View>
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
