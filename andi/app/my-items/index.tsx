import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Item, ItemImage } from "@/types/database.types";

type OwnedItem = Item & { item_images: Pick<ItemImage, "url">[] };

export default function MyItems() {
  const { profile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["my-items", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("items")
        .select("*, item_images(url)")
        .eq("owner_id", profile!.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as OwnedItem[];
    },
  });

  const togglePause = async (item: OwnedItem) => {
    const nextStatus = item.status === "paused" ? "available" : "paused";
    await supabase.from("items").update({ status: nextStatus }).eq("id", item.id);
    queryClient.invalidateQueries({ queryKey: ["my-items"] });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.h2}>{t.items.title}</Text>
        <Pressable onPress={() => router.push("/(tabs)/add-item")}>
          <Text style={styles.addLink}>+ {t.items.addNew}</Text>
        </Pressable>
      </View>

      {itemsQuery.isLoading ? (
        <Text style={{ padding: spacing.lg }}>{t.common.loading}</Text>
      ) : !itemsQuery.data || itemsQuery.data.length === 0 ? (
        <EmptyState title={t.items.empty} body={t.items.emptyBody} />
      ) : (
        <FlatList
          data={itemsQuery.data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => {
            const imageUrl = item.item_images?.[0]?.url;
            return (
              <Pressable style={styles.card} onPress={() => router.push(`/item/${item.id}`)}>
                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : <View style={[styles.image, styles.imagePlaceholder]} />}
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyBold} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.price}>{item.price_per_day} د.أ / يوم</Text>
                  <View style={styles.statsRow}>
                    <Text style={typography.small}>{item.rental_count} {t.items.totalRentals}</Text>
                    <StatusBadge status={item.status} label={t.items.status[item.status]} />
                  </View>
                </View>
                <Pressable onPress={() => togglePause(item)} style={styles.pauseButton}>
                  <Text style={{ fontSize: 12 }}>{item.status === "paused" ? "▶️" : "⏸"}</Text>
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", padding: spacing.lg },
  addLink: { ...typography.bodyBold, color: colors.brand },
  card: { flexDirection: "row-reverse", gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: "center" },
  image: { width: 64, height: 64, borderRadius: radius.sm },
  imagePlaceholder: { backgroundColor: colors.border },
  price: { ...typography.caption, color: colors.brand, marginTop: 2 },
  statsRow: { flexDirection: "row-reverse", gap: spacing.sm, alignItems: "center", marginTop: spacing.xs },
  pauseButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brandLight, alignItems: "center", justifyContent: "center" },
});
