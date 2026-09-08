import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "@/lib/theme";

export function RatingBadge({ rating, count }: { rating: number; count?: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.star}>⭐</Text>
      <Text style={styles.value}>{rating > 0 ? rating.toFixed(1) : "جديد"}</Text>
      {count != null && count > 0 ? <Text style={styles.count}>({count})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", alignItems: "center", gap: 3 },
  star: { fontSize: 12 },
  value: { ...typography.caption, color: colors.text, fontWeight: "600" },
  count: { ...typography.small },
});
