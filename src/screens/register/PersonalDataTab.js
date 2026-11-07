// AI-assisted: see docs/AI_LOG.md #24, #27, #29, #30, #31, #38
import React from 'react';
import { Text, View } from 'react-native';
import {
  validateFullName,
  validateDocumentNumber,
  validatePhone,
  validateEmail,
  validateBirthDate,
  validatePassword,
  digitsOnly,
  sanitizeTextInput,
  DOCUMENT_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PHONE_MAX_LENGTH,
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
    password: validatePassword(values.password),
    profilePhotoUri: !values.profilePhotoUri ? 'La foto de perfil es obligatoria' : null,
  };

  const currentYear = new Date().getFullYear();

  return (
    <FormScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
    >
      {/* AI-assisted: see docs/AI_LOG.md #24, #29, #30, #31, #38 */}
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
          onChangeText={(v) => onChange('fullName', sanitizeTextInput(v, FULL_NAME_MAX_LENGTH))}
          maxLength={FULL_NAME_MAX_LENGTH}
          autoCapitalize="words"
          error={errors.fullName}
        />
        <FormField
          label="Documento"
          value={values.documentNumber}
          onChangeText={(v) => onChange('documentNumber', digitsOnly(v, DOCUMENT_MAX_LENGTH))}
          keyboardType="number-pad"
          maxLength={DOCUMENT_MAX_LENGTH}
          error={errors.documentNumber}
        />
        <FormField
          label="Celular"
          value={values.phone}
          onChangeText={(v) => onChange('phone', digitsOnly(v, PHONE_MAX_LENGTH))}
          keyboardType="number-pad"
          maxLength={PHONE_MAX_LENGTH}
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
          onChangeText={(v) => onChange('email', sanitizeTextInput(v, EMAIL_MAX_LENGTH).trimStart())}
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={EMAIL_MAX_LENGTH}
          error={errors.email}
        />
        <FormField
          label="Contraseña"
          value={values.password}
          onChangeText={(v) => onChange('password', String(v ?? '').slice(0, PASSWORD_MAX_LENGTH))}
          secureTextEntry
          showPasswordToggle
          autoCapitalize="none"
          maxLength={PASSWORD_MAX_LENGTH}
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
    !validatePassword(values.password) &&
    !!values.profilePhotoUri
  );
}
