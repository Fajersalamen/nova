import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Conversation, Item, ItemImage, Message, Profile } from "@/types/database.types";

type ConversationRow = Conversation & {
  items: Pick<Item, "id" | "title"> & { item_images: Pick<ItemImage, "url">[] };
  renter: Pick<Profile, "id" | "full_name" | "avatar_url">;
  owner: Pick<Profile, "id" | "full_name" | "avatar_url">;
  messages: Pick<Message, "content" | "type" | "created_at">[];
};

export default function ConversationsList() {
  const { profile } = useAuth();
  const router = useRouter();

  const conversationsQuery = useQuery({
    queryKey: ["conversations", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("conversations")
        .select(
          `*, items(id, title, item_images(url)), renter:profiles!conversations_renter_id_fkey(id, full_name, avatar_url), owner:profiles!conversations_owner_id_fkey(id, full_name, avatar_url), messages(content, type, created_at)`
        )
        .or(`renter_id.eq.${profile!.id},owner_id.eq.${profile!.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      return (data ?? []) as unknown as ConversationRow[];
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>{t.chat.title}</Text>

      {conversationsQuery.isLoading ? (
        <Text style={{ padding: spacing.lg }}>{t.common.loading}</Text>
      ) : !conversationsQuery.data || conversationsQuery.data.length === 0 ? (
        <EmptyState title={t.chat.empty} />
      ) : (
        <FlatList
          data={conversationsQuery.data}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          renderItem={({ item: conversation }) => {
            const otherParty = conversation.renter_id === profile?.id ? conversation.owner : conversation.renter;
            const lastMessage = [...conversation.messages].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            const imageUrl = conversation.items.item_images?.[0]?.url;

            return (
              <Pressable style={styles.row} onPress={() => router.push(`/chat/${conversation.id}`)}>
                {otherParty.avatar_url ? (
                  <Image source={{ uri: otherParty.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.imagePlaceholder]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyBold}>{otherParty.full_name}</Text>
                  <Text style={typography.caption} numberOfLines={1}>
                    {conversation.items.title}
                  </Text>
                  {lastMessage ? (
                    <Text style={typography.small} numberOfLines={1}>
                      {lastMessage.type === "text" ? lastMessage.content : lastMessage.type === "image" ? "📷 صورة" : "📍 موقع"}
                    </Text>
                  ) : null}
                </View>
                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.itemThumb} /> : null}
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
  title: { ...typography.h2, textAlign: "right", padding: spacing.lg },
  row: { flexDirection: "row-reverse", gap: spacing.sm, alignItems: "center", backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  imagePlaceholder: { backgroundColor: colors.border },
  itemThumb: { width: 40, height: 40, borderRadius: radius.sm },
});
