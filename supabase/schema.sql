-- Cyber Incident Prioritization Engine - Supabase schema
-- Run this once in Supabase SQL Editor.

create table if not exists public.incidents (
  id text primary key,
  type text not null,
  title text not null,
  priority_score numeric not null default 0,
  risk_level text not null,
  status text not null,
  timestamp timestamptz not null,
  source_ip text,
  asset text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists incidents_priority_score_idx
  on public.incidents (priority_score desc);

create index if not exists incidents_timestamp_idx
  on public.incidents (timestamp desc);

create index if not exists incidents_source_ip_idx
  on public.incidents (source_ip);

create index if not exists incidents_asset_idx
  on public.incidents (asset);

create table if not exists public.soc_settings (
  id text primary key,
  weights jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.incidents enable row level security;
alter table public.soc_settings enable row level security;

-- Hackathon/demo policies. These allow the browser app to read/write using the anon key.
-- For production, replace these with authenticated policies and server-side writes.
drop policy if exists "demo incidents read" on public.incidents;
create policy "demo incidents read"
  on public.incidents for select
  to anon
  using (true);

drop policy if exists "demo incidents insert" on public.incidents;
create policy "demo incidents insert"
  on public.incidents for insert
  to anon
  with check (true);

drop policy if exists "demo incidents update" on public.incidents;
create policy "demo incidents update"
  on public.incidents for update
  to anon
  using (true)
  with check (true);

drop policy if exists "demo incidents delete" on public.incidents;
create policy "demo incidents delete"
  on public.incidents for delete
  to anon
  using (true);

drop policy if exists "demo settings read" on public.soc_settings;
create policy "demo settings read"
  on public.soc_settings for select
  to anon
  using (true);

drop policy if exists "demo settings insert" on public.soc_settings;
create policy "demo settings insert"
  on public.soc_settings for insert
  to anon
  with check (true);

drop policy if exists "demo settings update" on public.soc_settings;
create policy "demo settings update"
  on public.soc_settings for update
  to anon
  using (true)
  with check (true);
