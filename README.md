# inthebigbed — Liverpool's dog platform

Next.js 14 (App Router) · TypeScript · Tailwind · Supabase auth & storage.

## Brand

| Token       | Hex       | Use                                  |
| ----------- | --------- | ------------------------------------ |
| `cream`     | `#F2EDE6` | Default background                   |
| `ink`       | `#1C1C1A` | Text and dark sections               |
| `rust`      | `#D4845A` | Primary CTAs, accents                |
| `emergency` | `#C84B31` | **Find my dog** + 24/7 vet only      |
| `sage`      | `#6B9E7A` | Charity / positive / licence badges  |

Font: **DM Sans** via `next/font/google` (weights 400 / 700 / 900).

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

## Supabase

Paste `supabase/schema.sql` into the Supabase SQL editor to create:

- `public.dogs` (owner-scoped dog profiles, RLS enabled)
- `storage.dog-photos` bucket for per-user photo uploads
- Row-level policies so each owner only sees their own dogs / their own photos

`/profile` reads and writes against `public.dogs` once the table exists. Until
it does, it falls back to `localStorage` in the browser so the dashboard keeps
working in development.

### Auth

Session refresh happens in `middleware.ts` using `@supabase/ssr`. The middleware:

- Redirects unauthenticated visits to `/profile` to `/login?next=/profile`.
- Redirects already-signed-in users away from `/login` and `/signup`.
- Refreshes cookies on every non-asset request.

The OAuth/email confirmation callback lives at `app/auth/callback/route.ts`.
Point Supabase Auth "Site URL" at your deployment and "Redirect URLs" at
`https://<your-domain>/auth/callback`.

## Routes

| Path         | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| `/`          | Hero · feature grid · trust tiers · charity · Mailchimp waitlist            |
| `/walkers`   | Verified walkers — search + tier + available-now filters                    |
| `/boarding`  | Licensed boarders & daycare — tier + enclosed-garden + available-now        |
| `/groomers`  | Salons & mobile groomers — search + salon/mobile + available filter         |
| `/vets`      | 24/7 emergency vet pinned at top in red, full vet directory below           |
| `/places`    | Google Maps of dog-friendly venues (clicking a pin scrolls + highlights)    |
| `/lost`      | Find my dog emergency form                                                  |
| `/login`     | Supabase email+password sign-in (honours `?next=` redirect)                 |
| `/signup`    | Email+password + role selection (owner / walker / boarder / groomer)        |
| `/profile`   | Owner dashboard — editable dog profiles with per-dog photo upload           |

## Project layout

```
app/                 — Next.js App Router routes + global stylesheet
components/          — Navigation, Footer, WaitlistForm, TierBadge, Rating, PageHeader
data/                — Typed listings: walkers, boarders, groomers, vets, venues
lib/supabase.ts      — Browser Supabase client (singleton)
lib/supabase-server.ts — Server Supabase client (for route handlers / RSC)
middleware.ts        — Session refresh + /profile gate
supabase/schema.sql  — Dogs table, storage bucket, RLS policies
legacy/              — Original static HTML (for reference only)
```

## Scripts

```bash
npm run dev    # http://localhost:3000
npm run build  # production build
npm run start  # serve the built app
npm run lint   # next lint
```
