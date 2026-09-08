import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/lib/theme";

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl * 2, paddingHorizontal: spacing.xl },
  title: { ...typography.h3, textAlign: "center", marginBottom: spacing.xs },
  body: { ...typography.caption, textAlign: "center", color: colors.textMuted },
});
