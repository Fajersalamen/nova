import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Anonymous, cookie-free Supabase client for the public restaurant pages.
 *
 * The cookie-based server client would call cookies(), which opts the
 * route out of static rendering and forces per-request SSR — exactly what
 * the ISR setup is meant to avoid. Public pages need no session anyway:
 * RLS grants anon read access to menus and approved reviews.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
