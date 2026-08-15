'use client';

import type { StringKey } from '@/lib/i18n';
import { useT } from './LocaleProvider';

/**
 * Drop-in text node for static UI strings inside Server Components — a
 * tiny client island so the surrounding component (data fetching, page
 * structure) stays server-rendered while just this label reacts to the
 * locale toggle.
 */
export function T({ k }: { k: StringKey }) {
  const t = useT();
  return <>{t(k)}</>;
}
