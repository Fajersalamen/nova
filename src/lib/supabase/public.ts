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

/**
 * Same client, but returns null instead of throwing when the credentials
 * are missing or malformed.
 *
 * Build-time code (generateStaticParams) must not depend on the database
 * being reachable: CI environments don't always carry the runtime env
 * vars, and a deploy pipeline should never break because a build machine
 * couldn't talk to Postgres. Callers treat null as "skip prerendering"
 * and let the pages render on demand instead.
 */
export function createPublicClientOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
