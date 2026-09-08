import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/hooks/useAuth";
import { colors, typography } from "@/lib/theme";
import { t } from "@/lib/i18n";

const ONBOARDING_KEY = "andi.onboarding.seen";

export default function Splash() {
  const { session, loading } = useAuth();
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);
  const [seenOnboarding, setSeenOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setSeenOnboarding(value === "true");
      setCheckedOnboarding(true);
    });
  }, []);

  if (loading || !checkedOnboarding) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>{t.appName}</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>
    );
  }

  if (!seenOnboarding) return <Redirect href="/(auth)/onboarding" />;
  if (!session) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", gap: 8 },
  logo: { ...typography.h1, color: colors.white, fontSize: 40 },
  tagline: { ...typography.body, color: colors.brandLight, textAlign: "center", paddingHorizontal: 40 },
});
