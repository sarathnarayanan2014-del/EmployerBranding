-- ============================================================
-- HR Mitra Employer Brand Command Center — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Sets up: clients, per-client module data, and profiles that tie
-- Supabase Auth users to either an "admin" role or a single "company"
-- client via Row Level Security (RLS).
-- ============================================================

-- 1. CLIENTS -----------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  package text not null default 'Starter' check (package in ('Starter','Growth','360')),
  created_at timestamptz not null default now()
);

-- 2. PROFILES ------------------------------------------------------
-- One row per Supabase Auth user. role='admin' sees everything.
-- role='company' is scoped to exactly one client via client_id.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','company')),
  client_id uuid references public.clients(id) on delete set null,
  display_name text,
  created_at timestamptz not null default now()
);

-- 3. MODULE DATA ---------------------------------------------------
-- One row per client per module (assessment, evp, strategy, content,
-- advocacy, recruitment, assets, videos, internal, pipeline, ai,
-- dashboard/metrics). `data` holds that module's form/list/checklist
-- payload as JSONB so we don't need 12 separate tables.
create table if not exists public.module_data (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  module_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (client_id, module_id)
);

-- ============================================================
-- HELPER: fetch the caller's profile once, used inside policies
-- ============================================================
create or replace function public.current_role_is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.current_client_id()
returns uuid language sql stable security definer as $$
  select client_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.module_data enable row level security;

-- CLIENTS: admins do everything; company users can only read their own row
create policy "admin_full_access_clients" on public.clients
  for all using (public.current_role_is_admin()) with check (public.current_role_is_admin());

create policy "company_read_own_client" on public.clients
  for select using (id = public.current_client_id());

-- PROFILES: admins manage all profiles; users can read their own row
create policy "admin_full_access_profiles" on public.profiles
  for all using (public.current_role_is_admin()) with check (public.current_role_is_admin());

create policy "self_read_profile" on public.profiles
  for select using (id = auth.uid());

-- MODULE_DATA: admins do everything; company users read/write only their own client's rows
create policy "admin_full_access_module_data" on public.module_data
  for all using (public.current_role_is_admin()) with check (public.current_role_is_admin());

create policy "company_read_own_module_data" on public.module_data
  for select using (client_id = public.current_client_id());

create policy "company_write_own_module_data" on public.module_data
  for insert with check (client_id = public.current_client_id());

create policy "company_update_own_module_data" on public.module_data
  for update using (client_id = public.current_client_id())
  with check (client_id = public.current_client_id());

-- ============================================================
-- SEED: make yourself an admin after you sign up once via the app.
-- Replace the email below, then run this manually in the SQL editor.
-- ============================================================
-- insert into public.profiles (id, role, display_name)
-- select id, 'admin', 'HR Mitra Admin' from auth.users where email = 'you@hrmitra.example';
