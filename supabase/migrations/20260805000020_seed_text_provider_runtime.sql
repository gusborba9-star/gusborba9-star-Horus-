-- Canonical TEXT_GENERATION runtime configuration.
-- Pricing values are sourced from OpenRouter's public model catalog and verified on 2026-08-05.
insert into public.capabilities (id, display_name, category, enabled)
values ('TEXT_GENERATION', 'Text Generation', 'text', true)
on conflict (id) do update set display_name = excluded.display_name, category = excluded.category, enabled = true, updated_at = now();

insert into public.providers (id, display_name, status, priority, region, capabilities, health_score)
values ('openrouter', 'OpenRouter', 'ACTIVE', 10, 'global', '["TEXT_GENERATION"]'::jsonb, 0.5)
on conflict (id) do update set display_name = excluded.display_name, status = excluded.status, priority = excluded.priority, capabilities = excluded.capabilities, updated_at = now();

insert into public.models (
  id, provider_id, capability,
  input_price_per_million, output_price_per_million, currency,
  quality_score, latency_score, reliability_score, context_window,
  enabled, price_verified_at, canonical_slug,
  request_price, image_price, reasoning_price_per_million,
  cached_input_price_per_million, cache_write_price_per_million,
  max_completion_tokens, supported_parameters, input_modalities, output_modalities,
  expiration_date, metadata
)
values (
  'google/gemini-2.5-flash-lite', 'openrouter', 'TEXT_GENERATION',
  0.10, 0.40, 'USD',
  0.5, 0.5, 0.5, 1000000,
  true, now(), 'google/gemini-2.5-flash-lite',
  0, 0, 0, 0.01, 0.03,
  1048576,
  '["max_tokens","temperature","reasoning"]'::jsonb,
  '["text"]'::jsonb, '["text"]'::jsonb,
  now() + interval '7 days',
  '{"source":"https://openrouter.ai/google/gemini-2.5-flash-lite","pricing_verified":"2026-08-05","verification_note":"Public OpenRouter catalog price: $0.10/M input, $0.40/M output; cache read $0.01/M; cache write $0.03/M."}'::jsonb
)
on conflict (provider_id, id) do update set
  capability = excluded.capability,
  input_price_per_million = excluded.input_price_per_million,
  output_price_per_million = excluded.output_price_per_million,
  currency = excluded.currency,
  context_window = excluded.context_window,
  enabled = true,
  price_verified_at = excluded.price_verified_at,
  canonical_slug = excluded.canonical_slug,
  request_price = excluded.request_price,
  image_price = excluded.image_price,
  reasoning_price_per_million = excluded.reasoning_price_per_million,
  cached_input_price_per_million = excluded.cached_input_price_per_million,
  cache_write_price_per_million = excluded.cache_write_price_per_million,
  max_completion_tokens = excluded.max_completion_tokens,
  supported_parameters = excluded.supported_parameters,
  input_modalities = excluded.input_modalities,
  output_modalities = excluded.output_modalities,
  expiration_date = excluded.expiration_date,
  metadata = excluded.metadata,
  updated_at = now();

with snapshot as (
  insert into public.pricing_snapshots (source, source_endpoint, observed_at, model_count, payload_hash, metadata)
  values (
    'openrouter',
    'https://openrouter.ai/google/gemini-2.5-flash-lite',
    now(),
    1,
    md5('openrouter|google/gemini-2.5-flash-lite|0.10|0.40|0.01|0.03|2026-08-05'),
    '{"provider":"openrouter","model":"google/gemini-2.5-flash-lite","input_price_per_million_usd":0.10,"output_price_per_million_usd":0.40,"cached_input_price_per_million_usd":0.01,"cache_write_price_per_million_usd":0.03,"verified_date":"2026-08-05"}'::jsonb
  )
  on conflict (source, payload_hash) do update set observed_at = excluded.observed_at, model_count = excluded.model_count, metadata = excluded.metadata
  returning id
)
insert into public.provider_endpoint_history (
  snapshot_id, provider_id, model_id, endpoint_id, observed_at, enabled, context_length, pricing, limits, metadata
)
select
  snapshot.id,
  'openrouter',
  'google/gemini-2.5-flash-lite',
  'openrouter:google/gemini-2.5-flash-lite',
  now(), true, 1000000,
  '{"prompt_per_token":0.0000001,"completion_per_token":0.0000004,"request":0,"image":0,"internal_reasoning":0,"input_cache_read_per_token":0.00000001,"input_cache_write_per_token":0.00000003,"currency":"USD"}'::jsonb,
  '{"max_context_tokens":1000000}'::jsonb,
  '{"source":"openrouter","verified_date":"2026-08-05"}'::jsonb
from snapshot;
