-- Public payment webhook ingress: replay/idempotency boundary without storing raw provider payloads.
create table if not exists public.horus_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payload_hash text not null,
  status text not null default 'RECEIVED',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint horus_webhook_events_provider_event_unique unique (provider, event_id),
  constraint horus_webhook_events_status_check check (status in ('RECEIVED','PROCESSED','REJECTED'))
);

alter table public.horus_webhook_events enable row level security;
revoke all on table public.horus_webhook_events from anon, authenticated;
grant all on table public.horus_webhook_events to service_role;
create index if not exists horus_webhook_events_received_idx on public.horus_webhook_events (received_at desc);
