import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, statusColors, typography } from "@/lib/theme";

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const color = statusColors[status] ?? statusColors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
      <Text style={[typography.small, { color, fontWeight: "700" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
});
