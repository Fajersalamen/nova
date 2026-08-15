/**
 * Supabase configuration lookup, resilient to how the deployment supplies it.
 *
 * Next.js substitutes NEXT_PUBLIC_* values into the bundle at build time,
 * but only where the reference is statically analyzable. That substitution
 * is unconditional: if a variable is absent during the build, the expression
 * is replaced with `undefined` outright, and no value set on the runtime
 * afterwards is ever consulted. A host that separates build variables from
 * runtime variables — Cloudflare Workers does — therefore lets you set the
 * variable in the dashboard, redeploy, and still get nothing.
 *
 * So each value is resolved from two sources: the build-time inlined
 * literal, then the runtime environment. Server code gets a working value
 * whichever place the operator configured, in either order.
 *
 * Browser bundles have no runtime process.env, so the fallback is inert
 * there and client components still depend on the build-time value.
 */

function resolve(inlined: string | undefined, name: string): string | undefined {
  // `inlined` is passed in already-substituted by the compiler; the lookup
  // below stays dynamic on purpose so it survives to runtime.
  const value = inlined ?? process.env[name];
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function supabaseUrl(): string | undefined {
  return resolve(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
}

export function supabaseAnonKey(): string | undefined {
  return resolve(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Only NEXT_PUBLIC_R2_PUBLIC_URL needs the build/runtime dual lookup — the
// other R2 vars are server-only and never get inlined at build time, so a
// plain process.env read (done where they're used) already sees whichever
// panel the operator set them in.
export function r2PublicUrl(): string | undefined {
  return resolve(process.env.NEXT_PUBLIC_R2_PUBLIC_URL, 'NEXT_PUBLIC_R2_PUBLIC_URL');
}

/**
 * Names of the variables that are still unset after both lookups. Callers
 * report these to the operator rather than letting the Supabase constructor
 * throw, which reaches visitors as an opaque error digest.
 */
export function missingSupabaseEnv(): string[] {
  const missing: string[] = [];
  if (!supabaseUrl()) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey()) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return missing;
}

export function configErrorMessage(missing: string[]): string {
  return [
    'إعدادات الموقع غير مكتملة.',
    '',
    'المتغيرات التالية غير مضبوطة:',
    ...missing.map((key) => `  • ${key}`),
    '',
    'أضفها من لوحة Cloudflare في المكانين معًا:',
    '  1) Settings ← Variables and secrets',
    '  2) Settings ← Build ← Variables and secrets',
    '',
    'ثم أعد النشر (Deploy).',
  ].join('\n');
}
