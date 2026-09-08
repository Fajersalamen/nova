import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/hooks/useAuth";
import type { AppNotification } from "@/types/database.types";

const ICONS: Record<string, string> = {
  new_rental_request: "📩",
  rental_accepted: "✅",
  rental_rejected: "❌",
  pickup_reminder: "⏰",
  rental_completed: "🎉",
  new_message: "💬",
  new_review: "⭐",
  saved_item_available: "❤️",
};

export default function Notifications() {
  const { profile } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as AppNotification[]) ?? []));

    const channel = supabase
      .channel(`notifications-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${profile.id}` },
        (payload) => setItems((prev) => [payload.new as AppNotification, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const markRead = async (notification: AppNotification) => {
    if (notification.is_read) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id);
    setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{t.notifications.title}</Text>
      {items.length === 0 ? (
        <EmptyState title={t.notifications.empty} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          renderItem={({ item }) => (
            <Pressable style={[styles.row, !item.is_read && styles.rowUnread]} onPress={() => markRead(item)}>
              <Text style={{ fontSize: 20 }}>{ICONS[item.type] ?? "🔔"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyBold}>{item.title}</Text>
                <Text style={typography.caption}>{item.body}</Text>
              </View>
              {!item.is_read && <View style={styles.dot} />}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { ...typography.h2, textAlign: "right", padding: spacing.lg },
  row: { flexDirection: "row-reverse", gap: spacing.sm, alignItems: "center", backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  rowUnread: { backgroundColor: colors.brandLight, borderColor: colors.brand },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
});
