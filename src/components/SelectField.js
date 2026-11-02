// AI-assisted: see docs/AI_LOG.md #31
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

/**
 * Labeled select field with modal options list.
 * @param {{
 *   label: string,
 *   value?: string|null,
 *   options: { value: string, label: string }[],
 *   onChange: (value: string) => void,
 *   placeholder?: string,
 *   error?: string|null,
 * }} props
 */
export default function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Seleccionar',
  error,
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const match = options.find((option) => option.value === value);
    return match ? match.label : null;
  }, [options, value]);

  return (
    <View style={commonStyles.field}>
      <Text style={commonStyles.fieldLabel}>{label}</Text>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={selectedLabel ? styles.valueText : styles.placeholderText}>
          {selectedLabel ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>
      {error ? <Text style={commonStyles.fieldError}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <Pressable
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    color: colors.text,
    fontSize: 15,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '55%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.accentMuted,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  optionTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
});
