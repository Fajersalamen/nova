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

const REQUIRED_SUPABASE_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

export function missingSupabaseEnv(): string[] {
  return REQUIRED_SUPABASE_KEYS.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === '';
  });
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
