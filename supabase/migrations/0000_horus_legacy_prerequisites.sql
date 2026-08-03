-- Compatibility prerequisites for the existing schema while migrations are consolidated.
-- This migration is intentionally additive.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stripe_customer_id varchar(255),
  plan_tier varchar(50) not null default 'free',
  agents_limit integer not null default 1,
  multimodal_credits bigint not null default 0
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  role varchar(50) not null default 'member',
  full_name varchar(255),
  email varchar(255) unique not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.users enable row level security;
