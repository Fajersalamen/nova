'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type SiteUIContextValue = {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
};

const SiteUIContext = createContext<SiteUIContextValue | null>(null);

export function SiteUIProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const value = useMemo(
    () => ({ searchOpen, setSearchOpen, searchQuery, setSearchQuery, mobileMenuOpen, setMobileMenuOpen }),
    [searchOpen, searchQuery, mobileMenuOpen],
  );

  return <SiteUIContext.Provider value={value}>{children}</SiteUIContext.Provider>;
}

export function useSiteUI() {
  const ctx = useContext(SiteUIContext);
  if (!ctx) throw new Error('useSiteUI must be used within SiteUIProvider');
  return ctx;
}
