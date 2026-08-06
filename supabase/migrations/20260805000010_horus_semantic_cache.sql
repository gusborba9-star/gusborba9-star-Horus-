create table if not exists public.horus_semantic_cache_entries (
  id uuid primary key default gen_random_uuid(),
  owner_scope text not null,
  semantic_key text not null,
  embedding jsonb not null,
  event_type text not null,
  source text not null default '',
  capability text not null,
  provider_id text not null,
  model_id text not null,
  endpoint_id text,
  pricing_snapshot_id uuid,
  response_text text not null,
  usage jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  invalidated_at timestamptz,
  constraint horus_semantic_cache_key_scope_unique unique (owner_scope, semantic_key)
);

create index if not exists horus_semantic_cache_lookup_idx
  on public.horus_semantic_cache_entries(owner_scope, provider_id, model_id, endpoint_id, expires_at)
  where invalidated_at is null;

create index if not exists horus_semantic_cache_snapshot_idx
  on public.horus_semantic_cache_entries(pricing_snapshot_id)
  where invalidated_at is null;

alter table public.horus_semantic_cache_entries enable row level security;

-- Cache writes/reads are server-side only through the service-role client.
-- No authenticated direct policy is intentionally exposed.
