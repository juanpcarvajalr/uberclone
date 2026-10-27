// AI-assisted: see docs/AI_LOG.md #25, #28
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useDriverSession } from '../context/DriverSessionContext';
import { t } from '../i18n';
import { colors } from '../theme/colors';

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
      <View style={styles.container}>
        <Text style={styles.title}>Sesión cerrada</Text>
        <Pressable style={styles.primary} onPress={signInMock}>
          <Text style={styles.primaryText}>Entrar (mock)</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #25 */}
      <Text style={styles.title}>{t(lang, 'profileTitle')}</Text>

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
        <Pressable style={styles.secondary} onPress={toggleLanguage}>
          <Text style={styles.secondaryText}>
            Idioma: {lang === 'es' ? 'Español → English' : 'English → Español'}
          </Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={onOpenRegistration}>
          <Text style={styles.secondaryText}>Probar registro (demo)</Text>
        </Pressable>
        <Pressable style={styles.danger} onPress={onSignOut}>
          <Text style={styles.primaryText}>{t(lang, 'signOut')}</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Line({ label, value }) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  sectionTitle: { fontWeight: '700', color: colors.primary, marginBottom: 4 },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { color: colors.textMuted },
  value: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  secondary: {
    backgroundColor: colors.accentMuted,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryText: { color: colors.primary, fontWeight: '600' },
  danger: {
    backgroundColor: colors.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  primary: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryText: { color: '#fff', fontWeight: '700' },
});
