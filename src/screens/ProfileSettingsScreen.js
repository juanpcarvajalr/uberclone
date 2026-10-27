// AI-assisted: see docs/AI_LOG.md #25, #27, #28
import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { commonStyles } from '../theme/commonStyles';

/**
 * Profile and settings with mock driver/vehicle data and language toggle.
 */
export default function ProfileSettingsScreen() {
  const {
    driver,
    vehicle,
    updateLanguage,
    signOut,
    signInMock,
    openRegistrationDemo,
    isAuthenticated,
  } = useDriverSession();
  const lang = driver.language ?? 'es';

  const toggleLanguage = useCallback(() => {
    updateLanguage(lang === 'es' ? 'en' : 'es');
  }, [lang, updateLanguage]);

  const onSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const onOpenRegistration = useCallback(() => {
    openRegistrationDemo();
  }, [openRegistrationDemo]);

  if (!isAuthenticated) {
    return (
      <View style={commonStyles.screenPadded}>
        <Text style={commonStyles.title}>Sesión cerrada</Text>
        <Pressable
          style={[commonStyles.primaryButton, { marginTop: 20 }]}
          onPress={signInMock}
        >
          <Text style={commonStyles.primaryButtonText}>Entrar (mock)</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #25, #27 */}
      <Text style={commonStyles.title}>{t(lang, 'profileTitle')}</Text>

      <Section title="Conductor">
        <Line label="Nombre" value={driver.fullName} />
        <Line label="Documento" value={driver.documentNumber} />
        <Line label="Celular" value={driver.phone} />
        <Line label="Correo" value={driver.email} />
        <Line label="Estado cuenta" value={driver.accountStatus} />
        <Line label="Mercado Pago" value={driver.mercadoPagoEmail} />
      </Section>

      <Section title="Vehículo">
        <Line label="Placa" value={vehicle.plate} />
        <Line label="Marca / modelo" value={`${vehicle.brand} ${vehicle.model}`} />
        <Line label="Año" value={String(vehicle.year)} />
        <Line label="Categoría" value={vehicle.category} />
        <Line label="Color" value={vehicle.color} />
        <Line label="Capacidad" value={String(vehicle.passengerCapacity)} />
      </Section>

      <Section title={t(lang, 'settingsTitle')}>
        <Pressable style={commonStyles.secondaryButton} onPress={toggleLanguage}>
          <Text style={commonStyles.secondaryButtonText}>
            Idioma: {lang === 'es' ? 'Español → English' : 'English → Español'}
          </Text>
        </Pressable>
        <Pressable style={commonStyles.secondaryButton} onPress={onOpenRegistration}>
          <Text style={commonStyles.secondaryButtonText}>Probar registro (demo)</Text>
        </Pressable>
        <Pressable style={commonStyles.dangerButton} onPress={onSignOut}>
          <Text style={commonStyles.primaryButtonText}>{t(lang, 'signOut')}</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.subtitle}>{title}</Text>
      {children}
    </View>
  );
}

function Line({ label, value }) {
  return (
    <View style={commonStyles.row}>
      <Text style={commonStyles.caption}>{label}</Text>
      <Text
        style={[
          commonStyles.body,
          { fontWeight: '600', flexShrink: 1, textAlign: 'right' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
