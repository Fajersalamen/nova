import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";
import type { Category } from "@/types/database.types";

export function CategoryPill({
  category,
  selected,
  onPress,
}: {
  category: Category;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={[styles.circle, selected && { backgroundColor: colors.brand }]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>
      <Text style={[typography.small, selected && { color: colors.brand, fontWeight: "700" }]} numberOfLines={1}>
        {category.name_ar}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", width: 68, gap: 6 },
  circle: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 24 },
});
