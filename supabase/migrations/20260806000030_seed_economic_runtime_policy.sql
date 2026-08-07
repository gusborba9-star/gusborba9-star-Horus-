-- Canonical operational economic policy bootstrap.
-- Rates are explicit policy configuration, not provider pricing.
-- FX uses the latest verified BCB PTAX close available to this deployment window (2026-07-27: R$5.1005/USD sell rate).
insert into public.fx_rates (base_currency, quote_currency, rate, source, verified_at, expires_at)
values ('USD','BRL',5.1005,'BCB PTAX / Refinitiv close 2026-07-27',now(),now()+interval '7 days')
on conflict (base_currency,quote_currency) do update set rate=excluded.rate, source=excluded.source, verified_at=excluded.verified_at, expires_at=excluded.expires_at;

insert into public.fx_snapshots (source,base_currency,quote_currency,rate,observed_at,payload_hash)
values ('BCB PTAX / Refinitiv','USD','BRL',5.1005,now(),md5('BCB-PTAX|2026-07-27|USD|BRL|5.1005'))
on conflict do nothing;

insert into public.economic_policy (
  id, exchange_buffer_rate, safety_buffer_rate, infrastructure_rate, platform_margin_rate, credit_brl_value,
  target_gross_margin_rate, minimum_gross_margin_rate, provider_fee_rate, fx_buffer_rate,
  pricing_drift_buffer_rate, usage_uncertainty_rate, retry_reserve_rate, failure_reserve_rate,
  global_execution_enabled, version
)
values (true,0.03,0.05,0.02,0.30,0.01,0.70,0.60,0,0,0,0,0,0,true,1)
on conflict (id) do update set
  exchange_buffer_rate=excluded.exchange_buffer_rate,
  safety_buffer_rate=excluded.safety_buffer_rate,
  infrastructure_rate=excluded.infrastructure_rate,
  platform_margin_rate=excluded.platform_margin_rate,
  credit_brl_value=excluded.credit_brl_value,
  target_gross_margin_rate=excluded.target_gross_margin_rate,
  minimum_gross_margin_rate=excluded.minimum_gross_margin_rate,
  provider_fee_rate=excluded.provider_fee_rate,
  fx_buffer_rate=excluded.fx_buffer_rate,
  pricing_drift_buffer_rate=excluded.pricing_drift_buffer_rate,
  usage_uncertainty_rate=excluded.usage_uncertainty_rate,
  retry_reserve_rate=excluded.retry_reserve_rate,
  failure_reserve_rate=excluded.failure_reserve_rate,
  global_execution_enabled=excluded.global_execution_enabled,
  version=excluded.version,
  updated_at=now();

insert into public.economic_policy_versions (
  version,target_gross_margin_rate,minimum_gross_margin_rate,provider_fee_rate,exchange_buffer_rate,
  fx_buffer_rate,pricing_drift_buffer_rate,safety_buffer_rate,infrastructure_rate,usage_uncertainty_rate,
  retry_reserve_rate,failure_reserve_rate,credit_brl_value,global_execution_enabled,snapshot
)
values (1,0.70,0.60,0,0.03,0,0,0.05,0.02,0,0,0,0.01,true,'{"source":"bootstrap-operational-policy","fx_source":"BCB PTAX","fx_reference_date":"2026-07-27","usd_brl":5.1005}'::jsonb)
on conflict (version) do nothing;
