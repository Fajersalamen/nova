import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { ItemCard } from "@/components/ItemCard";
import { CategoryPill } from "@/components/CategoryPill";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { useUserLocation } from "@/lib/hooks/useLocation";
import { useAuth } from "@/lib/hooks/useAuth";
import { distanceKm } from "@/lib/services/location";
import { getRecommendedCategoryIds } from "@/lib/services/recommendations";
import type { Category, ItemWithRelations } from "@/types/database.types";

const ITEM_SELECT = `*, item_images(url, sort_order), areas(id, name_ar, name_en), categories(id, slug, name_ar, icon), profiles!items_owner_id_fkey(id, full_name, avatar_url, rating_avg, rating_count, is_verified, created_at)`;

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();
  const { coords } = useUserLocation();
  const [query, setQuery] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
      return (data ?? []) as Category[];
    },
  });

  const nearbyQuery = useQuery({
    queryKey: ["items-nearby", coords.lat, coords.lng],
    queryFn: async () => {
      const { data } = await supabase.from("items").select(ITEM_SELECT).eq("status", "available").limit(40);
      const items = (data ?? []) as unknown as ItemWithRelations[];
      return items
        .map((item) => ({ ...item, distance_km: distanceKm(coords.lat, coords.lng, item.approx_lat, item.approx_lng) }))
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    },
  });

  const popularQuery = useQuery({
    queryKey: ["items-popular"],
    queryFn: async () => {
      const { data } = await supabase
        .from("items")
        .select(ITEM_SELECT)
        .eq("status", "available")
        .order("rental_count", { ascending: false })
        .limit(10);
      return (data ?? []) as unknown as ItemWithRelations[];
    },
  });

  const recommendedQuery = useQuery({
    queryKey: ["items-recommended", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const categoryIds = await getRecommendedCategoryIds(profile!.id);
      if (categoryIds.length === 0) return [];
      const { data } = await supabase
        .from("items")
        .select(ITEM_SELECT)
        .eq("status", "available")
        .in("category_id", categoryIds)
        .limit(10);
      return (data ?? []) as unknown as ItemWithRelations[];
    },
  });

  const submitSearch = () => {
    router.push({ pathname: "/(tabs)/search", params: { q: query } });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{t.home.greetingQuestion}</Text>
          <Pressable style={styles.searchBar} onPress={submitSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              placeholder={t.home.searchPlaceholder}
              placeholderTextColor={colors.textFaint}
              style={styles.searchInput}
            />
          </Pressable>
        </View>

        <SectionHeader title={t.home.categories} />
        <FlatList
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          data={categoriesQuery.data ?? []}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <CategoryPill
              category={item}
              onPress={() => router.push({ pathname: "/(tabs)/search", params: { categoryId: item.id } })}
            />
          )}
        />

        <SectionHeader title={t.home.nearYou} />
        <HorizontalItems loading={nearbyQuery.isLoading} items={nearbyQuery.data} />

        {recommendedQuery.data && recommendedQuery.data.length > 0 ? (
          <>
            <SectionHeader title={t.home.maybeInterested} />
            <HorizontalItems loading={false} items={recommendedQuery.data} />
          </>
        ) : null}

        <SectionHeader title={t.home.mostRequested} />
        <HorizontalItems loading={popularQuery.isLoading} items={popularQuery.data} />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={typography.h3}>{title}</Text>
    </View>
  );
}

function HorizontalItems({ loading, items }: { loading: boolean; items?: ItemWithRelations[] }) {
  if (loading) {
    return (
      <FlatList
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        data={[1, 2, 3]}
        keyExtractor={(i) => String(i)}
        contentContainerStyle={styles.itemList}
        renderItem={() => <SkeletonCard />}
      />
    );
  }

  if (!items || items.length === 0) {
    return <EmptyState title={t.search.noResultsTitle} body={t.search.noResultsBody} />;
  }

  return (
    <FlatList
      horizontal
      inverted
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.itemList}
      renderItem={({ item }) => <ItemCard item={item} width={168} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  greeting: { ...typography.h2, textAlign: "right", marginBottom: spacing.md },
  searchBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, ...typography.body, textAlign: "right", height: "100%" },
  sectionHeader: { flexDirection: "row-reverse", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  categoryList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  itemList: { paddingHorizontal: spacing.lg },
});
