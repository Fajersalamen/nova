import { useEffect } from "react";
import { I18nManager } from "react-native";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { isRTL } from "@/lib/i18n";
import { colors } from "@/lib/theme";

// RTL is a layout decision, forced once at startup — every screen in the app
// is written assuming this (flex-direction: row-reverse where needed, text
// alignment right). Forcing it requires a reload the first time, which Expo
// Go/dev builds handle automatically.
if (I18nManager.isRTL !== isRTL) {
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
