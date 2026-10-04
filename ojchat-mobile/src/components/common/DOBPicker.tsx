import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface DOBPickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(day: number, month: number, year: number): string {
  const dd = String(day).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function WheelPicker({
  items,
  selected,
  onSelect,
  label,
}: {
  items: (string | number)[];
  selected: string | number;
  onSelect: (v: string | number) => void;
  label: string;
}) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = String(selected);

  return (
    <>
      <TouchableOpacity
        style={styles.wheelButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.wheelText, !selected && styles.wheelPlaceholder]}>
          {selectedLabel || label}
        </Text>
        <Text style={styles.wheelChevron}>▾</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items.map(String)}
              keyExtractor={(item) => item}
              style={styles.pickerList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    String(selected) === item && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      String(selected) === item && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export function DOBPicker({ value, onChange, error }: DOBPickerProps) {
  const [mode, setMode] = useState<'pick' | 'type'>('pick');
  const parts = value ? value.split('-') : [];
  const [day, setDay] = useState(parts[2] ? parseInt(parts[2], 10) : 0);
  const [month, setMonth] = useState(parts[1] ? parseInt(parts[1], 10) - 1 : -1);
  const [year, setYear] = useState(parts[0] ? parseInt(parts[0], 10) : 0);
  const [typed, setTyped] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1905 }, (_, i) => currentYear - i);
  const maxDay = month >= 0 ? daysInMonth(month, year || currentYear) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    if (mode === 'pick' && day > 0 && month >= 0 && year > 0) {
      const max = daysInMonth(month, year);
      const clamped = day > max ? max : day;
      onChange(formatDate(clamped, month, year));
    }
  }, [day, month, year, mode]);

  const parseTyped = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    const formatted = clean.replace(/^(\d{2})(\d{0,2})(\d{0,4})$/, (_, dd, mm, yyyy) => {
      let result = dd;
      if (mm) result += '-' + mm;
      if (yyyy) result += '-' + yyyy;
      return result;
    });
    setTyped(formatted);

    const match = formatted.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      const di = parseInt(d, 10),
        mi = parseInt(m, 10),
        yi = parseInt(y, 10);
      if (mi >= 1 && mi <= 12 && di >= 1 && di <= 31 && yi >= 1900) {
        const date = new Date(yi, mi - 1, di);
        if (date.getDate() === di && date.getMonth() === mi - 1 && date.getFullYear() === yi) {
          onChange(`${y}-${m}-${d}`);
        }
      }
    }
  };

  const displayValue = value ? `${parts[2] || ''}-${parts[1] || ''}-${parts[0] || ''}` : '';

  if (mode === 'type') {
    return (
      <View style={styles.container}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={() => setMode('pick')}>
            <Text style={styles.toggle}>Use picker</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.textInput, error ? styles.textInputError : null]}
          placeholder="DD-MM-YYYY"
          placeholderTextColor={colors.textTertiary}
          value={typed || displayValue}
          onChangeText={parseTyped}
          keyboardType="numeric"
          maxLength={10}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          onPress={() => {
            setTyped(displayValue);
            setMode('type');
          }}
        >
          <Text style={styles.toggle}>Type instead</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <WheelPicker
            items={days}
            selected={day || 'DD'}
            onSelect={(v) => setDay(Number(v))}
            label="Day"
          />
        </View>
        <View style={styles.colWide}>
          <WheelPicker
            items={MONTHS}
            selected={month >= 0 ? MONTHS[month] : 'Month'}
            onSelect={(v) => setMonth(MONTHS.indexOf(String(v)))}
            label="Month"
          />
        </View>
        <View style={styles.col}>
          <WheelPicker
            items={years}
            selected={year || 'YYYY'}
            onSelect={(v) => setYear(Number(v))}
            label="Year"
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  toggle: { ...typography.small, color: colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.sm },
  col: { flex: 1 },
  colWide: { flex: 2 },
  wheelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  wheelText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  wheelPlaceholder: { color: colors.textTertiary },
  wheelChevron: { ...typography.body, color: colors.textTertiary },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  textInputError: { borderColor: colors.error },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: { ...typography.body, fontWeight: '700' },
  pickerDone: { ...typography.body, color: colors.primary, fontWeight: '600' },
  pickerList: { maxHeight: 250 },
  pickerItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
  pickerItemSelected: { backgroundColor: colors.primaryLight },
  pickerItemText: { ...typography.body, color: colors.textPrimary },
  pickerItemTextSelected: { color: colors.primary, fontWeight: '600' },
  error: { ...typography.small, color: colors.error, marginTop: spacing.xs },
});
