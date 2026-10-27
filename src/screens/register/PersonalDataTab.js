// AI-assisted: see docs/AI_LOG.md #24
import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import {
  validateFullName,
  validateDocumentNumber,
  validatePhone,
  validateEmail,
  validateBirthDate,
} from '../../validation/registerValidators';
import { colors } from '../../theme/colors';

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
    <ScrollView contentContainerStyle={styles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #24 */}
      <Field
        label="Nombre completo"
        value={values.fullName}
        onChangeText={(v) => onChange('fullName', v)}
        error={errors.fullName}
      />
      <Field
        label="Documento"
        value={values.documentNumber}
        onChangeText={(v) => onChange('documentNumber', v)}
        keyboardType="number-pad"
        error={errors.documentNumber}
      />
      <Field
        label="Celular"
        value={values.phone}
        onChangeText={(v) => onChange('phone', v)}
        keyboardType="number-pad"
        error={errors.phone}
      />
      <Field
        label="Fecha de nacimiento (AAAA-MM-DD)"
        value={values.birthDate}
        onChangeText={(v) => onChange('birthDate', v)}
        error={errors.birthDate}
      />
      <Field
        label="Género"
        value={values.gender}
        onChangeText={(v) => onChange('gender', v)}
        placeholder="male | female | other"
        error={errors.gender}
      />
      <Field
        label="Correo"
        value={values.email}
        onChangeText={(v) => onChange('email', v)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <Field
        label="Idioma (es/en)"
        value={values.language}
        onChangeText={(v) => onChange('language', v)}
        error={null}
      />
      <Text style={styles.hint}>Foto de perfil: mock URL se usará al enviar</Text>
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
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
});
