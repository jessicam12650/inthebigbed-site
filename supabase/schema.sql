-- inthebigbed — Supabase schema
--
-- Run this in the Supabase SQL editor for project cvhutjpxflynrfcvszdy.
-- Idempotent: safe to re-run.

-- ─── dogs ───────────────────────────────────────────────────────────────────
create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  breed text default '',
  age text default '',
  size text default '',
  notes text default '',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dogs_user_id_idx on public.dogs (user_id);

alter table public.dogs enable row level security;

drop policy if exists "dogs_select_own" on public.dogs;
create policy "dogs_select_own"
  on public.dogs for select
  using (auth.uid() = user_id);

drop policy if exists "dogs_insert_own" on public.dogs;
create policy "dogs_insert_own"
  on public.dogs for insert
  with check (auth.uid() = user_id);

drop policy if exists "dogs_update_own" on public.dogs;
create policy "dogs_update_own"
  on public.dogs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "dogs_delete_own" on public.dogs;
create policy "dogs_delete_own"
  on public.dogs for delete
  using (auth.uid() = user_id);

-- ─── storage: dog photos ────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('dog-photos', 'dog-photos', true)
on conflict (id) do nothing;

drop policy if exists "dog-photos read" on storage.objects;
create policy "dog-photos read"
  on storage.objects for select
  using (bucket_id = 'dog-photos');

drop policy if exists "dog-photos insert own" on storage.objects;
create policy "dog-photos insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'dog-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "dog-photos update own" on storage.objects;
create policy "dog-photos update own"
  on storage.objects for update
  using (
    bucket_id = 'dog-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "dog-photos delete own" on storage.objects;
create policy "dog-photos delete own"
  on storage.objects for delete
  using (
    bucket_id = 'dog-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── lost_dog_alerts ────────────────────────────────────────────────────────
-- Anyone can submit an alert (including signed-out users in a panic). Only
-- authenticated users can browse alerts. The reporter's phone number is
-- stored server-side and never exposed via a public view; surface a redacted
-- view in the app layer instead.
create table if not exists public.lost_dog_alerts (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users (id) on delete set null,
  dog_name text not null,
  last_location text not null,
  phone text not null,
  photo_url text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists lost_dog_alerts_created_idx
  on public.lost_dog_alerts (created_at desc);

alter table public.lost_dog_alerts enable row level security;

drop policy if exists "lost_alerts_insert_any" on public.lost_dog_alerts;
create policy "lost_alerts_insert_any"
  on public.lost_dog_alerts for insert
  with check (true);

drop policy if exists "lost_alerts_select_auth" on public.lost_dog_alerts;
create policy "lost_alerts_select_auth"
  on public.lost_dog_alerts for select
  using (auth.role() = 'authenticated');

drop policy if exists "lost_alerts_update_reporter" on public.lost_dog_alerts;
create policy "lost_alerts_update_reporter"
  on public.lost_dog_alerts for update
  using (reporter_id is not null and auth.uid() = reporter_id)
  with check (reporter_id is not null and auth.uid() = reporter_id);

-- ─── storage: lost dog photos ──────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('lost-dog-photos', 'lost-dog-photos', true)
on conflict (id) do nothing;

drop policy if exists "lost-photos read" on storage.objects;
create policy "lost-photos read"
  on storage.objects for select
  using (bucket_id = 'lost-dog-photos');

drop policy if exists "lost-photos insert any" on storage.objects;
create policy "lost-photos insert any"
  on storage.objects for insert
  with check (bucket_id = 'lost-dog-photos');

-- ─── booking_requests ──────────────────────────────────────────────────────
-- A lightweight record of an owner's intent to book a provider. The provider
-- catalogue lives in the app's data files, not in Postgres, so provider_id
-- is an opaque string keyed against walkers.ts / boarders.ts / groomers.ts.
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_kind text not null check (provider_kind in ('walker', 'boarder', 'groomer')),
  provider_id text not null,
  message text default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists booking_requests_user_idx
  on public.booking_requests (user_id, created_at desc);

alter table public.booking_requests enable row level security;

drop policy if exists "booking_requests_select_own" on public.booking_requests;
create policy "booking_requests_select_own"
  on public.booking_requests for select
  using (auth.uid() = user_id);

drop policy if exists "booking_requests_insert_own" on public.booking_requests;
create policy "booking_requests_insert_own"
  on public.booking_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "booking_requests_update_own" on public.booking_requests;
create policy "booking_requests_update_own"
  on public.booking_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── booking_requests: enquiry-form migration (2026-04-28) ─────────────────
-- Widen the table for the public enquiry form: guest details, dog details,
-- date range, provider name snapshot. Allow user_id to be NULL so guests
-- (unauthenticated visitors) can submit. Widen provider_kind CHECK to
-- include 'daycare'. Open INSERTs to anyone; SELECT stays owner-only.
alter table public.booking_requests
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  add column if not exists dog_name text,
  add column if not exists dog_breed text,
  add column if not exists dog_size text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists provider_name text;

alter table public.booking_requests
  alter column user_id drop not null;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'booking_requests_provider_kind_check'
      and conrelid = 'public.booking_requests'::regclass
  ) then
    alter table public.booking_requests
      drop constraint booking_requests_provider_kind_check;
  end if;
end $$;

alter table public.booking_requests
  add constraint booking_requests_provider_kind_check
  check (provider_kind in ('walker', 'boarder', 'groomer', 'daycare'));

drop policy if exists "booking_requests_insert_own" on public.booking_requests;
drop policy if exists "booking_requests_insert_any" on public.booking_requests;
create policy "booking_requests_insert_any"
  on public.booking_requests for insert
  with check (true);

drop policy if exists "booking_requests_delete_own" on public.booking_requests;
create policy "booking_requests_delete_own"
  on public.booking_requests for delete
  using (user_id is not null and auth.uid() = user_id);
