import { ar } from "./ar";
import { en } from "./en";

// Arabic-only for the MVP UI (per spec: "اجعل المشروع جاهزًا لدعم الإنجليزية
// لاحقًا" — the dictionary shape already supports it, switching locale is a
// follow-up, not a rewrite).
export const locale: "ar" | "en" = "ar";
export const isRTL = locale === "ar";

const dictionaries = { ar, en };

export const t = dictionaries[locale];
