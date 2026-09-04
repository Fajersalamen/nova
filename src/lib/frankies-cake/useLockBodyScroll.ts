'use client';

import { useLayoutEffect } from 'react';

/** Locks page scroll while `locked` is true — used by the cart drawer, product modal, and builder. */
export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}
