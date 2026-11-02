// AI-assisted: see docs/AI_LOG.md #31
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { format, getDaysInMonth, parseISO, isValid } from 'date-fns';
import { colors } from '../theme/colors';
import { commonStyles } from '../theme/commonStyles';
import { spacing } from '../theme/tokens';

const MONTHS = [
  { value: 1, label: 'Ene' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dic' },
];

/**
 * @param {string|null|undefined} value
 * @returns {{ year: number, month: number, day: number }}
 */
function parseParts(value) {
  if (value) {
    const parsed = parseISO(value);
    if (isValid(parsed)) {
      return {
        year: parsed.getFullYear(),
        month: parsed.getMonth() + 1,
        day: parsed.getDate(),
      };
    }
  }
  const today = new Date();
  return {
    year: today.getFullYear() - 25,
    month: 1,
    day: 1,
  };
}

/**
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {string}
 */
function toIsoDate(year, month, day) {
  const safeDay = Math.min(day, getDaysInMonth(new Date(year, month - 1, 1)));
  const mm = String(month).padStart(2, '0');
  const dd = String(safeDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Date selector that stores values as YYYY-MM-DD.
 * @param {{
 *   label: string,
 *   value?: string|null,
 *   onChange: (value: string) => void,
 *   error?: string|null,
 *   minimumYear?: number,
 *   maximumYear?: number,
 * }} props
 */
export default function DateField({
  label,
  value,
  onChange,
  error,
  minimumYear = 1950,
  maximumYear = new Date().getFullYear() + 15,
}) {
  const initial = parseParts(value);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  const years = useMemo(() => {
    const list = [];
    for (let current = maximumYear; current >= minimumYear; current -= 1) {
      list.push(current);
    }
    return list;
  }, [minimumYear, maximumYear]);

  const daysInMonth = getDaysInMonth(new Date(year, month - 1, 1));
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => index + 1),
    [daysInMonth]
  );

  const displayValue = useMemo(() => {
    if (!value) return null;
    const parsed = parseISO(value);
    return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : value;
  }, [value]);

  const openModal = () => {
    const parts = parseParts(value);
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
    setOpen(true);
  };

  const confirm = () => {
    onChange(toIsoDate(year, month, day));
    setOpen(false);
  };

  return (
    <View style={commonStyles.field}>
      <Text style={commonStyles.fieldLabel}>{label}</Text>
      <Pressable style={styles.trigger} onPress={openModal}>
        <Text style={displayValue ? styles.valueText : styles.placeholderText}>
          {displayValue ?? 'Seleccionar fecha'}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>
      {error ? <Text style={commonStyles.fieldError}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <View style={styles.columns}>
              <Column
                title="Día"
                values={days}
                selected={Math.min(day, daysInMonth)}
                onSelect={setDay}
              />
              <Column
                title="Mes"
                values={MONTHS.map((item) => item.value)}
                labels={MONTHS.map((item) => item.label)}
                selected={month}
                onSelect={setMonth}
              />
              <Column title="Año" values={years} selected={year} onSelect={setYear} />
            </View>
            <Pressable style={commonStyles.primaryButton} onPress={confirm}>
              <Text style={commonStyles.primaryButtonText}>Confirmar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Column({ title, values, labels, selected, onSelect }) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
        {values.map((item, index) => {
          const isSelected = item === selected;
          return (
            <Pressable
              key={String(item)}
              style={[styles.columnItem, isSelected && styles.columnItemSelected]}
              onPress={() => onSelect(item)}
            >
              <Text style={[styles.columnItemText, isSelected && styles.columnItemTextSelected]}>
                {labels ? labels[index] : String(item)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  columns: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: 220,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
  },
  columnScroll: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  columnItem: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  columnItemSelected: {
    backgroundColor: colors.accentMuted,
  },
  columnItemText: {
    color: colors.text,
    fontSize: 14,
  },
  columnItemTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
});
