import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models?output_modalities=all';

interface OpenRouterModel {
  id: string;
  canonical_slug?: string;
  name?: string;
  context_length?: number;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing?: {
    prompt?: string;
    completion?: string;
    request?: string;
    image?: string;
    web_search?: string;
    internal_reasoning?: string;
    input_cache_read?: string;
    input_cache_write?: string;
  };
  supported_parameters?: string[];
  top_provider?: {
    max_completion_tokens?: number;
    context_length?: number;
  };
  expiration_date?: string | null;
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

type ParsedPrice = { known: true; valuePerToken: number } | { known: false };

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_SERVER_CONFIGURATION_MISSING');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function parsePrice(value: string | undefined | null): ParsedPrice {
  if (value == null || value === '') return { known: false };
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`INVALID_OPENROUTER_PRICE:${value}`);
  return { known: true, valuePerToken: parsed };
}

function requirePrice(price: ParsedPrice, field: string): number {
  if (!price.known) throw new Error(`OPENROUTER_PRICE_UNKNOWN:${field}`);
  return price.valuePerToken;
}

function capabilityFor(model: OpenRouterModel): { id: string; category: string }[] {
  const output = new Set(model.architecture?.output_modalities ?? []);
  const result: { id: string; category: string }[] = [];
  if (output.has('text')) result.push({ id: 'TEXT_GENERATION', category: 'generation' });
  if (output.has('image')) result.push({ id: 'IMAGE_GENERATION', category: 'generation' });
  if (output.has('embeddings')) result.push({ id: 'EMBEDDING', category: 'embedding' });
  return result;
}

function requiredPricingFields(model: OpenRouterModel, capability: string): string[] {
  const pricing = model.pricing ?? {};
  const fields: string[] = [];

  if (capability === 'TEXT_GENERATION' || capability === 'VISION' || capability === 'EMBEDDING') {
    if (pricing.prompt == null || pricing.prompt === '') fields.push('prompt');
  }
  if (capability === 'TEXT_GENERATION' || capability === 'VISION') {
    if (pricing.completion == null || pricing.completion === '') fields.push('completion');
  }
  if (capability === 'IMAGE_GENERATION') {
    if (pricing.image == null || pricing.image === '') fields.push('image');
  }

  const supportsReasoning = (model.supported_parameters ?? []).some((parameter) => parameter === 'reasoning');
  if (supportsReasoning && (pricing.internal_reasoning == null || pricing.internal_reasoning === '')) {
    fields.push('internal_reasoning');
  }

  return fields;
}

export interface PricingSyncResult {
  snapshotId: string;
  modelCount: number;
  insertedModels: number;
  changedPrices: number;
  expiredModels: number;
  incompleteModels: number;
}

