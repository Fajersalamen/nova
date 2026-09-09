# عندي (Andi) — Peer-to-Peer Rental Marketplace

MVP for renting everyday items (tools, cameras, camping gear, party equipment…) between
people nearby. Launch market: Amman, Jordan. Currency: JOD. Primary language: Arabic
(Jordanian colloquial tone), full RTL. Architecture leaves room for English later.

This lives at `andi/` inside the `nova` repo as an independent product — it does not touch
the existing restaurant-SaaS app at the repo root. It has its own `package.json`,
its own Supabase project/schema, and its own deploy target.

## 1. Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Mobile app | React Native + Expo (SDK 57+, TypeScript) | Fastest path to a real installable iOS/Android app from one codebase; Expo Router gives file-based navigation close to what a web dev already knows; OTA updates later without app-store review. Kept on the current SDK deliberately — Expo Go only runs the latest SDK, so staying current is what makes ad-hoc device testing possible at all. |
| Navigation | `expo-router` | File-based, typed routes, built-in stacks/tabs, easy deep-linking into `item/[id]`, `chat/[id]`, etc. |
| Backend | Supabase (Postgres + Auth + Storage + Realtime + RLS) | One managed backend covers auth (phone OTP), relational data, file storage (item photos), and realtime (chat, live rental status) — no custom server to run for the MVP. |
| State/data | `@tanstack/react-query` + Supabase JS client | Caching, retries, optimistic updates for bookings/favorites without hand-rolled state machines. |
| Styling | Custom lightweight theme (no heavy UI kit) | Full control over the "premium minimal" look; avoids fighting a component library's own opinions/RTL quirks. |
| i18n | Custom key-based dictionary (`ar` now, `en` stub) | Small, no runtime cost, RTL is a layout decision (`I18nManager.forceRTL`) independent of the string layer. |
| Payments | `PaymentService` interface + `MockPaymentProvider` | Real gateways (CliQ, Visa/Mastercard, wallets) aren't wired in an MVP; the interface lets the rest of the app (booking, refunds, payouts) be built against a stable contract and the provider swapped later without touching UI/business logic. |
| Admin | Separate minimal Next.js app (`andi-admin/`) | Admin work is desk work, not mobile; reusing Next.js/Tailwind (already a proven pattern in this repo) is the fastest way to a working ops dashboard talking to the same Supabase project via the service-role key. |

## 2. High-level architecture

```
                     ┌─────────────────────────┐
                     │   Expo app (iOS/Android) │
                     │  expo-router + RN        │
                     └────────────┬─────────────┘
                                  │ supabase-js (anon key, RLS-scoped)
                                  ▼
                     ┌─────────────────────────┐
        seed/admin   │        Supabase          │◄──── andi-admin (Next.js,
        SQL ─────────►  Postgres + Auth + RLS   │      service-role key,
                     │  Storage (item photos)   │      desk-only)
                     │  Realtime (chat, status) │
                     └────────────┬─────────────┘
                                  │
                     ┌────────────▼─────────────┐
                     │  PaymentService interface │
                     │  (MockPaymentProvider now,│
                     │   CliQ/Visa driver later) │
                     └───────────────────────────┘
```

Client never talks to a custom API server for the MVP — Postgres RLS *is* the
authorization layer. The only "server" code is Postgres functions/triggers (rating
aggregation, commission calc, `updated_at` stamping) and the admin app's server actions
(which use the service-role key and are never exposed to the mobile client).

## 3. Folder structure

```
andi/
├── app/                        # expo-router screens (file-based routing)
│   ├── _layout.tsx             # root: fonts, RTL, AuthProvider, QueryClientProvider
│   ├── (auth)/
│   │   ├── onboarding.tsx
│   │   ├── login.tsx           # phone number entry
│   │   ├── verify.tsx          # OTP
│   │   └── profile-setup.tsx   # name, avatar, city/area
│   ├── (tabs)/
│   │   ├── _layout.tsx         # bottom nav: home / search / add / rentals / profile
│   │   ├── index.tsx           # Home
│   │   ├── search.tsx
│   │   ├── add-item.tsx        # entry point into the add-item wizard
│   │   ├── rentals.tsx         # "استئجارتي"
│   │   └── profile.tsx
│   ├── item/[id].tsx           # Item details
│   ├── booking/[itemId].tsx    # Booking flow
│   ├── my-items.tsx
│   ├── favorites.tsx
│   ├── chat/index.tsx          # conversations list
│   ├── chat/[id].tsx           # thread
│   ├── notifications.tsx
│   ├── review/[rentalId].tsx
│   ├── report.tsx
│   └── settings.tsx
├── src/
│   ├── components/             # ItemCard, CategoryPill, EmptyState, Skeleton, etc.
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── services/
│   │   │   ├── payment/        # PaymentService abstraction + mock provider
│   │   │   ├── location.ts     # distance calc + "800 متر / 1.4 كم" formatting
│   │   │   └── recommendations.ts  # simple "قد يهمك" based on search history
│   │   ├── hooks/               # useAuth, useLocation, useFavorites...
│   │   ├── i18n/                 # ar.ts (default), en.ts (stub), t()
│   │   └── theme/                 # colors, spacing, radius, typography
│   └── types/database.types.ts   # hand-written types mirroring the SQL schema
├── assets/
├── app.json / package.json / tsconfig.json / babel.config.js
└── supabase/
    ├── migrations/                # schema + RLS + functions, applied in order
    └── seed/seed.sql               # demo categories/areas/users/items

andi-admin/                         # separate Next.js app, desk-only
├── src/app/(dashboard)/users|items|rentals|reports|categories|analytics
└── src/lib/supabase-admin.ts       # service-role client, never shipped to mobile
```

