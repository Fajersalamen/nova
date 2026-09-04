'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type CartLine = {
  id: string;
  categorySlug: string;
  categoryName: string;
  flavorSlug: string;
  flavorName: string;
  image: string;
  sizeCode: string;
  sizeInches: number;
  unitPrice: number;
  qty: number;
  notes?: string;
};

type AddInput = Omit<CartLine, 'id'>;

export type FlyRequest = {
  id: number;
  image: string;
  fromRect: { x: number; y: number; width: number; height: number };
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addLine: (input: AddInput, originEl?: HTMLElement | null) => void;
  updateQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  cartIconRef: React.RefObject<HTMLElement | null>;
  flyRequest: FlyRequest | null;
  clearFlyRequest: () => void;
  lastAdded: string | null;
  bumpToken: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'frankies-cake-cart-v1';

function lineKey(input: AddInput) {
  return `${input.categorySlug}:${input.flavorSlug}:${input.sizeCode}:${input.notes ?? ''}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [flyRequest, setFlyRequest] = useState<FlyRequest | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [bumpToken, setBumpToken] = useState(0);
  const cartIconRef = useRef<HTMLElement | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt/blocked storage
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage may be unavailable (private mode) — cart still works in-memory
    }
  }, [lines]);

  const addLine = useCallback((input: AddInput, originEl?: HTMLElement | null) => {
    const key = lineKey(input);
    setLines((prev) => {
      const existing = prev.find((l) => lineKey(l) === key);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? { ...l, qty: l.qty + input.qty } : l));
      }
      return [...prev, { ...input, id: `${key}:${Date.now()}` }];
    });
    setLastAdded(input.flavorName);
    if (originEl) {
      const rect = originEl.getBoundingClientRect();
      setFlyRequest({
        id: Date.now(),
        image: input.image,
        fromRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      });
    } else {
      setBumpToken((t) => t + 1);
    }
  }, []);

  const clearFlyRequest = useCallback(() => {
    setFlyRequest(null);
    setBumpToken((t) => t + 1);
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    return {
      lines,
      count,
      subtotal,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addLine,
      updateQty,
      removeLine,
      cartIconRef,
      flyRequest,
      clearFlyRequest,
      lastAdded,
      bumpToken,
    };
  }, [lines, isDrawerOpen, addLine, updateQty, removeLine, flyRequest, clearFlyRequest, lastAdded, bumpToken]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
