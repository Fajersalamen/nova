import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Area } from "@/types/database.types";

export default function ProfileSetup() {
  const router = useRouter();
  const { session, refreshProfile } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [fullName, setFullName] = useState("");
  const [areaId, setAreaId] = useState<number | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("areas")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setAreas((data as Area[]) ?? []));
  }, []);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (!session || !fullName.trim() || !areaId) return;
    setSaving(true);
    setError(null);

    let avatarUrl: string | null = null;
    if (avatarUri) {
      try {
        const response = await fetch(avatarUri);
        const blob = await response.arrayBuffer();
        const path = `${session.user.id}/avatar-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { contentType: "image/jpeg", upsert: true });
        if (!uploadError) {
          avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
        }
      } catch {
        // Avatar upload failing shouldn't block finishing signup.
      }
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), area_id: areaId, ...(avatarUrl ? { avatar_url: avatarUrl } : {}) })
      .eq("id", session.user.id);

    setSaving(false);
    if (updateError) {
      setError(t.common.error);
      return;
    }
    await refreshProfile();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t.auth.profileTitle}</Text>

        <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={{ fontSize: 28 }}>📷</Text>
            </View>
          )}
        </Pressable>
        <Text style={styles.avatarHint}>{t.auth.avatarHint}</Text>

        <Text style={styles.label}>{t.auth.nameLabel}</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder={t.auth.namePlaceholder}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />

        <Text style={styles.label}>{t.auth.cityLabel}</Text>
        <View style={[styles.input, styles.cityBox]}>
          <Text style={typography.body}>عمان</Text>
        </View>

        <Text style={styles.label}>{t.auth.areaLabel}</Text>
        <View style={styles.areaGrid}>
          {areas.map((area) => (
            <Pressable
              key={area.id}
              onPress={() => setAreaId(area.id)}
              style={[styles.areaChip, areaId === area.id && styles.areaChipActive]}
            >
              <Text style={[typography.caption, areaId === area.id && { color: colors.white }]}>
                {area.name_ar}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t.auth.finish}
          onPress={submit}
          loading={saving}
          disabled={!fullName.trim() || !areaId}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingTop: spacing.xl, alignItems: "center" },
  title: { ...typography.h1, marginBottom: spacing.xl, textAlign: "center" },
  avatarWrap: { marginBottom: spacing.xs },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { backgroundColor: colors.border, alignItems: "center", justifyContent: "center" },
  avatarHint: { ...typography.small, marginBottom: spacing.xl },
  label: { ...typography.bodyBold, alignSelf: "flex-end", marginBottom: spacing.xs, width: "100%", textAlign: "right" },
  input: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: spacing.lg,
    textAlign: "right",
    marginBottom: spacing.lg,
    justifyContent: "center",
  },
  cityBox: { justifyContent: "center", alignItems: "flex-end" },
  areaGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm, width: "100%" },
  areaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  areaChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.md },
  footer: { padding: spacing.lg },
});
