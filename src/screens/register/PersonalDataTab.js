// AI-assisted: see docs/AI_LOG.md #24, #27, #29, #30, #31
import React from 'react';
import { Text, View } from 'react-native';
import {
  validateFullName,
  validateDocumentNumber,
  validatePhone,
  validateEmail,
  validateBirthDate,
} from '../../validation/registerValidators';
import FormField from '../../components/FormField';
import FormScrollView from '../../components/FormScrollView';
import ImagePickerField from '../../components/ImagePickerField';
import SelectField from '../../components/SelectField';
import DateField from '../../components/DateField';
import { GENDER_OPTIONS } from '../../constants/registerOptions';
import { commonStyles } from '../../theme/commonStyles';

/**
 * Registration tab: personal data with field-level errors.
 * @param {{ values: object, onChange: Function }} props
 */
export default function PersonalDataTab({ values, onChange }) {
  const errors = {
    fullName: validateFullName(values.fullName),
    documentNumber: validateDocumentNumber(values.documentNumber),
    phone: validatePhone(values.phone),
    email: validateEmail(values.email),
    birthDate: validateBirthDate(values.birthDate),
    gender: !(values.gender ?? '').trim() ? 'El género es obligatorio' : null,
    password: !(values.password ?? '').trim()
      ? 'La contraseña es obligatoria'
      : (values.password ?? '').length < 6
        ? 'Mínimo 6 caracteres'
        : null,
    profilePhotoUri: !values.profilePhotoUri ? 'La foto de perfil es obligatoria' : null,
  };

  const currentYear = new Date().getFullYear();

  return (
    <FormScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
    >
      {/* AI-assisted: see docs/AI_LOG.md #24, #29, #30, #31 */}
      <Text style={commonStyles.title}>Datos personales</Text>
      <View style={commonStyles.card}>
        <ImagePickerField
          label="Foto de perfil"
          value={values.profilePhotoUri}
          onChange={(uri) => onChange('profilePhotoUri', uri)}
          error={errors.profilePhotoUri}
        />
        <FormField
          label="Nombre completo"
          value={values.fullName}
          onChangeText={(v) => onChange('fullName', v)}
          error={errors.fullName}
        />
        <FormField
          label="Documento"
          value={values.documentNumber}
          onChangeText={(v) => onChange('documentNumber', v)}
          keyboardType="number-pad"
          error={errors.documentNumber}
        />
        <FormField
          label="Celular"
          value={values.phone}
          onChangeText={(v) => onChange('phone', v)}
          keyboardType="number-pad"
          error={errors.phone}
        />
        <DateField
          label="Fecha de nacimiento"
          value={values.birthDate}
          onChange={(v) => onChange('birthDate', v)}
          error={errors.birthDate}
          minimumYear={currentYear - 90}
          maximumYear={currentYear - 18}
        />
        <SelectField
          label="Género"
          value={values.gender}
          options={GENDER_OPTIONS}
          onChange={(v) => onChange('gender', v)}
          error={errors.gender}
        />
        <FormField
          label="Correo"
          value={values.email}
          onChangeText={(v) => onChange('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <FormField
          label="Contraseña"
          value={values.password}
          onChangeText={(v) => onChange('password', v)}
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />
      </View>
    </FormScrollView>
  );
}

/**
 * Returns whether personal tab values are valid.
 * @param {object} values
 * @returns {boolean}
 */
export function isPersonalTabValid(values) {
  return (
    !validateFullName(values.fullName) &&
    !validateDocumentNumber(values.documentNumber) &&
    !validatePhone(values.phone) &&
    !validateEmail(values.email) &&
    !validateBirthDate(values.birthDate) &&
    !!(values.gender ?? '').trim() &&
    (values.password ?? '').length >= 6 &&
    !!values.profilePhotoUri
  );
}
