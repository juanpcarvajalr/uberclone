// AI-assisted: see docs/AI_LOG.md #24, #27, #29
import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
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
import FormField from '../../components/FormField';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/commonStyles';

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
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* AI-assisted: see docs/AI_LOG.md #24, #29 */}
      <Text style={commonStyles.title}>Documentos y pagos</Text>
      <View style={commonStyles.card}>
        <FormField
          label="Número de licencia"
          value={values.licenseNumber}
          onChangeText={(v) => onChange('licenseNumber', v)}
          error={errors.licenseNumber}
        />
        <FormField
          label="Vencimiento licencia (AAAA-MM-DD)"
          value={values.licenseExpiresAt}
          onChangeText={(v) => onChange('licenseExpiresAt', v)}
          error={errors.licenseExpiry}
        />
        <FormField
          label="Vencimiento SOAT (AAAA-MM-DD)"
          value={values.soatExpiresAt}
          onChangeText={(v) => onChange('soatExpiresAt', v)}
          error={errors.soatExpiry}
        />

        {needsInspection ? (
          <FormField
            label="Vencimiento revisión técnico-mecánica"
            value={values.inspectionExpiresAt}
            onChangeText={(v) => onChange('inspectionExpiresAt', v)}
            error={errors.inspectionExpiry}
          />
        ) : (
          <Text style={commonStyles.infoBanner}>
            Revisión no requerida hasta{' '}
            {requiredFrom ? format(requiredFrom, 'dd/MM/yyyy') : '—'}
          </Text>
        )}

        <FormField
          label="Correo Mercado Pago"
          value={values.mercadoPagoEmail}
          onChangeText={(v) => onChange('mercadoPagoEmail', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.mercadoPagoEmail || validateEmail(values.mercadoPagoEmail)}
        />

        <View style={commonStyles.row}>
          <Switch
            value={!!values.termsAccepted}
            onValueChange={(v) => onChange('termsAccepted', v)}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
          <Text style={[commonStyles.body, { flex: 1 }]}>
            Acepto términos (comisión {PRICING.commissionRate * 100} %)
          </Text>
        </View>
        {errors.terms ? <Text style={commonStyles.fieldError}>{errors.terms}</Text> : null}
      </View>
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
