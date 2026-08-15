'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Locale, StringKey } from '@/lib/i18n';
import { t } from '@/lib/i18n';

const STORAGE_KEY = 'site_locale';

const LocaleContext = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: 'ar',
  setLocale: () => {},
});

interface Props {
  children: React.ReactNode;
}

/**
 * Client-only locale state (localStorage, not a cookie read server-side):
 * reading the locale on the server would force every restaurant page to
 * render dynamically on every request, defeating the ISR caching this
 * site depends on for speed. Pages are always served pre-rendered in
 * Arabic; this swaps the visible text after hydration when a visitor has
 * previously chosen English — same tradeoff as a client-side theme toggle.
 */
export function LocaleProvider({ children }: Props) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en') setLocaleState('en');
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <div dir={locale === 'en' ? 'ltr' : 'rtl'}>{children}</div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  const { locale } = useLocale();
  return (key: StringKey) => t(locale, key);
}
