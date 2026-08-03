-- Hórus Foundation 0000
-- Clean identity prerequisites for the currently empty production database.
-- This migration is not a legacy compatibility layer.

create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  role text not null default 'member' check (role in ('owner','admin','member')),
  full_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists users_organization_idx on public.users(organization_id);
create index if not exists organization_memberships_user_idx on public.organization_memberships(user_id, organization_id);

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.organization_memberships enable row level security;

create policy organizations_select_member on public.organizations
  for select to authenticated
  using (id in (select om.organization_id from public.organization_memberships om where om.user_id = (select auth.uid())));

create policy users_select_own on public.users
  for select to authenticated
  using (id = (select auth.uid()));

create policy memberships_select_own on public.organization_memberships
  for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function private.ensure_horus_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_name text;
  v_email text;
begin
  v_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Hórus User');
  v_email := coalesce(new.email, new.id::text || '@invalid.local');

  insert into public.organizations(name)
  values (v_name)
  returning id into v_org;

  insert into public.users(id, organization_id, role, full_name, email)
  values (new.id, v_org, 'owner', nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), v_email);

  insert into public.organization_memberships(organization_id, user_id, role)
  values (v_org, new.id, 'owner');

  return new;
end;
$$;

revoke all on function private.ensure_horus_identity() from public;
revoke all on function private.ensure_horus_identity() from anon, authenticated;

drop trigger if exists on_auth_user_created_horus on auth.users;
create trigger on_auth_user_created_horus
after insert on auth.users
for each row execute function private.ensure_horus_identity();
