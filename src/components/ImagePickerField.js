import React, { useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * Picks an image from gallery and exposes its local URI.
 * @param {{ label: string, value?: string|null, onChange: (uri: string) => void, error?: string|null }} props
 */
export default function ImagePickerField({ label, value, onChange, error }) {
  const onPick = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        onChange(result.assets[0].uri);
      }
    } catch {
      // ignore picker errors in UI
    }
  }, [onChange]);

  return (
    <View style={commonStyles.field}>
      <Text style={commonStyles.fieldLabel}>{label}</Text>
      <Pressable style={styles.button} onPress={onPick}>
        <Text style={styles.buttonText}>{value ? 'Cambiar foto' : 'Elegir foto'}</Text>
      </Pressable>
      {value ? <Image source={{ uri: value }} style={styles.preview} /> : null}
      {error ? <Text style={commonStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  preview: {
    marginTop: spacing.sm,
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
});
