import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Browser client, used by the login form and other client components.
 *
 * These references must stay static: a browser bundle has no runtime
 * process.env to fall back on, so the values have to be inlined at build
 * time. That makes the build environment the only place these can come
 * from on the client side, unlike the server helpers in lib/env.ts which
 * can also read them at runtime.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
