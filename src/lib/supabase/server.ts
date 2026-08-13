import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';
import type { Database } from '@/types/database.types';

/**
 * Server-side Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes the auth session via cookies so RLS
 * policies see the logged-in admin's auth.uid().
 *
 * Setting cookies from a Server Component (as opposed to a Server Action or
 * Route Handler) throws in Next.js — that's expected and safe to ignore
 * here, because middleware.ts refreshes the session cookie on every
 * request anyway.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl()!,
    supabaseAnonKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — safe to ignore, see docstring.
          }
        },
      },
    },
  );
}
