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
