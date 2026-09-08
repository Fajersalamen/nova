# andi-admin

Desk-only ops dashboard for the عندي rental marketplace (`../andi`). Same Supabase
project, accessed here with the service-role key (server-side only — never shipped to
the browser).

## Setup

```bash
cp .env.example .env.local   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD
npm install
npm run dev
```

## What's here

- **نظرة عامة** — users/items/rentals counts, GMV + commission (from completed rentals /
  the `transactions` ledger), top categories/areas.
- **المستخدمون** — verify / ban.
- **الأغراض** — hide / delete, with reports in context.
- **الحجوزات** — status override (dispute resolution).
- **الفئات** — add / activate / deactivate / delete.
- **البلاغات** — triage queue (pending → reviewed/resolved/dismissed).

## Known MVP simplification

Access is a single shared password behind a cookie (see `src/lib/auth.ts`), not
per-admin accounts. The schema already has an `admin_users` table with `owner` /
`admin` / `moderator` roles for when that's worth building — every page here already
reads through `supabaseAdmin`, so swapping the gate for real Supabase Auth + a role
check doesn't touch the data layer.