## 4. Core user flows (kept to the fewest steps possible)

**Rent something:** open app → search/category → item card → item details → "استأجر
الآن" → pick dates (price recalculated live) → confirm → (mock) pay → chat opens with
owner automatically. 5 taps from home to a submitted request.

**List something:** tab "أضف غرض" → photos → title → category → description → price →
location (area only, picker) → availability → deposit → نشر. One linear wizard, no
account-type switch — anyone can list.

## 5. Database schema (see `supabase/migrations/0001_schema.sql`)

Tables: `profiles`, `areas`, `categories`, `items`, `item_images`, `item_blocked_dates`,
`favorites`, `rentals`, `security_deposits`, `payments`, `transactions`, `reviews`,
`conversations`, `messages`, `notifications`, `reports`, `verifications`,
`search_history`, `admin_users`.

Design notes:
- `profiles.id` = `auth.users.id` (1:1), created by a trigger on signup.
- Item location stored as `area_id` (coarse, public) + a *jittered* `approx_lat/approx_lng`
  for "800m / 1.4km" sorting; the owner's exact address is never stored on `items` at all —
  only exchanged later via chat once a rental is accepted, which matches "no exact location
  before booking is confirmed."
- `rentals.status` is a single enum driving both the renter's and owner's view:
  `pending → accepted → ready_for_pickup → active → returned → completed`, plus
  `rejected`/`cancelled` off-ramps.
- Money: commission is computed, not hardcoded in the UI — `platform_fee_percent` lives in
  a `platform_settings` row so it can change without a redeploy.
- `payments`/`transactions` are separate: `payments` is "did the renter's charge/refund
  succeed" (provider-facing), `transactions` is the internal ledger (owner payout minus
  commission) — needed later for payouts and admin GMV/commission analytics.
- Every FK from a "public" table back to `profiles` only exposes what RLS/select-lists
  allow (name, avatar, rating) — never phone/email directly; phone stays private and is
  only ever revealed through Auth, never through a joinable column exposed to other users.

## 6. Security & trust (MVP scope vs. designed-for-later)

Built now: phone OTP verification (Supabase Auth), profile rating aggregation, full
rental history, `security_deposits` table + flow, report user/item, RLS on every table
(no user can read/write another user's private rows), storage bucket policies scoping
uploads to the authenticated uploader's own folder.

Schema leaves room for (not built now, no shims required later): government ID
verification (`verifications.type` already an enum with room for `id_document`),
dispute system (`reports.status` already supports a review pipeline an admin can drive),
trust score (`profiles.trust_score numeric`, currently just phone-verified + rating-based,
computed by a Postgres function so the formula can change without a schema migration).

## 7. Business model

Commission-based: `platform_settings.commission_percent` (default 10%) is applied at
rental completion — `transactions` records the owner payout (subtotal − commission) and
the platform's cut. Admin analytics reads directly off `transactions`/`rentals`, so GMV
and commission are always real numbers, not a separate hand-maintained metric.

## 8. What's real vs. mocked in this MVP

- **Real, wired to Supabase:** auth, profiles, items + images (Storage), categories,
  search + filters, favorites, bookings/rentals with status transitions, reviews,
  notifications (rows + realtime), chat (Realtime), reports, RLS on all of it.
- **Deliberately mocked behind an interface (not fake data pretending to be real):**
  payment capture/refund (`MockPaymentProvider` — always "succeeds" after a delay, same
  shape a real CliQ/card driver will implement), SMS delivery for OTP (Supabase's own
  test/dev OTP path — swap the Auth provider config for a real SMS gateway in production,
  no app code change needed), push notifications (rows are created in `notifications` and
  read in-app/realtime; wiring Expo Push tokens is a follow-up, not a redesign).
