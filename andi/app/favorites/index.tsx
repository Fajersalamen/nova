import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ItemWithRelations } from "@/types/database.types";

const ITEM_SELECT = `*, item_images(url, sort_order), areas(id, name_ar, name_en), categories(id, slug, name_ar, icon), profiles!items_owner_id_fkey(id, full_name, avatar_url, rating_avg, rating_count, is_verified, created_at)`;

export default function Favorites() {
  const { profile } = useAuth();

  const favoritesQuery = useQuery({
    queryKey: ["favorites", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select(`item_id, items(${ITEM_SELECT})`)
        .eq("user_id", profile!.id)
        .order("created_at", { ascending: false });
      return ((data ?? []) as unknown as { items: ItemWithRelations }[]).map((row) => row.items);
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{t.profile.favorites}</Text>
      {favoritesQuery.isLoading ? (
        <Text style={{ padding: spacing.lg }}>{t.common.loading}</Text>
      ) : !favoritesQuery.data || favoritesQuery.data.length === 0 ? (
        <EmptyState title={t.search.noResultsTitle} body={t.search.noResultsBody} />
      ) : (
        <FlatList
          data={favoritesQuery.data}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
          contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.md }}
          renderItem={({ item }) => <ItemCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h2, textAlign: "right", padding: spacing.lg },
});
