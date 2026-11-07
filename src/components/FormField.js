// AI-assisted: see docs/AI_LOG.md #27
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * Shared labeled text input with error under the field.
 * @param {{
 *   label: string,
 *   error?: string|null,
 *   showPasswordToggle?: boolean,
 * } & import('react-native').TextInputProps} props
 */
export default function FormField({
  label,
  error,
  showPasswordToggle = false,
  secureTextEntry,
  style,
  ...inputProps
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const hidePassword = showPasswordToggle ? !passwordVisible : !!secureTextEntry;

  return (
    <View style={commonStyles.field}>
      <Text style={commonStyles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[commonStyles.input, showPasswordToggle && styles.inputWithToggle, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidePassword}
          {...inputProps}
        />
        {showPasswordToggle ? (
          <Pressable
            style={styles.toggle}
            onPress={() => setPasswordVisible((prev) => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={commonStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithToggle: {
    paddingRight: spacing.xxl + spacing.md,
  },
  toggle: {
    position: 'absolute',
    right: spacing.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
