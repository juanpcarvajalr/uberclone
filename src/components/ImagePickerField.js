// AI-assisted: see docs/AI_LOG.md #37
import React, { useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * Picks an image from gallery or camera and exposes its local URI.
 * @param {{ label: string, value?: string|null, onChange: (uri: string) => void, error?: string|null }} props
 */
export default function ImagePickerField({ label, value, onChange, error }) {
  const applyAsset = useCallback(
    (result) => {
      if (!result.canceled && result.assets?.[0]?.uri) {
        onChange(result.assets[0].uri);
      }
    },
    [onChange]
  );

  const onPickGallery = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      applyAsset(result);
    } catch {
      // ignore picker errors in UI
    }
  }, [applyAsset]);

  const onPickCamera = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      applyAsset(result);
    } catch {
      // ignore picker errors in UI
    }
  }, [applyAsset]);

  return (
    <View style={commonStyles.field}>
      {/* AI-assisted: see docs/AI_LOG.md #37 */}
      <Text style={commonStyles.fieldLabel}>{label}</Text>
      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.actionBtn]} onPress={onPickGallery}>
          <Text style={styles.buttonText}>Galería</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.actionBtn]} onPress={onPickCamera}>
          <Text style={styles.buttonText}>Cámara</Text>
        </Pressable>
      </View>
      {value ? <Image source={{ uri: value }} style={styles.preview} /> : null}
      {error ? <Text style={commonStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
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
