import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/lib/hooks/useAuth";

const REASONS = ["الغرض غير مطابق للوصف", "سلوك غير لائق", "احتيال أو نصب", "محتوى غير مناسب", "سبب آخر"];

export default function Report() {
  const { targetType, targetId } = useLocalSearchParams<{ targetType: "user" | "item"; targetId: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!profile?.id || !reason || !targetType || !targetId) return;
    setSubmitting(true);
    await supabase.from("reports").insert({
      reporter_id: profile.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <Text style={{ fontSize: 48 }}>✅</Text>
          <Text style={typography.h3}>{t.report.submitted}</Text>
          <PrimaryButton label={t.common.confirm} onPress={() => router.back()} style={{ marginTop: spacing.lg, width: "100%" }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={typography.h2}>{t.report.title}</Text>
        <Text style={styles.label}>{t.report.reasonLabel}</Text>
        {REASONS.map((r) => (
          <Pressable key={r} onPress={() => setReason(r)} style={[styles.reasonRow, reason === r && styles.reasonRowActive]}>
            <Text style={typography.body}>{r}</Text>
            <View style={[styles.radio, reason === r && styles.radioActive]} />
          </Pressable>
        ))}
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder={t.report.detailsPlaceholder}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          multiline
        />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label={t.report.submit} onPress={submit} disabled={!reason} loading={submitting} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { ...typography.bodyBold, textAlign: "right", marginTop: spacing.xl, marginBottom: spacing.md },
  reasonRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reasonRowActive: { borderColor: colors.brand },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.brand, backgroundColor: colors.brand },
  input: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, height: 100, padding: spacing.md, textAlign: "right", textAlignVertical: "top" },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  successBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
});
