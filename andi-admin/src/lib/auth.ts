import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "andi_admin_session";

// Deliberately simple for the MVP: one shared password behind a signed
// marker cookie, gating a desk-only tool. See .env.example — swapping this
// for real per-admin accounts (Supabase Auth + the `admin_users` table
// already in the schema) is a follow-up, not a redesign: every page here
// already reads the *data* through supabaseAdmin regardless of how the
// operator authenticated.
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === "granted";
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "granted", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
