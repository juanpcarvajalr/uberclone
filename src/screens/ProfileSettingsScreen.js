// AI-assisted: see docs/AI_LOG.md #25, #27, #28
import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useDriverSession } from '../context/DriverSessionContext';
import { commonStyles } from '../theme/commonStyles';

/**
 * Profile and settings for the authenticated driver.
 */
export default function ProfileSettingsScreen() {
  const { driver, vehicle, signOut, isAuthenticated } = useDriverSession();

  const onSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  if (!isAuthenticated) {
    return (
      <View style={commonStyles.screenPadded}>
        <Text style={commonStyles.title}>Sesión cerrada</Text>
        <Text style={commonStyles.muted}>Regístrate o inicia sesión para continuar.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* AI-assisted: see docs/AI_LOG.md #25, #27 */}
      <Text style={commonStyles.title}>Perfil</Text>

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

      <Section title="Configuración">
        <Pressable style={commonStyles.dangerButton} onPress={onSignOut}>
          <Text style={commonStyles.primaryButtonText}>Cerrar sesión</Text>
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
