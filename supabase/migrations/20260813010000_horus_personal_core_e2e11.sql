-- Hórus Personal E2E 11: canonical product-domain primitives.
-- Applied to production before repository registration to preserve DB-first safety.

create table if not exists public.personal_personas (
  id text primary key,
  display_name text not null unique,
  locale text not null default 'pt-BR',
  voice_profile jsonb not null default '{}'::jsonb,
  personality_profile jsonb not null default '{}'::jsonb,
  communication_profile jsonb not null default '{}'::jsonb,
  behavior_profile jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.personal_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  persona_id text not null references public.personal_personas(id),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','CANCELLED')),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.personal_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null check (tier in ('PERSONAL','PERSONAL_PRO','PERSONAL_PRIME')),
  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','PAST_DUE','PAUSED','CANCELLED','EXPIRED')),
  economic_profile text,
  external_customer_id text,
  external_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists personal_subscriptions_one_live_per_user
  on public.personal_subscriptions(user_id)
  where status in ('PENDING','ACTIVE','PAST_DUE','PAUSED');

create table if not exists public.personal_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_key_hash text not null,
  platform text not null check (platform in ('ANDROID','IOS','WEB','OTHER')),
  app_version text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','REVOKED','EXPIRED')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, device_key_hash)
);

create table if not exists public.personal_capability_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capability_id text not null references public.capabilities(id),
  scope jsonb not null default '{}'::jsonb,
  autonomy text not null default 'SUGGEST' check (autonomy in ('READ','SUGGEST','PREPARE','EXECUTE','AUTONOMOUS')),
  confirmation_required boolean not null default true,
  status text not null default 'GRANTED' check (status in ('GRANTED','REVOKED')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists personal_capability_grants_one_active
  on public.personal_capability_grants(user_id, capability_id)
  where status = 'GRANTED';

create table if not exists public.personal_permission_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id uuid references public.personal_capability_grants(id) on delete set null,
  capability_id text not null references public.capabilities(id),
  action text not null check (action in ('GRANT','REVOKE','UPDATE','CHECK','DENY')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.personal_personas (id, display_name, voice_profile, personality_profile, communication_profile, behavior_profile)
values
 ('aline','Aline','{"gender":"female","locale":"pt-BR","fallback_required":true}','{"archetype":"proactive_personal","warmth":"balanced"}','{"formality":"natural","rhythm":"fluid"}','{"proactivity":"high","intervention":"contextual"}'),
 ('luiza','Luiza','{"gender":"female","locale":"pt-BR","fallback_required":true}','{"archetype":"organized_personal","warmth":"balanced"}','{"formality":"natural","rhythm":"structured"}','{"proactivity":"medium","intervention":"contextual"}'),
 ('iris','Íris','{"gender":"female","locale":"pt-BR","fallback_required":true}','{"archetype":"analytical_personal","warmth":"balanced"}','{"formality":"natural","rhythm":"precise"}','{"proactivity":"medium","intervention":"selective"}'),
 ('clara','Clara','{"gender":"female","locale":"pt-BR","fallback_required":true}','{"archetype":"supportive_personal","warmth":"balanced"}','{"formality":"natural","rhythm":"fluid"}','{"proactivity":"medium","intervention":"contextual"}'),
 ('bel','Bel','{"gender":"female","locale":"pt-BR","fallback_required":true}','{"archetype":"energetic_personal","warmth":"balanced"}','{"formality":"natural","rhythm":"dynamic"}','{"proactivity":"high","intervention":"contextual"}'),
 ('lucia','Lúcia','{"gender":"female","locale":"pt-BR","fallback_required":true}','{"archetype":"calm_personal","warmth":"balanced"}','{"formality":"natural","rhythm":"measured"}','{"proactivity":"low","intervention":"selective"}')
on conflict (id) do nothing;

alter table public.personal_personas enable row level security;
alter table public.personal_profiles enable row level security;
alter table public.personal_subscriptions enable row level security;
alter table public.personal_devices enable row level security;
alter table public.personal_capability_grants enable row level security;
alter table public.personal_permission_audit enable row level security;

create policy personal_personas_select_enabled on public.personal_personas for select using (enabled = true);
create policy personal_profiles_select_own on public.personal_profiles for select using (user_id = auth.uid());
create policy personal_profiles_insert_own on public.personal_profiles for insert with check (user_id = auth.uid());
create policy personal_profiles_update_own on public.personal_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy personal_subscriptions_select_own on public.personal_subscriptions for select using (user_id = auth.uid());
create policy personal_devices_select_own on public.personal_devices for select using (user_id = auth.uid());
create policy personal_devices_insert_own on public.personal_devices for insert with check (user_id = auth.uid());
create policy personal_devices_update_own on public.personal_devices for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy personal_capability_grants_select_own on public.personal_capability_grants for select using (user_id = auth.uid());
create policy personal_capability_grants_insert_own on public.personal_capability_grants for insert with check (user_id = auth.uid());
create policy personal_capability_grants_update_own on public.personal_capability_grants for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy personal_permission_audit_select_own on public.personal_permission_audit for select using (user_id = auth.uid());

create or replace function public.touch_personal_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_personal_personas_updated_at on public.personal_personas;
create trigger trg_personal_personas_updated_at before update on public.personal_personas for each row execute function public.touch_personal_updated_at();
drop trigger if exists trg_personal_profiles_updated_at on public.personal_profiles;
create trigger trg_personal_profiles_updated_at before update on public.personal_profiles for each row execute function public.touch_personal_updated_at();
drop trigger if exists trg_personal_subscriptions_updated_at on public.personal_subscriptions;
create trigger trg_personal_subscriptions_updated_at before update on public.personal_subscriptions for each row execute function public.touch_personal_updated_at();
drop trigger if exists trg_personal_devices_updated_at on public.personal_devices;
create trigger trg_personal_devices_updated_at before update on public.personal_devices for each row execute function public.touch_personal_updated_at();
drop trigger if exists trg_personal_capability_grants_updated_at on public.personal_capability_grants;
create trigger trg_personal_capability_grants_updated_at before update on public.personal_capability_grants for each row execute function public.touch_personal_updated_at();
