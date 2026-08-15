'use client';

import { useLocale } from './LocaleProvider';

interface Props {
  className?: string;
}

export function LanguageToggle({ className }: Props) {
  const { locale, setLocale } = useLocale();
  const next = locale === 'ar' ? 'en' : 'ar';

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className={className ?? 'text-sm font-bold transition-opacity hover:opacity-80'}
    >
      {next === 'en' ? 'EN' : 'عربي'}
    </button>
  );
}
