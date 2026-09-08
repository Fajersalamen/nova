import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client — server-only, never sent to the browser. This bypasses
// RLS entirely (that's the point of an ops dashboard), so every call site in
// this app must be a server component or server action, never a client
// component prop.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  { auth: { persistSession: false } }
);
