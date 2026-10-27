// AI-assisted: see docs/AI_LOG.md #24, #27, #29
import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import {
  validateFullName,
  validateDocumentNumber,
  validatePhone,
  validateEmail,
  validateBirthDate,
} from '../../validation/registerValidators';
import FormField from '../../components/FormField';
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
  };

  return (
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* AI-assisted: see docs/AI_LOG.md #24, #29 */}
      <Text style={commonStyles.title}>Datos personales</Text>
      <View style={commonStyles.card}>
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
        <FormField
          label="Fecha de nacimiento (AAAA-MM-DD)"
          value={values.birthDate}
          onChangeText={(v) => onChange('birthDate', v)}
          error={errors.birthDate}
        />
        <FormField
          label="Género"
          value={values.gender}
          onChangeText={(v) => onChange('gender', v)}
          placeholder="male | female | other"
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
          label="Idioma (es/en)"
          value={values.language}
          onChangeText={(v) => onChange('language', v)}
          error={null}
        />
        <Text style={commonStyles.caption}>Foto de perfil: mock URL se usará al enviar</Text>
      </View>
    </ScrollView>
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
    !!(values.gender ?? '').trim()
  );
}
