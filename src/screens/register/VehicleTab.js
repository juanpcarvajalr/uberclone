// AI-assisted: see docs/AI_LOG.md #24, #27, #29, #30, #31
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  validatePlate,
  validateBrandOrModel,
  validateYear,
  validateRegistrationDate,
  validatePassengerCapacity,
} from '../../validation/registerValidators';
import FormField from '../../components/FormField';
import FormScrollView from '../../components/FormScrollView';
import ImagePickerField from '../../components/ImagePickerField';
import SelectField from '../../components/SelectField';
import DateField from '../../components/DateField';
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  getCapacityOptions,
  getYearOptions,
} from '../../constants/registerOptions';
import { commonStyles } from '../../theme/commonStyles';

/**
 * Registration tab: vehicle data.
 * @param {{ values: object, onChange: Function }} props
 */
export default function VehicleTab({ values, onChange }) {
  const year = Number(values.year) || new Date().getFullYear();
  const yearOptions = useMemo(() => getYearOptions(), []);
  const capacityOptions = useMemo(
    () => getCapacityOptions(values.category),
    [values.category]
  );

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
    vehiclePhotoUri: !values.vehiclePhotoUri ? 'La foto del vehículo es obligatoria' : null,
  };

  const onCategoryChange = (category) => {
    onChange('category', category);
    if (category === 'xl' && Number(values.passengerCapacity) < 6) {
      onChange('passengerCapacity', '6');
    }
  };

  return (
    <FormScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
    >
      {/* AI-assisted: see docs/AI_LOG.md #24, #29, #30, #31 */}
      <Text style={commonStyles.title}>Vehículo</Text>
      <View style={commonStyles.card}>
        <SelectField
          label="Categoría"
          value={values.category}
          options={CATEGORY_OPTIONS}
          onChange={onCategoryChange}
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
        <SelectField
          label="Año"
          value={String(values.year ?? '')}
          options={yearOptions}
          onChange={(v) => onChange('year', v)}
          error={errors.year}
        />
        <DateField
          label="Fecha de matrícula"
          value={values.registrationDate}
          onChange={(v) => onChange('registrationDate', v)}
          error={errors.registrationDate}
          minimumYear={year - 1}
          maximumYear={new Date().getFullYear()}
        />
        <SelectField
          label="Color"
          value={values.color}
          options={COLOR_OPTIONS}
          onChange={(v) => onChange('color', v)}
          error={errors.color}
        />
        <SelectField
          label="Capacidad de pasajeros"
          value={String(values.passengerCapacity ?? '')}
          options={capacityOptions}
          onChange={(v) => onChange('passengerCapacity', v)}
          error={errors.passengerCapacity}
        />
        <ImagePickerField
          label="Foto del vehículo (Debe ser legible la placa)"
          value={values.vehiclePhotoUri}
          onChange={(uri) => onChange('vehiclePhotoUri', uri)}
          error={errors.vehiclePhotoUri}
        />
      </View>
    </FormScrollView>
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
    !validatePassengerCapacity(values.category, values.passengerCapacity) &&
    !!values.vehiclePhotoUri
  );
}
