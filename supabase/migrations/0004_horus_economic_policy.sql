-- Hórus Foundation 0004
-- Economic policy is system-owned and intentionally not exposed to clients.

create table if not exists public.fx_rates (
  base_currency text not null,
  quote_currency text not null,
  rate numeric(20,10) not null check (rate > 0),
  source text not null check (length(trim(source)) > 0),
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (base_currency, quote_currency),
  check (base_currency <> quote_currency)
);

create table if not exists public.economic_policy (
  id boolean primary key default true check (id = true),
  exchange_buffer_rate numeric(10,6) not null check (exchange_buffer_rate >= 0),
  safety_buffer_rate numeric(10,6) not null check (safety_buffer_rate >= 0),
  infrastructure_rate numeric(10,6) not null check (infrastructure_rate >= 0),
  platform_margin_rate numeric(10,6) not null check (platform_margin_rate >= 0),
  credit_brl_value numeric(20,8) not null check (credit_brl_value > 0),
  updated_at timestamptz not null default now()
);

alter table public.fx_rates enable row level security;
alter table public.economic_policy enable row level security;

revoke select, insert, update, delete on public.fx_rates from anon, authenticated;
revoke select, insert, update, delete on public.economic_policy from anon, authenticated;
