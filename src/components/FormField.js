// AI-assisted: see docs/AI_LOG.md #27
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';

/**
 * Shared labeled text input with error under the field.
 * @param {{ label: string, error?: string|null } & import('react-native').TextInputProps} props
 */
export default function FormField({ label, error, ...inputProps }) {
  return (
    <View style={commonStyles.field}>
      <Text style={commonStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={commonStyles.input}
        placeholderTextColor={colors.textMuted}
        {...inputProps}
      />
      {error ? <Text style={commonStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}
