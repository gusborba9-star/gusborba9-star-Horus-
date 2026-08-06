-- Canonical TEXT_GENERATION runtime configuration.
-- Pricing values are sourced from OpenRouter's public model catalog and verified on 2026-08-05.
insert into public.capabilities (id, display_name, category, enabled)
select 'TEXT_GENERATION', 'Text Generation', 'text', true
where not exists (select 1 from public.capabilities where id = 'TEXT_GENERATION');

update public.capabilities set display_name = 'Text Generation', category = 'text', enabled = true, updated_at = now() where id = 'TEXT_GENERATION';

insert into public.providers (id, display_name, status, priority, region, capabilities, health_score)
select 'openrouter', 'OpenRouter', 'ACTIVE', 10, 'global', '["TEXT_GENERATION"]'::jsonb, 0.5
where not exists (select 1 from public.providers where id = 'openrouter');

update public.providers set display_name = 'OpenRouter', status = 'ACTIVE', priority = 10, capabilities = '["TEXT_GENERATION"]'::jsonb, updated_at = now() where id = 'openrouter';

insert into public.models (
  id, provider_id, capability, input_price_per_million, output_price_per_million, currency,
  quality_score, latency_score, reliability_score, context_window, enabled, price_verified_at,
  canonical_slug, request_price, image_price, reasoning_price_per_million, cached_input_price_per_million,
  cache_write_price_per_million, max_completion_tokens, supported_parameters, input_modalities,
  output_modalities, expiration_date, metadata
)
select
  'google/gemini-2.5-flash-lite', 'openrouter', 'TEXT_GENERATION', 0.10, 0.40, 'USD',
  0.5, 0.5, 0.5, 1000000, true, now(), 'google/gemini-2.5-flash-lite',
  0, 0, 0, 0.01, 0.03, 1048576,
  '["max_tokens","temperature","reasoning"]'::jsonb, '["text"]'::jsonb, '["text"]'::jsonb,
  now() + interval '7 days',
  '{"source":"https://openrouter.ai/google/gemini-2.5-flash-lite","pricing_verified":"2026-08-05","verification_note":"Public OpenRouter catalog price: $0.10/M input, $0.40/M output; cache read $0.01/M; cache write $0.03/M."}'::jsonb
where not exists (select 1 from public.models where provider_id = 'openrouter' and id = 'google/gemini-2.5-flash-lite');

update public.models set
  capability = 'TEXT_GENERATION', input_price_per_million = 0.10, output_price_per_million = 0.40, currency = 'USD',
  context_window = 1000000, enabled = true, price_verified_at = now(), canonical_slug = 'google/gemini-2.5-flash-lite',
  request_price = 0, image_price = 0, reasoning_price_per_million = 0, cached_input_price_per_million = 0.01,
  cache_write_price_per_million = 0.03, max_completion_tokens = 1048576,
  supported_parameters = '["max_tokens","temperature","reasoning"]'::jsonb, input_modalities = '["text"]'::jsonb,
  output_modalities = '["text"]'::jsonb, expiration_date = now() + interval '7 days',
  metadata = '{"source":"https://openrouter.ai/google/gemini-2.5-flash-lite","pricing_verified":"2026-08-05"}'::jsonb,
  updated_at = now()
where provider_id = 'openrouter' and id = 'google/gemini-2.5-flash-lite';

insert into public.pricing_snapshots (source, source_endpoint, observed_at, model_count, payload_hash, metadata)
select
  'openrouter', 'https://openrouter.ai/google/gemini-2.5-flash-lite', now(), 1,
  md5('openrouter|google/gemini-2.5-flash-lite|0.10|0.40|0.01|0.03|2026-08-05'),
  '{"provider":"openrouter","model":"google/gemini-2.5-flash-lite","input_price_per_million_usd":0.10,"output_price_per_million_usd":0.40,"cached_input_price_per_million_usd":0.01,"cache_write_price_per_million_usd":0.03,"verified_date":"2026-08-05"}'::jsonb
where not exists (select 1 from public.pricing_snapshots where source='openrouter' and payload_hash=md5('openrouter|google/gemini-2.5-flash-lite|0.10|0.40|0.01|0.03|2026-08-05'));

insert into public.provider_endpoint_history (
  snapshot_id, provider_id, model_id, endpoint_id, observed_at, enabled, context_length, pricing, limits, metadata
)
select
  ps.id, 'openrouter', 'google/gemini-2.5-flash-lite', 'openrouter:google/gemini-2.5-flash-lite', now(), true, 1000000,
  '{"prompt_per_token":0.0000001,"completion_per_token":0.0000004,"request":0,"image":0,"internal_reasoning":0,"input_cache_read_per_token":0.00000001,"input_cache_write_per_token":0.00000003,"currency":"USD"}'::jsonb,
  '{"max_context_tokens":1000000}'::jsonb,
  '{"source":"openrouter","verified_date":"2026-08-05"}'::jsonb
from public.pricing_snapshots ps
where ps.source='openrouter'
  and ps.payload_hash=md5('openrouter|google/gemini-2.5-flash-lite|0.10|0.40|0.01|0.03|2026-08-05')
  and not exists (
    select 1 from public.provider_endpoint_history peh
    where peh.snapshot_id=ps.id and peh.provider_id='openrouter' and peh.model_id='google/gemini-2.5-flash-lite'
      and peh.endpoint_id='openrouter:google/gemini-2.5-flash-lite'
  );
