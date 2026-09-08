import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, shadow, spacing, typography } from "@/lib/theme";
import { formatDistance } from "@/lib/services/location";
import { RatingBadge } from "./RatingStars";
import type { ItemWithRelations } from "@/types/database.types";

type Props = {
  item: ItemWithRelations;
  width?: number;
};

export function ItemCard({ item, width }: Props) {
  const router = useRouter();
  const imageUrl = item.item_images?.[0]?.url;

  return (
    <Pressable
      onPress={() => router.push(`/item/${item.id}`)}
      style={[styles.card, shadow.card, width ? { width } : { flex: 1 }]}
    >
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={typography.bodyBold} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.price}>
          {item.price_per_day} <Text style={styles.priceUnit}>د.أ / يوم</Text>
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.areas?.name_ar}
            {item.distance_km != null ? ` — ${formatDistance(item.distance_km)}` : ""}
          </Text>
        </View>
        <RatingBadge rating={item.rating_avg} count={item.rating_count} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: "hidden" },
  imageWrap: { width: "100%", height: 120 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { backgroundColor: colors.border },
  body: { padding: spacing.sm, gap: 4 },
  price: { ...typography.bodyBold, color: colors.brand },
  priceUnit: { ...typography.small, color: colors.brand },
  metaRow: { flexDirection: "row-reverse" },
  location: { ...typography.small, color: colors.textMuted },
});
