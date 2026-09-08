import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { ItemCard } from "@/components/ItemCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useUserLocation } from "@/lib/hooks/useLocation";
import { useAuth } from "@/lib/hooks/useAuth";
import { distanceKm } from "@/lib/services/location";
import { recordSearch } from "@/lib/services/recommendations";
import type { Category, ItemWithRelations } from "@/types/database.types";

const ITEM_SELECT = `*, item_images(url, sort_order), areas(id, name_ar, name_en), categories(id, slug, name_ar, icon), profiles!items_owner_id_fkey(id, full_name, avatar_url, rating_avg, rating_count, is_verified, created_at)`;

type SortKey = "nearest" | "cheapest" | "rating" | "requested";

export default function Search() {
  const params = useLocalSearchParams<{ q?: string; categoryId?: string }>();
  const { profile } = useAuth();
  const { coords } = useUserLocation();

  const [query, setQuery] = useState(params.q ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(params.categoryId ? Number(params.categoryId) : null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("nearest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return (data ?? []) as Category[];
    },
  });

  const resultsQuery = useQuery({
    queryKey: ["search", query, categoryId, maxPrice, minRating],
    queryFn: async () => {
      let q = supabase.from("items").select(ITEM_SELECT).eq("status", "available");
      if (query.trim()) q = q.ilike("title", `%${query.trim()}%`);
      if (categoryId) q = q.eq("category_id", categoryId);
      if (maxPrice) q = q.lte("price_per_day", maxPrice);
      if (minRating) q = q.gte("rating_avg", minRating);
      const { data } = await q.limit(60);
      return (data ?? []) as unknown as ItemWithRelations[];
    },
  });

  useEffect(() => {
    if (profile?.id && (query.trim() || categoryId)) {
      recordSearch(profile.id, query.trim() || null, categoryId);
    }
    // Only log once per meaningful change, not on every keystroke re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, categoryId]);

  const sortedResults = useMemo(() => {
    const items = (resultsQuery.data ?? []).map((item) => ({
      ...item,
      distance_km: distanceKm(coords.lat, coords.lng, item.approx_lat, item.approx_lng),
    }));
    switch (sort) {
      case "cheapest":
        return items.sort((a, b) => a.price_per_day - b.price_per_day);
      case "rating":
        return items.sort((a, b) => b.rating_avg - a.rating_avg);
      case "requested":
        return items.sort((a, b) => b.rental_count - a.rental_count);
      default:
        return items.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    }
  }, [resultsQuery.data, sort, coords]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.home.searchPlaceholder}
            placeholderTextColor={colors.textFaint}
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.filterButton} onPress={() => setFiltersOpen(true)}>
          <Text>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView horizontal inverted showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}>
        <SortChip label={t.search.sortNearest} active={sort === "nearest"} onPress={() => setSort("nearest")} />
        <SortChip label={t.search.sortCheapest} active={sort === "cheapest"} onPress={() => setSort("cheapest")} />
        <SortChip label={t.search.sortTopRated} active={sort === "rating"} onPress={() => setSort("rating")} />
        <SortChip label={t.search.sortMostRequested} active={sort === "requested"} onPress={() => setSort("requested")} />
      </ScrollView>

      {resultsQuery.isLoading ? (
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : sortedResults.length === 0 ? (
        <EmptyState title={t.search.noResultsTitle} body={t.search.noResultsBody} />
      ) : (
        <FlatList
          data={sortedResults}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
          contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => <ItemCard item={item} />}
        />
      )}

      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={typography.h3}>{t.search.filters}</Text>

            <Text style={styles.filterLabel}>{t.search.category}</Text>
            <ScrollView horizontal inverted showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {(categoriesQuery.data ?? []).map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
                  style={[styles.chip, categoryId === c.id && styles.chipActive]}
                >
                  <Text style={categoryId === c.id ? styles.chipTextActive : styles.chipText}>
                    {c.icon} {c.name_ar}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>{t.search.price}</Text>
            <ScrollView horizontal inverted showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {[5, 10, 20, 50].map((price) => (
                <Pressable
                  key={price}
                  onPress={() => setMaxPrice(maxPrice === price ? null : price)}
                  style={[styles.chip, maxPrice === price && styles.chipActive]}
                >
                  <Text style={maxPrice === price ? styles.chipTextActive : styles.chipText}>حتى {price} د.أ</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>{t.search.rating}</Text>
            <ScrollView horizontal inverted showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {[4, 4.5].map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setMinRating(minRating === r ? null : r)}
                  style={[styles.chip, minRating === r && styles.chipActive]}
                >
                  <Text style={minRating === r ? styles.chipTextActive : styles.chipText}>⭐ {r}+</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row-reverse", gap: spacing.sm, marginTop: spacing.lg }}>
              <PrimaryButton
                label={t.search.reset}
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => {
                  setCategoryId(null);
                  setMaxPrice(null);
                  setMinRating(null);
                }}
              />
              <PrimaryButton label={t.search.apply} style={{ flex: 1 }} onPress={() => setFiltersOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SortChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  searchBar: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, ...typography.body, textAlign: "right", height: "100%" },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sortRow: { marginTop: spacing.md, marginBottom: spacing.xs, flexGrow: 0 },
  grid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.md, padding: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { ...typography.caption },
  chipTextActive: { ...typography.caption, color: colors.white, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  filterLabel: { ...typography.bodyBold, marginTop: spacing.md, textAlign: "right" },
});
