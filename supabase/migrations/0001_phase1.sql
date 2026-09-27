create extension if not exists pgcrypto;

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios','android','web')),
  location_id text check (location_id in ('friendswood','webster')),
  topics jsonb not null default '{"events":true,"seasonal":true,"rewards":true}'::jsonb,
  location_opt_ins jsonb not null default '{"friendswood":true,"webster":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  payload jsonb not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.seasonal_features (
  id text primary key default 'current',
  payload jsonb not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.location_content (
  id text primary key check (id in ('friendswood','webster')),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.scheduled_pushes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  route text,
  audience jsonb not null default '{"scope":"all"}'::jsonb,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.toast_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;
alter table public.events enable row level security;
alter table public.seasonal_features enable row level security;
alter table public.location_content enable row level security;
alter table public.scheduled_pushes enable row level security;
alter table public.toast_cache enable row level security;

create policy "public can read published events"
on public.events for select
to anon, authenticated
using (published = true);

create policy "public can read seasonal feature"
on public.seasonal_features for select
to anon, authenticated
using (published = true);

create policy "public can read location content"
on public.location_content for select
to anon, authenticated
using (true);

-- No public write policies exist. Push tokens, scheduling, admin content, and
-- Toast cache are written only by Edge Functions using SUPABASE_SERVICE_ROLE_KEY.
