import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Rental } from "@/types/database.types";

const TAG_KEYS = ["respectful", "onTime", "asDescribed", "quickReply", "goodCondition"] as const;

export default function ReviewScreen() {
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [rental, setRental] = useState<Rental | null>(null);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!rentalId) return;
    supabase.from("rentals").select("*").eq("id", rentalId).single().then(({ data }) => setRental(data as Rental));
  }, [rentalId]);

  const toggleTag = (key: string) => {
    setSelectedTags((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const submit = async () => {
    if (!rental || !profile?.id || rating === 0) return;
    setSubmitting(true);

    const isRenter = rental.renter_id === profile.id;
    const revieweeId = isRenter ? rental.owner_id : rental.renter_id;
    const role = isRenter ? "renter_to_owner" : "owner_to_renter";

    if (rental.status === "returned") {
      await supabase.from("rentals").update({ status: "completed" }).eq("id", rental.id);
    }

    await supabase.from("reviews").insert({
      rental_id: rental.id,
      reviewer_id: profile.id,
      reviewee_id: revieweeId,
      role,
      rating,
      tags: selectedTags,
      comment: comment.trim() || null,
    });

    setSubmitting(false);
    router.back();
  };

  if (!rental) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: spacing.lg }}>{t.common.loading}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={typography.h2}>{t.reviews.title}</Text>
        <Text style={styles.label}>{t.reviews.ratingLabel}</Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)}>
              <Text style={{ fontSize: 36 }}>{n <= rating ? "⭐" : "☆"}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tagsRow}>
          {TAG_KEYS.map((key) => (
            <Pressable key={key} onPress={() => toggleTag(key)} style={[styles.tag, selectedTags.includes(key) && styles.tagActive]}>
              <Text style={[typography.caption, selectedTags.includes(key) && { color: colors.white }]}>{t.reviews.tags[key]}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder={t.reviews.commentPlaceholder}
          placeholderTextColor={colors.textFaint}
          style={styles.commentInput}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t.reviews.submit} onPress={submit} disabled={rating === 0} loading={submitting} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { ...typography.bodyBold, textAlign: "right", marginTop: spacing.xl, marginBottom: spacing.md },
  starsRow: { flexDirection: "row-reverse", justifyContent: "center", gap: spacing.sm },
  tagsRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xl },
  tag: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  tagActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  commentInput: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    height: 100,
    padding: spacing.md,
    textAlign: "right",
    textAlignVertical: "top",
  },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
