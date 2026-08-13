import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Anonymous, cookie-free Supabase client for the public restaurant pages.
 *
 * The cookie-based server client would call cookies(), which opts the
 * route out of static rendering and forces per-request SSR — exactly what
 * the ISR setup is meant to avoid. Public pages need no session anyway:
 * RLS grants anon read access to menus and approved reviews.
 *
 * Returns null instead of throwing when the credentials are missing or
 * malformed, for two reasons: build-time code (generateStaticParams) must
 * not fail a deploy just because the build machine can't reach the
 * database, and a misconfigured runtime should report the problem rather
 * than surface an opaque error digest to visitors.
 */
export function createPublicClientOrNull() {
  const url = supabaseUrl();
  const anonKey = supabaseAnonKey();

  if (!url || !anonKey) return null;
  if (!/^https?:\/\//.test(url)) return null;

  try {
    return createSupabaseClient<Database>(url, anonKey, {
      auth: { persistSession: false },
    });
  } catch {
    return null;
  }
}
