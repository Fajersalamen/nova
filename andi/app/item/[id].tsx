import { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, shadow, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RatingBadge } from "@/components/RatingStars";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserLocation } from "@/lib/hooks/useLocation";
import { distanceKm, formatDistance } from "@/lib/services/location";
import type { ItemWithRelations } from "@/types/database.types";

const { width } = Dimensions.get("window");
const ITEM_SELECT = `*, item_images(url, sort_order), areas(id, name_ar, name_en), categories(id, slug, name_ar, icon), profiles!items_owner_id_fkey(id, full_name, avatar_url, rating_avg, rating_count, is_verified, created_at)`;

export default function ItemDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { coords } = useUserLocation();
  const [isFavorite, setIsFavorite] = useState(false);

  const itemQuery = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("items").select(ITEM_SELECT).eq("id", id).single();
      if (error) throw error;
      return data as unknown as ItemWithRelations;
    },
  });

  useEffect(() => {
    if (id) supabase.rpc("increment_item_view", { p_item_id: id }).then(() => {});
  }, [id]);

  useEffect(() => {
    if (!profile?.id || !id) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", profile.id)
      .eq("item_id", id)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [profile?.id, id]);

  const toggleFavorite = async () => {
    if (!profile?.id || !id) return;
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", profile.id).eq("item_id", id);
    } else {
      await supabase.from("favorites").insert({ user_id: profile.id, item_id: id });
    }
    setIsFavorite(!isFavorite);
  };

  if (itemQuery.isLoading || !itemQuery.data) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: spacing.lg }}>{t.common.loading}</Text>
      </SafeAreaView>
    );
  }

  const item = itemQuery.data;
  const images = item.item_images?.length ? item.item_images : [{ url: "" }];
  const isOwnItem = profile?.id === item.owner_id;
  const distance = distanceKm(coords.lat, coords.lng, item.approx_lat, item.approx_lng);
  const memberSinceYear = new Date(item.profiles.created_at).getFullYear();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(img, i) => img.url + i}
            renderItem={({ item: img }) =>
              img.url ? (
                <Image source={{ uri: img.url }} style={{ width, height: 300 }} resizeMode="cover" />
              ) : (
                <View style={[{ width, height: 300 }, styles.imagePlaceholder]} />
              )
            }
          />
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={typography.h2}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.price_per_day} {t.item.perDay}
            </Text>
            {item.price_per_week ? (
              <Text style={styles.priceSecondary}>
                أو {item.price_per_week} {t.item.perWeek}
              </Text>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <RatingBadge rating={item.rating_avg} count={item.rating_count} />
            <Text style={styles.metaDivider}>•</Text>
            <Text style={typography.caption}>
              📍 {item.areas.name_ar} — {formatDistance(distance)}
            </Text>
          </View>

          <Divider />

          <Text style={typography.h3}>{t.item.description}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <Divider />

          <Text style={typography.h3}>{t.item.rentalInfo}</Text>
          <InfoRow label={t.item.minDays} value={`${item.min_rental_days} ${t.item.day}`} />
          <InfoRow label={t.item.maxDays} value={`${item.max_rental_days} ${t.item.days}`} />
          <InfoRow label={t.item.deposit} value={`${item.deposit_amount} ${t.common.jod}`} />
          <InfoRow label="" value={t.item.availableFrom} />

          <Divider />

          <Text style={typography.h3}>{t.item.owner}</Text>
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatarWrap}>
              {item.profiles.avatar_url ? (
                <Image source={{ uri: item.profiles.avatar_url }} style={styles.ownerAvatar} />
              ) : (
                <View style={[styles.ownerAvatar, styles.imagePlaceholder]} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.ownerNameRow}>
                <Text style={typography.bodyBold}>{item.profiles.full_name}</Text>
                {item.profiles.is_verified ? <Text> ✅</Text> : null}
              </View>
              <RatingBadge rating={item.profiles.rating_avg} count={item.profiles.rating_count} />
              <Text style={typography.small}>{t.item.memberSince} {memberSinceYear}</Text>
              {item.profiles.is_verified ? <Text style={styles.verifiedTag}>{t.item.verifiedPhone}</Text> : null}
            </View>
          </View>

          <Pressable
            onPress={() => router.push({ pathname: "/report", params: { targetType: "item", targetId: item.id } })}
            style={{ marginTop: spacing.lg }}
          >
            <Text style={styles.reportLink}>{t.item.reportItem}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {!isOwnItem ? (
        <View style={[styles.footer, shadow.floating]}>
          <PrimaryButton
            label={isFavorite ? `♥ ${t.item.saved}` : `♡ ${t.item.save}`}
            variant="outline"
            onPress={toggleFavorite}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            label={t.item.rentNow}
            onPress={() => router.push(`/booking/${item.id}`)}
            style={{ flex: 2 }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={typography.caption}>{value}</Text>
      {label ? <Text style={styles.infoLabel}>{label}</Text> : null}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  imagePlaceholder: { backgroundColor: colors.border },
  backButton: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: spacing.lg },
  priceRow: { flexDirection: "row-reverse", alignItems: "baseline", gap: spacing.sm, marginTop: spacing.xs },
  price: { ...typography.h2, color: colors.brand },
  priceSecondary: { ...typography.caption, color: colors.textMuted },
  metaRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  metaDivider: { color: colors.textFaint },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  description: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  infoRow: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: spacing.xs },
  infoLabel: { ...typography.caption, color: colors.textMuted },
  ownerRow: { flexDirection: "row-reverse", gap: spacing.md, marginTop: spacing.sm, alignItems: "center" },
  ownerAvatarWrap: {},
  ownerAvatar: { width: 56, height: 56, borderRadius: 28 },
  ownerNameRow: { flexDirection: "row-reverse", alignItems: "center" },
  verifiedTag: { ...typography.small, color: colors.brand, marginTop: 2 },
  reportLink: { ...typography.caption, color: colors.textMuted, textDecorationLine: "underline" },
  footer: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
