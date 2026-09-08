import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl = extra.supabaseUrl as string | undefined;
const supabaseAnonKey = extra.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev rather than silently hitting a blank backend.
  console.warn(
    "Supabase env vars missing — set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

// Untyped client: no hand-maintained Database generic (see database.types.ts —
// it documents row shapes for the app to cast query results against, rather
// than driving supabase-js's own generics, which need a full CLI-generated
// schema to behave correctly). Swap in `supabase gen types typescript` output
// once the project is live for real end-to-end type safety.
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
