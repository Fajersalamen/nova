import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";

export type DateOption = { date: Date; key: string; disabled?: boolean };

export function buildDateOptions(daysAhead: number, blockedKeys: Set<string>, fromDate?: Date): DateOption[] {
  const base = fromDate ? new Date(fromDate) : new Date();
  base.setHours(0, 0, 0, 0);
  const options: DateOption[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    options.push({ date: d, key, disabled: blockedKeys.has(key) });
  }
  return options;
}

const ARABIC_MONTHS = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول",
];

export function formatDateLabel(d: Date) {
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`;
}

export function DateChipPicker({
  options,
  selectedKey,
  onSelect,
}: {
  options: DateOption[];
  selectedKey: string | null;
  onSelect: (option: DateOption) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = option.key === selectedKey;
        return (
          <Pressable
            key={option.key}
            disabled={option.disabled}
            onPress={() => onSelect(option)}
            style={[styles.chip, active && styles.chipActive, option.disabled && styles.chipDisabled]}
          >
            <Text style={[typography.caption, active && { color: colors.white, fontWeight: "700" }, option.disabled && { color: colors.textFaint }]}>
              {formatDateLabel(option.date)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipDisabled: { backgroundColor: colors.bg },
});
