-- Provider/model registry. Pricing is data, not application code.

create table if not exists public.providers (
  id text primary key,
  display_name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'DEGRADED', 'DISABLED')),
  priority integer not null default 100,
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
  capability text not null,
  input_price_per_million numeric(20,8) not null check (input_price_per_million >= 0),
  output_price_per_million numeric(20,8) not null check (output_price_per_million >= 0),
  currency text not null check (currency in ('USD', 'BRL')),
  quality_score numeric(6,5) not null default 0 check (quality_score between 0 and 1),
  latency_score numeric(6,5) not null default 0 check (latency_score between 0 and 1),
  reliability_score numeric(6,5) not null default 0 check (reliability_score between 0 and 1),
  context_window integer,
  enabled boolean not null default true,
  price_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider_id, id)
);

create index if not exists models_capability_enabled_idx on public.models(capability, enabled);
create index if not exists models_provider_enabled_idx on public.models(provider_id, enabled);

alter table public.providers enable row level security;
alter table public.models enable row level security;

create policy providers_select_authenticated on public.providers
  for select to authenticated using (status <> 'DISABLED');

create policy models_select_authenticated on public.models
  for select to authenticated using (enabled = true);

-- Provider/model mutations are privileged system operations only.