export async function syncOpenRouterPricing(): Promise<PricingSyncResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY_NOT_CONFIGURED');

  const response = await fetch(OPENROUTER_MODELS_URL, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`OPENROUTER_MODELS_SYNC_FAILED:${response.status}`);

  const payload = (await response.json()) as OpenRouterModelsResponse;
  const models = Array.isArray(payload.data) ? payload.data : [];
  const rawPayload = JSON.stringify(payload);
  const payloadHash = createHash('sha256').update(rawPayload).digest('hex');
  const supabase = serverClient();

  const { data: snapshot, error: snapshotError } = await supabase
    .from('pricing_snapshots')
    .upsert({
      source: 'OPENROUTER',
      source_endpoint: OPENROUTER_MODELS_URL,
      model_count: models.length,
      payload_hash: payloadHash,
      metadata: { sync_type: 'models', version: 2 },
    }, { onConflict: 'source,payload_hash' })
    .select('id')
    .single();

  if (snapshotError || !snapshot) throw new Error(`PRICING_SNAPSHOT_WRITE_FAILED:${snapshotError?.message ?? 'NO_RESULT'}`);

  let insertedModels = 0;
  let changedPrices = 0;
  let expiredModels = 0;
  let incompleteModels = 0;

  for (const model of models) {
    if (!model.id) continue;
    const capabilities = capabilityFor(model);
    if (capabilities.length === 0) continue;

    for (const capability of capabilities) {
      const requiredFields = requiredPricingFields(model, capability.id);
      if (requiredFields.length > 0) {
        incompleteModels++;
        continue;
      }

      const capabilityError = (await supabase.from('capabilities').upsert({
        id: capability.id,
        display_name: capability.id.replaceAll('_', ' '),
        category: capability.category,
        enabled: true,
      }, { onConflict: 'id' })).error;
      if (capabilityError) throw new Error(`CAPABILITY_SYNC_FAILED:${capabilityError.message}`);

      const pricing = model.pricing ?? {};
      const inputPrice = parsePrice(pricing.prompt);
      const outputPrice = parsePrice(pricing.completion);
      const requestPrice = parsePrice(pricing.request);
      const imagePrice = parsePrice(pricing.image);
      const reasoningPrice = parsePrice(pricing.internal_reasoning);
      const cachedInputPrice = parsePrice(pricing.input_cache_read);
      const cacheWritePrice = parsePrice(pricing.input_cache_write);
      const expirationDate = model.expiration_date ?? null;

      const inputPerToken = requirePrice(inputPrice, 'prompt');
      const outputPerToken = requirePrice(outputPrice, 'completion');
      const requestFee = requestPrice.known ? requestPrice.valuePerToken : null;
      const imageFee = imagePrice.known ? imagePrice.valuePerToken : null;
      const reasoningPerToken = reasoningPrice.known ? reasoningPrice.valuePerToken : null;
      const cachedPerToken = cachedInputPrice.known ? cachedInputPrice.valuePerToken : null;
      const cacheWritePerToken = cacheWritePrice.known ? cacheWritePrice.valuePerToken : null;

      const { data: existing } = await supabase
        .from('models')
        .select('input_price_per_million,output_price_per_million,request_price,image_price,reasoning_price_per_million,cached_input_price_per_million,cache_write_price_per_million,context_window,expiration_date')
        .eq('provider_id', 'openrouter')
        .eq('id', model.id)
        .maybeSingle();

      const comparableRequest = requestFee ?? 0;
      const comparableImage = imageFee ?? 0;
      const comparableReasoning = reasoningPerToken ?? 0;
      const comparableCached = cachedPerToken ?? 0;
      const comparableCacheWrite = cacheWritePerToken ?? 0;
      const priceChanged = existing && (
        Number(existing.input_price_per_million) !== inputPerToken * 1_000_000 ||
        Number(existing.output_price_per_million) !== outputPerToken * 1_000_000 ||
        Number(existing.request_price) !== comparableRequest ||
        Number(existing.image_price) !== comparableImage ||
        Number(existing.reasoning_price_per_million) !== comparableReasoning * 1_000_000 ||
        Number(existing.cached_input_price_per_million) !== comparableCached * 1_000_000 ||
        Number(existing.cache_write_price_per_million) !== comparableCacheWrite * 1_000_000
      );

      if (priceChanged) changedPrices++;
      if (expirationDate && Date.parse(expirationDate) <= Date.now()) expiredModels++;

      const { error: historyError } = await supabase.from('model_price_history').insert({
        snapshot_id: snapshot.id,
        provider_id: 'openrouter',
        model_id: model.id,
        canonical_slug: model.canonical_slug ?? null,
        input_price_per_token: inputPerToken,
        output_price_per_token: outputPerToken,
        request_price: comparableRequest,
        image_price: comparableImage,
        reasoning_price: comparableReasoning,
        cached_input_price: comparableCached,
        cache_write_price: comparableCacheWrite,
        context_window: model.context_length ?? model.top_provider?.context_length ?? null,
        expiration_date: expirationDate,
        supported_parameters: model.supported_parameters ?? [],
        modalities: model.architecture ?? {},
        raw_pricing: pricing,
      });
      if (historyError) throw new Error(`MODEL_PRICE_HISTORY_WRITE_FAILED:${historyError.message}`);

      const { data: modelRow, error: modelError } = await supabase.from('models').upsert({
        id: model.id,
        provider_id: 'openrouter',
        capability: capability.id,
        input_price_per_million: inputPerToken * 1_000_000,
        output_price_per_million: outputPerToken * 1_000_000,
        request_price: comparableRequest,
        image_price: comparableImage,
        reasoning_price_per_million: comparableReasoning * 1_000_000,
        cached_input_price_per_million: comparableCached * 1_000_000,
        cache_write_price_per_million: comparableCacheWrite * 1_000_000,
        currency: 'USD',
        context_window: model.context_length ?? model.top_provider?.context_length ?? null,
        max_completion_tokens: model.top_provider?.max_completion_tokens ?? null,
        supported_parameters: model.supported_parameters ?? [],
        input_modalities: model.architecture?.input_modalities ?? [],
        output_modalities: model.architecture?.output_modalities ?? [],
        canonical_slug: model.canonical_slug ?? null,
        enabled: !expirationDate || Date.parse(expirationDate) > Date.now(),
        expiration_date: expirationDate,
        price_verified_at: new Date().toISOString(),
        metadata: {
          source: 'OPENROUTER_MODELS_API',
          model_name: model.name ?? null,
          pricing_completeness: {
            request: requestPrice.known,
            image: imagePrice.known,
            reasoning: reasoningPrice.known,
            cached_input: cachedInputPrice.known,
            cache_write: cacheWritePrice.known,
          },
        },
      }, { onConflict: 'provider_id,id' }).select('id').single();

      if (modelError || !modelRow) throw new Error(`MODEL_REGISTRY_SYNC_FAILED:${modelError?.message ?? 'NO_RESULT'}`);
      if (!existing) insertedModels++;
    }
  }

  return { snapshotId: snapshot.id, modelCount: models.length, insertedModels, changedPrices, expiredModels, incompleteModels };
}
