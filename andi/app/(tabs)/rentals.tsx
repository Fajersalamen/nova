import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/lib/hooks/useAuth";
import type { RentalStatus, RentalWithRelations } from "@/types/database.types";

type Role = "renter" | "owner";
type Bucket = "current" | "upcoming" | "past" | "cancelled";

const BUCKET_STATUSES: Record<Bucket, RentalStatus[]> = {
  upcoming: ["pending", "accepted"],
  current: ["ready_for_pickup", "active"],
  past: ["returned", "completed"],
  cancelled: ["rejected", "cancelled"],
};

const RENTAL_SELECT = `*, items(id, title, item_images(url)), renter:profiles!rentals_renter_id_fkey(id, full_name, avatar_url), owner:profiles!rentals_owner_id_fkey(id, full_name, avatar_url)`;

export default function Rentals() {
  const { profile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [role, setRole] = useState<Role>("renter");
  const [bucket, setBucket] = useState<Bucket>("current");

  const rentalsQuery = useQuery({
    queryKey: ["rentals", profile?.id, role],
    enabled: !!profile?.id,
    queryFn: async () => {
      const column = role === "renter" ? "renter_id" : "owner_id";
      const { data } = await supabase
        .from("rentals")
        .select(RENTAL_SELECT)
        .eq(column, profile!.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as RentalWithRelations[];
    },
  });

  const filtered = useMemo(
    () => (rentalsQuery.data ?? []).filter((r) => BUCKET_STATUSES[bucket].includes(r.status)),
    [rentalsQuery.data, bucket]
  );

  const updateStatus = async (rentalId: string, status: RentalStatus) => {
    await supabase.from("rentals").update({ status }).eq("id", rentalId);
    queryClient.invalidateQueries({ queryKey: ["rentals"] });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{t.rentals.title}</Text>

      <View style={styles.roleToggle}>
        <RoleButton label="كمستأجر" active={role === "renter"} onPress={() => setRole("renter")} />
        <RoleButton label="كمالك" active={role === "owner"} onPress={() => setRole("owner")} />
      </View>

      <ScrollView horizontal inverted showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.bucketRow}>
        <BucketChip label={t.rentals.current} active={bucket === "current"} onPress={() => setBucket("current")} />
        <BucketChip label={t.rentals.upcoming} active={bucket === "upcoming"} onPress={() => setBucket("upcoming")} />
        <BucketChip label={t.rentals.past} active={bucket === "past"} onPress={() => setBucket("past")} />
        <BucketChip label={t.rentals.cancelled} active={bucket === "cancelled"} onPress={() => setBucket("cancelled")} />
      </ScrollView>

      {rentalsQuery.isLoading ? (
        <Text style={{ padding: spacing.lg }}>{t.common.loading}</Text>
      ) : filtered.length === 0 ? (
        <EmptyState title={t.rentals.empty} body={t.rentals.emptyBody} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          renderItem={({ item: rental }) => (
            <RentalCard
              rental={rental}
              role={role}
              onPress={() => router.push(`/item/${rental.item_id}`)}
              onUpdateStatus={updateStatus}
              onReview={() => router.push(`/review/${rental.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function RentalCard({
  rental,
  role,
  onPress,
  onUpdateStatus,
  onReview,
}: {
  rental: RentalWithRelations;
  role: Role;
  onPress: () => void;
  onUpdateStatus: (id: string, status: RentalStatus) => void;
  onReview: () => void;
}) {
  const otherParty = role === "renter" ? rental.owner : rental.renter;
  const imageUrl = rental.items.item_images?.[0]?.url;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardRow}>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.cardImage} /> : <View style={[styles.cardImage, styles.imagePlaceholder]} />}
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyBold} numberOfLines={1}>
            {rental.items.title}
          </Text>
          <Text style={typography.caption}>مع {otherParty.full_name}</Text>
          <Text style={typography.small}>
            {rental.start_date} → {rental.end_date}
          </Text>
        </View>
        <StatusBadge status={rental.status} label={t.rentals.status[rental.status]} />
      </View>

      <View style={styles.actionsRow}>
        {role === "owner" && rental.status === "pending" ? (
          <>
            <PrimaryButton label={t.rentals.reject} variant="outline" style={{ flex: 1 }} onPress={() => onUpdateStatus(rental.id, "rejected")} />
            <PrimaryButton label={t.rentals.accept} style={{ flex: 1 }} onPress={() => onUpdateStatus(rental.id, "accepted")} />
          </>
        ) : null}
        {role === "owner" && rental.status === "accepted" ? (
          <PrimaryButton label={t.rentals.markReady} style={{ flex: 1 }} onPress={() => onUpdateStatus(rental.id, "ready_for_pickup")} />
        ) : null}
        {role === "owner" && rental.status === "ready_for_pickup" ? (
          <PrimaryButton label={t.rentals.markActive} style={{ flex: 1 }} onPress={() => onUpdateStatus(rental.id, "active")} />
        ) : null}
        {role === "owner" && rental.status === "active" ? (
          <PrimaryButton label={t.rentals.markReturned} style={{ flex: 1 }} onPress={() => onUpdateStatus(rental.id, "returned")} />
        ) : null}
        {rental.status === "returned" ? (
          <PrimaryButton label={t.rentals.markCompleted} style={{ flex: 1 }} onPress={onReview} />
        ) : null}
        {role === "renter" && rental.status === "pending" ? (
          <PrimaryButton label={t.rentals.cancel} variant="outline" style={{ flex: 1 }} onPress={() => onUpdateStatus(rental.id, "cancelled")} />
        ) : null}
      </View>
    </Pressable>
  );
}

function RoleButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.roleButton, active && styles.roleButtonActive]}>
      <Text style={[typography.bodyBold, { color: active ? colors.white : colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

function BucketChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.bucketChip, active && styles.bucketChipActive]}>
      <Text style={[typography.caption, active && { color: colors.brand, fontWeight: "700" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h2, textAlign: "right", paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  roleToggle: { flexDirection: "row-reverse", backgroundColor: colors.border, borderRadius: radius.pill, margin: spacing.lg, padding: 4 },
  roleButton: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: "center" },
  roleButtonActive: { backgroundColor: colors.brand },
  bucketRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  bucketChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 2, borderBottomColor: "transparent" },
  bucketChipActive: { borderBottomColor: colors.brand },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  cardRow: { flexDirection: "row-reverse", gap: spacing.sm, alignItems: "center" },
  cardImage: { width: 56, height: 56, borderRadius: radius.sm },
  imagePlaceholder: { backgroundColor: colors.border },
  actionsRow: { flexDirection: "row-reverse", gap: spacing.sm },
});
