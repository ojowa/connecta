import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
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
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(day: number, month: number, year: number): string {
  const dd = String(day).padStart(2, '0');
  const mm = String(month + 1).padStart(2, '0');
  return `${dd}-${mm}-${year}`;
}

function toDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

function WheelPicker({ items, selected, onSelect, label }: {
  items: (string | number)[];
  selected: string | number;
  onSelect: (v: string | number) => void;
  label: string;
}) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = String(selected);

  return (
    <>
      <TouchableOpacity style={styles.wheelButton} onPress={() => setVisible(true)} activeOpacity={0.7}>
        <Text style={[styles.wheelText, !selected && styles.wheelPlaceholder]}>{selectedLabel || label}</Text>
        <Text style={styles.wheelChevron}>▾</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
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
                  style={[styles.pickerItem, String(selected) === item && styles.pickerItemSelected]}
                  onPress={() => { onSelect(item); setVisible(false); }}
                >
                  <Text style={[styles.pickerItemText, String(selected) === item && styles.pickerItemTextSelected]}>{item}</Text>
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
  const parts = value ? value.split('-') : [];
  const [day, setDay] = useState(parts[2] ? parseInt(parts[2], 10) : 0);
  const [month, setMonth] = useState(parts[1] ? parseInt(parts[1], 10) - 1 : -1);
  const [year, setYear] = useState(parts[0] ? parseInt(parts[0], 10) : 0);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1905 }, (_, i) => currentYear - i);
  const maxDay = month >= 0 ? daysInMonth(month, year || currentYear) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    if (day > 0 && month >= 0 && year > 0) {
      const max = daysInMonth(month, year);
      const clamped = day > max ? max : day;
      onChange(formatDate(clamped, month, year));
    }
  }, [day, month, year]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <WheelPicker items={days} selected={day || 'DD'} onSelect={(v) => setDay(Number(v))} label="Day" />
        </View>
        <View style={styles.colWide}>
          <WheelPicker items={MONTHS} selected={month >= 0 ? MONTHS[month] : 'Month'} onSelect={(v) => setMonth(MONTHS.indexOf(String(v)))} label="Month" />
        </View>
        <View style={styles.col}>
          <WheelPicker items={years} selected={year || 'YYYY'} onSelect={(v) => setYear(Number(v))} label="Year" />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  col: { flex: 1 },
  colWide: { flex: 2 },
  wheelButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  wheelText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  wheelPlaceholder: { color: colors.textTertiary },
  wheelChevron: { ...typography.body, color: colors.textTertiary },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerContainer: { backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '50%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerTitle: { ...typography.body, fontWeight: '700' },
  pickerDone: { ...typography.body, color: colors.primary, fontWeight: '600' },
  pickerList: { maxHeight: 250 },
  pickerItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
  pickerItemSelected: { backgroundColor: colors.primaryLight },
  pickerItemText: { ...typography.body, color: colors.textPrimary },
  pickerItemTextSelected: { color: colors.primary, fontWeight: '600' },
  error: { ...typography.small, color: colors.error, marginTop: spacing.xs },
});
