/**
 * Runtime configuration checks.
 *
 * Supabase's client constructor throws when its URL/key are missing, which
 * surfaces to visitors as an opaque "Application error ... Digest: <number>"
 * page with nothing actionable in it. Deployments get misconfigured
 * routinely — a variable set on the build step but not the runtime, a typo
 * in a key name — so the app checks first and reports exactly which
 * variables are missing instead of crashing.
 */

/**
 * Each variable is read through a full, literal `process.env.NAME`
 * expression, exactly as the Supabase clients read them.
 *
 * This is load-bearing, not style: Next.js substitutes NEXT_PUBLIC_* values
 * into the bundle at build time, but only for statically analyzable
 * references. A dynamic `process.env[key]` lookup is left alone and falls
 * back to whatever the runtime provides — so a dynamic check reports a
 * variable "missing" even when the client it guards holds a perfectly good
 * inlined value, and the guard then blocks a working deployment. Reading
 * them the same way the clients do keeps the check and reality in sync.
 */
export function missingSupabaseEnv(): string[] {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return missing;
}

export function isSupabaseConfigured(): boolean {
  return missingSupabaseEnv().length === 0;
}

export function configErrorMessage(missing: string[]): string {
  return [
    'إعدادات الموقع غير مكتملة.',
    '',
    'المتغيرات التالية غير مضبوطة على بيئة التشغيل:',
    ...missing.map((key) => `  • ${key}`),
    '',
    'أضفها من لوحة Cloudflare:',
    'Workers & Pages ← المشروع ← Settings ← Variables and secrets',
    'ثم أعد النشر (Deploy) لتصل القيم للنسخة المنشورة.',
  ].join('\n');
}
