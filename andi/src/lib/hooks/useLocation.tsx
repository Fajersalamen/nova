import { useEffect, useState } from "react";
import { AMMAN_FALLBACK, getCurrentLocation } from "@/lib/services/location";

export function useUserLocation() {
  const [coords, setCoords] = useState(AMMAN_FALLBACK);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentLocation().then((loc) => {
      if (!cancelled && loc) {
        setCoords(loc);
        setIsFallback(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, isFallback };
}
