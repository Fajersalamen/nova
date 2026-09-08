import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function Verify() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    setLoading(false);
    if (verifyError || !data.session) {
      setError("رمز غير صحيح، جرّب مرة ثانية");
      return;
    }

    // New users have the placeholder full_name from the DB trigger — send
    // them to finish their profile; returning users go straight in.
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, area_id")
      .eq("id", data.session.user.id)
      .single();

    if (!profile || !profile.area_id) {
      router.replace("/(auth)/profile-setup");
    } else {
      router.replace("/(tabs)");
    }
  };

  const resend = async () => {
    await supabase.auth.signInWithOtp({ phone });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t.auth.otpTitle}</Text>
        <Text style={styles.subtitle}>
          {t.auth.otpSubtitle} {phone}
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.otpInput}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.resend} onPress={resend}>
          {t.auth.resend}
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={t.auth.verify} onPress={submit} loading={loading} disabled={code.length < 6} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: "space-between" },
  content: { padding: spacing.lg, paddingTop: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  otpInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
  },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.sm, textAlign: "center" },
  resend: { ...typography.bodyBold, color: colors.brand, textAlign: "center", marginTop: spacing.xl },
  footer: { padding: spacing.lg },
});
