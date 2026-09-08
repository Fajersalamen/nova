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
import { getCurrentLocation, jitterCoordinate, AMMAN_FALLBACK } from "@/lib/services/location";
import type { Area, Category } from "@/types/database.types";

const STEPS = [
  "photos", "name", "category", "description", "price", "location", "availability", "deposit",
] as const;
type StepKey = (typeof STEPS)[number];

export default function AddItem() {
  const { profile } = useAuth();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [minDays, setMinDays] = useState(1);
  const [maxDays, setMaxDays] = useState(14);
  const [deposit, setDeposit] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order").then(({ data }) => setCategories((data as Category[]) ?? []));
    supabase.from("areas").select("*").order("sort_order").then(({ data }) => setAreas((data as Area[]) ?? []));
  }, []);

  const resetForm = () => {
    setStepIndex(0);
    setPhotos([]);
    setTitle("");
    setCategoryId(null);
    setDescription("");
    setPricePerDay("");
    setPricePerWeek("");
    setAreaId(null);
    setMinDays(1);
    setMaxDays(14);
    setDeposit("");
    setPublished(false);
  };

  const step = STEPS[stepIndex];

  const canGoNext = (() => {
    switch (step) {
      case "photos": return photos.length > 0;
      case "name": return title.trim().length > 2;
      case "category": return categoryId != null;
      case "description": return description.trim().length > 5;
      case "price": return Number(pricePerDay) > 0;
      case "location": return areaId != null;
      case "availability": return maxDays >= minDays;
      case "deposit": return true;
      default: return false;
    }
  })();

  const pickPhoto = async () => {
    if (photos.length >= 6) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setPhotos((prev) => [...prev, result.assets[0].uri]);
  };

  const publish = async () => {
    if (!profile || !categoryId || !areaId) return;
    setPublishing(true);
    setError(null);

    try {
      const location = (await getCurrentLocation()) ?? AMMAN_FALLBACK;
      const jittered = jitterCoordinate(location.lat, location.lng);

      const { data: item, error: itemError } = await supabase
        .from("items")
        .insert({
          owner_id: profile.id,
          category_id: categoryId,
          title: title.trim(),
          description: description.trim(),
          price_per_day: Number(pricePerDay),
          price_per_week: pricePerWeek ? Number(pricePerWeek) : null,
          deposit_amount: deposit ? Number(deposit) : 0,
          min_rental_days: minDays,
          max_rental_days: maxDays,
          area_id: areaId,
          approx_lat: jittered.lat,
          approx_lng: jittered.lng,
          status: "available",
        })
        .select()
        .single();

      if (itemError || !item) throw itemError;

      for (let i = 0; i < photos.length; i++) {
        const response = await fetch(photos[i]);
        const blob = await response.arrayBuffer();
        const path = `${profile.id}/${item.id}-${i}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(path, blob, { contentType: "image/jpeg", upsert: true });
        if (!uploadError) {
          const publicUrl = supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl;
          await supabase.from("item_images").insert({ item_id: item.id, url: publicUrl, sort_order: i });
        }
      }

      setPublished(true);
    } catch {
      setError(t.common.error);
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <Text style={{ fontSize: 56 }}>🎉</Text>
          <Text style={typography.h2}>{t.addItem.published}</Text>
          <PrimaryButton
            label={t.items.title}
            onPress={() => {
              resetForm();
              router.push("/my-items");
            }}
            style={{ marginTop: spacing.xl, width: "100%" }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.h2}>{t.addItem.title}</Text>
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === "photos" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepPhotos}</Text>
            <Text style={styles.hint}>{t.addItem.photosHint}</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photoThumb} />
              ))}
              {photos.length < 6 && (
                <Pressable style={styles.addPhotoBox} onPress={pickPhoto}>
                  <Text style={{ fontSize: 24 }}>+</Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        {step === "name" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepName}</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder={t.addItem.namePlaceholder} placeholderTextColor={colors.textFaint} style={styles.input} />
          </>
        )}

        {step === "category" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepCategory}</Text>
            <View style={styles.categoryGrid}>
              {categories.map((c) => (
                <Pressable key={c.id} onPress={() => setCategoryId(c.id)} style={[styles.categoryChip, categoryId === c.id && styles.categoryChipActive]}>
                  <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                  <Text style={[typography.caption, categoryId === c.id && { color: colors.white }]}>{c.name_ar}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === "description" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepDescription}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t.addItem.descriptionPlaceholder}
              placeholderTextColor={colors.textFaint}
              style={[styles.input, { height: 120, textAlignVertical: "top" }]}
              multiline
            />
          </>
        )}

        {step === "price" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepPrice}</Text>
            <Text style={styles.fieldLabel}>{t.addItem.pricePerDay}</Text>
            <TextInput value={pricePerDay} onChangeText={setPricePerDay} keyboardType="decimal-pad" style={styles.input} placeholder="3" placeholderTextColor={colors.textFaint} />
            <Text style={styles.fieldLabel}>{t.addItem.pricePerWeek}</Text>
            <TextInput value={pricePerWeek} onChangeText={setPricePerWeek} keyboardType="decimal-pad" style={styles.input} placeholder="18" placeholderTextColor={colors.textFaint} />
          </>
        )}

        {step === "location" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepLocation}</Text>
            <Text style={styles.hint}>{t.addItem.locationHint}</Text>
            <View style={styles.categoryGrid}>
              {areas.map((a) => (
                <Pressable key={a.id} onPress={() => setAreaId(a.id)} style={[styles.areaChip, areaId === a.id && styles.categoryChipActive]}>
                  <Text style={[typography.caption, areaId === a.id && { color: colors.white }]}>{a.name_ar}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === "availability" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepAvailability}</Text>
            <Text style={styles.hint}>{t.addItem.availabilityHint}</Text>
            <Stepper label={t.item.minDays} value={minDays} onChange={setMinDays} min={1} max={maxDays} />
            <Stepper label={t.item.maxDays} value={maxDays} onChange={setMaxDays} min={minDays} max={30} />
          </>
        )}

        {step === "deposit" && (
          <>
            <Text style={styles.stepTitle}>{t.addItem.stepDeposit}</Text>
            <Text style={styles.hint}>{t.addItem.depositHint}</Text>
            <TextInput value={deposit} onChangeText={setDeposit} keyboardType="decimal-pad" style={styles.input} placeholder="10" placeholderTextColor={colors.textFaint} />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {stepIndex > 0 && (
          <PrimaryButton label={t.addItem.back} variant="outline" style={{ flex: 1 }} onPress={() => setStepIndex((i) => i - 1)} />
        )}
        {stepIndex < STEPS.length - 1 ? (
          <PrimaryButton label={t.addItem.next} style={{ flex: 2 }} disabled={!canGoNext} onPress={() => setStepIndex((i) => i + 1)} />
        ) : (
          <PrimaryButton label={t.addItem.publish} style={{ flex: 2 }} disabled={!canGoNext || publishing} loading={publishing} onPress={publish} />
        )}
      </View>
    </SafeAreaView>
  );
}

function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperControls}>
        <Pressable style={styles.stepperButton} onPress={() => onChange(Math.min(max, value + 1))}>
          <Text style={typography.h3}>+</Text>
        </Pressable>
        <Text style={typography.bodyBold}>{value}</Text>
        <Pressable style={styles.stepperButton} onPress={() => onChange(Math.max(min, value - 1))}>
          <Text style={typography.h3}>-</Text>
        </Pressable>
      </View>
      <Text style={typography.bodyBold}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  progressRow: { flexDirection: "row-reverse", gap: 4, marginTop: spacing.sm },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.brand },
  content: { padding: spacing.lg },
  stepTitle: { ...typography.h3, textAlign: "right", marginBottom: spacing.sm },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: "right", marginBottom: spacing.lg },
  fieldLabel: { ...typography.bodyBold, textAlign: "right", marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: spacing.lg,
    textAlign: "right",
    marginBottom: spacing.sm,
  },
  photoGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  photoThumb: { width: 90, height: 90, borderRadius: radius.md },
  addPhotoBox: { width: 90, height: 90, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  categoryGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  categoryChip: { alignItems: "center", gap: 4, width: 84, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  categoryChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  areaChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  stepperRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  stepperControls: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  stepperButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brandLight, alignItems: "center", justifyContent: "center" },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.md, textAlign: "center" },
  footer: { flexDirection: "row-reverse", gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  successBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
});
