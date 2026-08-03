-- Hórus Foundation 0003
-- Provider, capability and model registry. Secrets never belong in this schema.

create table if not exists public.capabilities (
  id text primary key,
  display_name text not null,
  category text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id text primary key,
  display_name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','DEGRADED','DISABLED')),
  priority integer not null default 100 check (priority >= 0),
  region text,
  capabilities jsonb not null default '[]'::jsonb,
  health_score numeric(6,5) not null default 1 check (health_score between 0 and 1),
  last_health_check timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.models (
  id text not null,
  provider_id text not null references public.providers(id) on delete cascade,
  capability text not null references public.capabilities(id) on delete restrict,
  input_price_per_million numeric(20,8) not null check (input_price_per_million >= 0),
  output_price_per_million numeric(20,8) not null check (output_price_per_million >= 0),
  currency text not null check (currency in ('USD','BRL')),
  quality_score numeric(6,5) not null default 0 check (quality_score between 0 and 1),
  latency_score numeric(6,5) not null default 0 check (latency_score between 0 and 1),
  reliability_score numeric(6,5) not null default 0 check (reliability_score between 0 and 1),
  context_window integer check (context_window is null or context_window > 0),
  enabled boolean not null default true,
  price_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider_id, id)
);

create index if not exists providers_status_priority_idx on public.providers(status, priority);
create index if not exists models_capability_enabled_idx on public.models(capability, enabled);
create index if not exists models_provider_enabled_idx on public.models(provider_id, enabled);

alter table public.capabilities enable row level security;
alter table public.providers enable row level security;
alter table public.models enable row level security;

create policy capabilities_select_authenticated on public.capabilities
  for select to authenticated using (enabled = true);

create policy providers_select_authenticated on public.providers
  for select to authenticated using (status <> 'DISABLED');

create policy models_select_authenticated on public.models
  for select to authenticated using (enabled = true);

-- Registry data is system-owned. Clients can read active entries but cannot mutate them.
revoke insert, update, delete on public.capabilities from anon, authenticated;
revoke insert, update, delete on public.providers from anon, authenticated;
revoke insert, update, delete on public.models from anon, authenticated;
