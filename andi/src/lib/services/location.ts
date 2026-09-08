import * as Location from "expo-location";
import { t } from "@/lib/i18n";

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// "800 متر" under 1km, otherwise "1.4 كم" — matches the product spec exactly.
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000 / 50) * 50;
    return `${meters} ${t.common.m}`;
  }
  return `${km.toFixed(1)} ${t.common.km}`;
}

// Jitters a real address by ~150-300m so an item's public location is never
// exact before a rental is confirmed (spec: "لا تعرض العنوان الدقيق للعامة").
export function jitterCoordinate(lat: number, lng: number): { lat: number; lng: number } {
  const jitterDegrees = 0.0015 + Math.random() * 0.0015; // ~150-300m at this latitude
  const angle = Math.random() * 2 * Math.PI;
  return {
    lat: lat + jitterDegrees * Math.cos(angle),
    lng: lng + jitterDegrees * Math.sin(angle),
  };
}

export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const position = await Location.getCurrentPositionAsync({});
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}

// Amman city center — used as a fallback when location permission is denied
// so search/home still work (sorted by area) instead of crashing or blocking.
export const AMMAN_FALLBACK = { lat: 31.9539, lng: 35.9106 };
