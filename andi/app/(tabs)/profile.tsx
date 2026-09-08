import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { RatingBadge } from "@/components/RatingStars";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Profile() {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.title}>{t.profile.title}</Text>

        <View style={styles.headerCard}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
          )}
          <Text style={typography.h3}>{profile.full_name}</Text>
          <RatingBadge rating={profile.rating_avg} count={profile.rating_count} />

          <View style={styles.statsRow}>
            <Stat value={profile.rentals_as_renter_count} label={t.profile.rentalsAsRenter} />
            <Stat value={profile.rentals_as_owner_count} label={t.profile.rentalsAsOwner} />
          </View>
        </View>

        <MenuRow icon="📦" label={t.profile.myItems} onPress={() => router.push("/my-items")} />
        <MenuRow icon="❤️" label={t.profile.favorites} onPress={() => router.push("/favorites")} />
        <MenuRow icon="💬" label={t.chat.title} onPress={() => router.push("/chat")} />
        <MenuRow icon="🔔" label={t.notifications.title} onPress={() => router.push("/notifications")} />
        <MenuRow icon="⚙️" label={t.profile.account} onPress={() => {}} />

        <Pressable style={styles.logoutRow} onPress={signOut}>
          <Text style={{ color: colors.danger, fontWeight: "700" }}>{t.profile.logout}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={typography.h3}>{value}</Text>
      <Text style={typography.small}>{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Text>{icon}</Text>
      <Text style={[typography.body, { flex: 1, textAlign: "right" }]}>{label}</Text>
      <Text style={{ color: colors.textFaint }}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h2, textAlign: "right", marginBottom: spacing.lg },
  headerCard: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs, marginBottom: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: spacing.sm },
  avatarPlaceholder: { backgroundColor: colors.border, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row-reverse", gap: spacing.xxl, marginTop: spacing.md },
  menuRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  logoutRow: { alignItems: "center", padding: spacing.md, marginTop: spacing.lg },
});
