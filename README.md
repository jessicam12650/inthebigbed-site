# inthebigbed — Liverpool's dog platform

Next.js 14 (App Router) · TypeScript · Tailwind · Supabase auth, storage and Postgres.

## Brand

| Token       | Hex       | Use                                  |
| ----------- | --------- | ------------------------------------ |
| `cream`     | `#F2EDE6` | Default background                   |
| `ink`       | `#1C1C1A` | Text and dark sections               |
| `rust`      | `#D4845A` | Primary CTAs, accents                |
| `emergency` | `#C84B31` | **Find my dog** + 24/7 vet only      |
| `sage`      | `#6B9E7A` | Charity / positive / licence badges  |

Font: **DM Sans** via `next/font/google` (weights 400 / 700 / 900).

All interactive controls are sized to a 48px minimum tap target (WCAG 2.5.5).
`.btn-block-mobile` pairs with a `.btn-*` when a call-site wants a mobile
full-width button.

## Local setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Key                                | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`         | Supabase project URL                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Supabase publishable (anon) key        |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`  | Google Maps JS API key (`/places`)     |
| `NEXT_PUBLIC_MAILCHIMP_ACTION`     | Mailchimp form action URL (waitlist)   |
| `NEXT_PUBLIC_SITE_URL`             | Absolute origin for sitemap, robots, OG |

## Supabase

Paste `supabase/schema.sql` into the Supabase SQL editor (idempotent — safe
to re-run). It provisions:

- **`public.dogs`** — owner-scoped dog profiles (RLS: each user sees only
  their own rows).
- **`public.lost_dog_alerts`** — lost-dog reports. Anyone can insert
  (including panicked signed-out users); only authenticated users can read.
- **`public.booking_requests`** — owner → walker / boarder / groomer
  booking intents, RLS-scoped per owner, `provider_kind` check-constrained.
- **`storage.dog-photos`** (public bucket) — per-user dog photos, upload
  path scoped to `${auth.uid}/…`.
- **`storage.lost-dog-photos`** (public bucket) — photos attached to lost
  alerts.

The browser pages (`/profile`, `/lost`, `BookingRequests` panel, `BookingCTA`)
fall back gracefully to `localStorage` or quietly skip when a table isn't
provisioned yet, so dev still works before schema apply.

### Auth

Session refresh lives in `middleware.ts` using `@supabase/ssr`. The
middleware:

- Redirects unauthenticated visits to `/profile` → `/login?next=/profile`.
- Redirects already-signed-in users away from `/login` and `/signup`.
- Refreshes cookies on every non-asset request.

Email confirmation / OAuth callback: `app/auth/callback/route.ts`. Password
reset lives at `/forgot-password` (sends reset link) and `/reset-password`
(accepts the new password). Point Supabase Auth → URL Configuration at:

- **Site URL** → your deployment origin
- **Redirect URLs** → `<origin>/auth/callback` and `<origin>/reset-password`

## Routes

| Path                            | Description                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| `/`                             | Hero · feature grid · trust tiers · charity · Mailchimp waitlist        |
| `/walkers` · `/walkers/[id]`    | Verified walkers directory + per-walker profile with booking CTA        |
| `/boarding` · `/boarding/[id]`  | Licensed boarders directory + per-boarder profile                       |
| `/groomers` · `/groomers/[id]`  | Salons & mobile groomers + per-groomer profile                          |
| `/vets`                         | 24/7 emergency vet pinned at top in red, full vet directory below       |
| `/places`                       | Sticky Google Maps with dog-friendly venues. Pin click scrolls card into view and applies a 2-second rust border; the map stays visible throughout |
| `/lost`                         | Find my dog emergency form. Pre-fills the photo from the signed-in owner's most recent dog profile |
| `/login` · `/signup`            | Supabase email+password auth; signup accepts `?role=`, `?walker=`, `?boarder=` or `?groomer=` and carries the intent through to email confirmation |
| `/forgot-password` · `/reset-password` | Password reset via Supabase `resetPasswordForEmail` + `updateUser` |
| `/profile`                      | Owner dashboard — editable dog profiles with photo upload + "Your booking requests" list with cancel action |
| `/api/bookings`                 | `POST` — authenticated booking-request insert with provider-id validation |

Detail pages use `generateStaticParams` + `generateMetadata` so all 22
provider profiles prerender as static HTML and ship their own SEO metadata.

## Project layout

```
app/                 — Next.js App Router routes + global stylesheet
  api/bookings/      — Authenticated booking-request insert handler
  auth/callback/     — Supabase OAuth / email-confirmation handler
  <route>/layout.tsx — Per-route metadata (title, description, robots)
  opengraph-image.tsx — Edge-rendered 1200x630 social card
  sitemap.ts · robots.ts · not-found.tsx · error.tsx
components/          — Navigation, Footer, PageHeader, WaitlistForm,
                       TierBadge, Rating, FilterChip, FilterCheckbox,
                       EmptyState, BookingCTA, BookingRequests
data/                — Typed listings: walkers, boarders, groomers, vets, venues
lib/supabase.ts      — Browser Supabase client (singleton)
lib/supabase-server.ts — Server Supabase client (cookie-aware)
lib/useUser.ts       — Hook subscribed to onAuthStateChange
lib/database.types.ts — Reference row types for public.dogs + lost_dog_alerts
middleware.ts        — Session refresh + /profile gate
supabase/schema.sql  — Dogs, lost alerts, booking requests, buckets, RLS
legacy/              — Original static HTML (for reference only)
.github/workflows/   — CI: lint + typecheck + build on push/PR
```

## Scripts

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the built app
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

CI runs all three on every push and pull request using the Node version
pinned in `.nvmrc`.

## Deploy

Designed for Vercel but works on any Next.js host.

1. Push the branch and import the repo.
2. Set the environment variables from `.env.local.example` — including
   `NEXT_PUBLIC_SITE_URL` so sitemap, robots and OG metadata point at the
   right origin.
3. Apply `supabase/schema.sql` in the Supabase SQL editor.
4. In Supabase **Auth → URL Configuration**, set Site URL + add
   `<origin>/auth/callback` and `<origin>/reset-password` to Redirect URLs.
5. `vercel.json` already configures security headers (HSTS, X-Frame-Options,
   Referrer-Policy, Permissions-Policy) and 301 redirects from every legacy
   `*.html` path to its Next.js equivalent.

The OG image is generated at the edge from `app/opengraph-image.tsx`.
