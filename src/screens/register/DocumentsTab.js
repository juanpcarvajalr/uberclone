// AI-assisted: see docs/AI_LOG.md #24, #27, #29, #30, #31
import React from 'react';
import { View, Text, Switch } from 'react-native';
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
import FormScrollView from '../../components/FormScrollView';
import ImagePickerField from '../../components/ImagePickerField';
import DateField from '../../components/DateField';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/commonStyles';

/**
 * Builds the documents payload used by validators.
 * @param {object} values
 * @param {boolean} needsInspection
 * @returns {object}
 */
function buildDocumentsPayload(values, needsInspection) {
  return {
    driverLicense: {
      number: values.licenseNumber,
      photoUrl: values.licensePhotoUri,
      expiresAt: values.licenseExpiresAt,
    },
    soat: {
      photoUrl: values.soatPhotoUri,
      expiresAt: values.soatExpiresAt,
    },
    technicalInspection: {
      photoUrl: needsInspection ? values.inspectionPhotoUri : undefined,
      expiresAt: values.inspectionExpiresAt,
    },
    mercadoPagoEmail: values.mercadoPagoEmail,
    termsAccepted: values.termsAccepted,
  };
}

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
    buildDocumentsPayload(values, needsInspection),
    registrationDate || new Date().toISOString()
  );
  const currentYear = new Date().getFullYear();

  return (
    <FormScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
    >
      {/* AI-assisted: see docs/AI_LOG.md #24, #29, #30, #31 */}
      <Text style={commonStyles.title}>Documentos y pagos</Text>
      <View style={commonStyles.card}>
        <FormField
          label="Número de licencia de conducción"
          value={values.licenseNumber}
          onChangeText={(v) => onChange('licenseNumber', v)}
          error={errors.licenseNumber}
        />
        <ImagePickerField
          label="Foto de licencia de conducción"
          value={values.licensePhotoUri}
          onChange={(uri) => onChange('licensePhotoUri', uri)}
          error={errors.licensePhoto}
        />
        <DateField
          label="Vencimiento licencia de conducción"
          value={values.licenseExpiresAt}
          onChange={(v) => onChange('licenseExpiresAt', v)}
          error={errors.licenseExpiry}
          minimumYear={currentYear}
          maximumYear={currentYear + 15}
        />
        <ImagePickerField
          label="Foto de SOAT"
          value={values.soatPhotoUri}
          onChange={(uri) => onChange('soatPhotoUri', uri)}
          error={errors.soatPhoto}
        />
        <DateField
          label="Vencimiento SOAT"
          value={values.soatExpiresAt}
          onChange={(v) => onChange('soatExpiresAt', v)}
          error={errors.soatExpiry}
          minimumYear={currentYear}
          maximumYear={currentYear + 5}
        />

        {needsInspection ? (
          <>
            <ImagePickerField
              label="Foto revisión técnico-mecánica"
              value={values.inspectionPhotoUri}
              onChange={(uri) => onChange('inspectionPhotoUri', uri)}
              error={errors.inspectionPhoto}
            />
            <DateField
              label="Vencimiento revisión técnico-mecánica"
              value={values.inspectionExpiresAt}
              onChange={(v) => onChange('inspectionExpiresAt', v)}
              error={errors.inspectionExpiry}
              minimumYear={currentYear}
              maximumYear={currentYear + 5}
            />
          </>
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
    </FormScrollView>
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
    buildDocumentsPayload(values, needsInspection),
    registrationDate || new Date().toISOString()
  );
  return Object.keys(errors).length === 0;
}
