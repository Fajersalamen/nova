import { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { PrimaryButton } from "@/components/PrimaryButton";

const { width } = Dimensions.get("window");

const slides = [
  { emoji: "🔍", title: t.onboarding.slide1Title, body: t.onboarding.slide1Body },
  { emoji: "💰", title: t.onboarding.slide2Title, body: t.onboarding.slide2Body },
  { emoji: "📍", title: t.onboarding.slide3Title, body: t.onboarding.slide3Body },
];

export default function Onboarding() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem("andi.onboarding.seen", "true");
    router.replace("/(auth)/login");
  };

  const next = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={finish}>
          <Text style={styles.skip}>{t.onboarding.skip}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={index === slides.length - 1 ? t.onboarding.start : t.auth.continue} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { alignItems: "flex-start", paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  skip: { ...typography.caption, color: colors.textMuted },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  emoji: { fontSize: 52 },
  title: { ...typography.h1, textAlign: "center", marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textMuted, textAlign: "center" },
  dots: { flexDirection: "row-reverse", justifyContent: "center", gap: 6, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.brand, width: 22 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
