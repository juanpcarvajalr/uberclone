// AI-assisted: see docs/AI_LOG.md #24
import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Switch } from 'react-native';
import { format } from 'date-fns';
import {
  validateDocumentsTab,
  validateEmail,
} from '../../validation/registerValidators';
import {
  getTechnicalInspectionRequiredFrom,
  isTechnicalInspectionRequired,
} from '../../validation/isTechnicalInspectionRequired';
import { PRICING } from '../../config/pricing';
import { colors } from '../../theme/colors';

/**
 * Registration tab: documents and payment email.
 * @param {{ values: object, registrationDate: string, onChange: Function }} props
 */
export default function DocumentsTab({ values, registrationDate, onChange }) {
  const needsInspection = registrationDate
    ? isTechnicalInspectionRequired(registrationDate)
    : false;
  const requiredFrom = registrationDate
    ? getTechnicalInspectionRequiredFrom(registrationDate)
    : null;
  const errors = validateDocumentsTab(
    {
      driverLicense: {
        number: values.licenseNumber,
        photoUrl: 'mock',
        expiresAt: values.licenseExpiresAt,
      },
      soat: { photoUrl: 'mock', expiresAt: values.soatExpiresAt },
      technicalInspection: {
        photoUrl: needsInspection ? 'mock' : undefined,
        expiresAt: values.inspectionExpiresAt,
      },
      mercadoPagoEmail: values.mercadoPagoEmail,
      termsAccepted: values.termsAccepted,
    },
    registrationDate || new Date().toISOString()
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #24 */}
      <Field
        label="Número de licencia"
        value={values.licenseNumber}
        onChangeText={(v) => onChange('licenseNumber', v)}
        error={errors.licenseNumber}
      />
      <Field
        label="Vencimiento licencia (AAAA-MM-DD)"
        value={values.licenseExpiresAt}
        onChangeText={(v) => onChange('licenseExpiresAt', v)}
        error={errors.licenseExpiry}
      />
      <Field
        label="Vencimiento SOAT (AAAA-MM-DD)"
        value={values.soatExpiresAt}
        onChangeText={(v) => onChange('soatExpiresAt', v)}
        error={errors.soatExpiry}
      />

      {needsInspection ? (
        <Field
          label="Vencimiento revisión técnico-mecánica"
          value={values.inspectionExpiresAt}
          onChangeText={(v) => onChange('inspectionExpiresAt', v)}
          error={errors.inspectionExpiry}
        />
      ) : (
        <Text style={styles.info}>
          Revisión no requerida hasta{' '}
          {requiredFrom ? format(requiredFrom, 'dd/MM/yyyy') : '—'}
        </Text>
      )}

      <Field
        label="Correo Mercado Pago"
        value={values.mercadoPagoEmail}
        onChangeText={(v) => onChange('mercadoPagoEmail', v)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.mercadoPagoEmail || validateEmail(values.mercadoPagoEmail)}
      />

      <View style={styles.termsRow}>
        <Switch
          value={!!values.termsAccepted}
          onValueChange={(v) => onChange('termsAccepted', v)}
          trackColor={{ true: colors.accent, false: colors.border }}
        />
        <Text style={styles.termsText}>
          Acepto términos (comisión {PRICING.commissionRate * 100} %)
        </Text>
      </View>
      {errors.terms ? <Text style={styles.error}>{errors.terms}</Text> : null}
    </ScrollView>
  );
}

/**
 * @param {object} values
 * @param {string} registrationDate
 * @returns {boolean}
 */
export function isDocumentsTabValid(values, registrationDate) {
  const needsInspection = registrationDate
    ? isTechnicalInspectionRequired(registrationDate)
    : false;
  const errors = validateDocumentsTab(
    {
      driverLicense: {
        number: values.licenseNumber,
        photoUrl: 'mock',
        expiresAt: values.licenseExpiresAt,
      },
      soat: { photoUrl: 'mock', expiresAt: values.soatExpiresAt },
      technicalInspection: {
        photoUrl: needsInspection ? 'mock' : undefined,
        expiresAt: values.inspectionExpiresAt,
      },
      mercadoPagoEmail: values.mercadoPagoEmail,
      termsAccepted: values.termsAccepted,
    },
    registrationDate || new Date().toISOString()
  );
  return Object.keys(errors).length === 0;
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
  info: {
    color: colors.text,
    backgroundColor: colors.accentMuted,
    padding: 12,
    borderRadius: 8,
  },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  termsText: { flex: 1, color: colors.text },
});
