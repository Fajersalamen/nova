import { useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Message } from "@/types/database.types";

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) ?? []));

    const channel = supabase
      .channel(`conversation-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const sendMessage = async (payload: Partial<Message>) => {
    if (!profile?.id || !id) return;
    await supabase.from("messages").insert({ conversation_id: id, sender_id: profile.id, type: "text", ...payload });
  };

  const sendText = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    await sendMessage({ type: "text", content });
  };

  const sendImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (result.canceled || !profile?.id) return;
    const response = await fetch(result.assets[0].uri);
    const blob = await response.arrayBuffer();
    const path = `${profile.id}/chat-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("item-images").upload(path, blob, { contentType: "image/jpeg" });
    if (error) return;
    const publicUrl = supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl;
    await sendMessage({ type: "image", image_url: publicUrl });
  };

  const sendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const position = await Location.getCurrentPositionAsync({});
    await sendMessage({ type: "location", lat: position.coords.latitude, lng: position.coords.longitude });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMine = item.sender_id === profile?.id;
            return (
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {item.type === "text" && <Text style={{ color: isMine ? colors.white : colors.text }}>{item.content}</Text>}
                {item.type === "image" && item.image_url && <Image source={{ uri: item.image_url }} style={styles.imageBubble} />}
                {item.type === "location" && <Text style={{ color: isMine ? colors.white : colors.text }}>📍 موقع مشترَك</Text>}
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <Pressable onPress={sendLocation} style={styles.iconButton}>
            <Text>📍</Text>
          </Pressable>
          <Pressable onPress={sendImage} style={styles.iconButton}>
            <Text>📷</Text>
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t.chat.typeMessage}
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
          <Pressable onPress={sendText} style={styles.sendButton}>
            <Text style={{ color: colors.white, fontWeight: "700" }}>{t.chat.send}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bubble: { maxWidth: "75%", padding: spacing.sm, borderRadius: radius.md },
  bubbleMine: { backgroundColor: colors.brand, alignSelf: "flex-start" },
  bubbleTheirs: { backgroundColor: colors.surface, alignSelf: "flex-end", borderWidth: 1, borderColor: colors.border },
  imageBubble: { width: 160, height: 120, borderRadius: radius.sm },
  inputRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.xs, padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: spacing.md, height: 40, textAlign: "right" },
  sendButton: { backgroundColor: colors.brand, paddingHorizontal: spacing.md, height: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
});
