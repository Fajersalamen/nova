'use client';

import { useEffect } from 'react';

/** Closes modals/drawers on Escape — expected behavior for any overlay. */
export function useEscapeKey(onClose: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, active]);
}
