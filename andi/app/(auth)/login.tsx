import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";

// Jordanian mobile: 07XXXXXXXX (local) -> +9627XXXXXXXX (E.164).
function toE164(local: string): string | null {
  const digits = local.replace(/\D/g, "");
  const national = digits.startsWith("0") ? digits.slice(1) : digits;
  if (!/^7\d{8}$/.test(national)) return null;
  return `+962${national}`;
}

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const e164 = toE164(phone);
    if (!e164) {
      setError("رقم الهاتف غير صحيح، تأكد إنه يبدأ بـ 07");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: e164 });
    setLoading(false);
    if (otpError) {
      setError(t.common.error);
      return;
    }
    router.push({ pathname: "/(auth)/verify", params: { phone: e164 } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t.auth.phoneTitle}</Text>
        <Text style={styles.subtitle}>{t.auth.phoneSubtitle}</Text>

        <View style={styles.inputRow}>
          <Text style={styles.prefix}>+962</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={t.auth.phonePlaceholder}
            placeholderTextColor={colors.textFaint}
            keyboardType="phone-pad"
            style={styles.input}
            maxLength={11}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={t.auth.continue} onPress={submit} loading={loading} disabled={phone.length < 9} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: "space-between" },
  content: { padding: spacing.lg, paddingTop: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  prefix: { ...typography.bodyBold, color: colors.textMuted, marginStart: spacing.sm },
  input: { flex: 1, ...typography.body, textAlign: "right", height: "100%" },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.sm, textAlign: "right" },
  footer: { padding: spacing.lg },
});
