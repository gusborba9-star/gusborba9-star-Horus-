import { getServiceSupabase } from '@/lib/supabase';
import type { ModelRecord } from '@/lib/economic/types';

export type EndpointPricing = {
  endpointId: string;
  providerId: string;
  modelId: string;
  pricing: Record<string, unknown>;
  limits: Record<string, unknown>;
  observedAt: string;
  snapshotId?: string | null;
};

export type PricingCandidate = { model: ModelRecord; endpointPricing: EndpointPricing | null };
export type PricingSnapshot = { id: string; source: string; observedAt: string; candidates: PricingCandidate[] };

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
  return value;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function modelPricing(model: ModelRecord): Record<string, unknown> {
  return {
    model_id: model.id,
    provider_id: model.providerId,
    capability: model.capability,
    input_price_per_million: model.inputPricePerMillion,
    output_price_per_million: model.outputPricePerMillion,
    request_price: model.requestPrice,
    image_price: model.imagePrice,
    reasoning_price_per_million: model.reasoningPricePerMillion,
    cached_input_price_per_million: model.cachedInputPricePerMillion,
    cache_write_price_per_million: model.cacheWritePricePerMillion,
    currency: model.currency,
    price_verified_at: model.priceVerifiedAt,
    expiration_date: model.expirationDate,
  };
}

export async function getEndpointPricing(providerId: string, modelId: string, endpointId?: string): Promise<EndpointPricing | null> {
  const supabase = getServiceSupabase();
  let query = supabase.from('provider_endpoint_history').select('id,snapshot_id,provider_id,model_id,endpoint_id,observed_at,enabled,pricing,limits').eq('provider_id', providerId).eq('model_id', modelId).eq('enabled', true).order('observed_at', { ascending: false }).limit(1);
  if (endpointId) query = query.eq('endpoint_id', endpointId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`ENDPOINT_PRICING_READ_FAILED:${error.message}`);
  if (!data) return null;
  return { endpointId: String(data.endpoint_id), providerId: String(data.provider_id), modelId: String(data.model_id), pricing: (data.pricing ?? {}) as Record<string, unknown>, limits: (data.limits ?? {}) as Record<string, unknown>, observedAt: String(data.observed_at), snapshotId: data.snapshot_id ? String(data.snapshot_id) : null };
}

export async function createPricingSnapshot(candidates: PricingCandidate[]): Promise<PricingSnapshot> {
  if (candidates.length === 0) throw new Error('PRICING_SNAPSHOT_REQUIRES_CANDIDATES');
  const observedAt = new Date().toISOString();
  const payload = stable({ candidates: candidates.map(({ model, endpointPricing }) => ({ model: modelPricing(model), endpoint: endpointPricing })) });
  const payloadHash = await sha256(JSON.stringify(payload));
  const supabase = getServiceSupabase();
  const { data: existing, error: existingError } = await supabase.from('pricing_snapshots').select('id,source,observed_at').eq('source', 'horus-runtime').eq('payload_hash', payloadHash).maybeSingle();
  if (existingError) throw new Error(`PRICING_SNAPSHOT_READ_FAILED:${existingError.message}`);

  let snapshotId: string;
  let snapshotObservedAt = observedAt;
  if (existing) {
    snapshotId = String(existing.id);
    snapshotObservedAt = String(existing.observed_at);
  } else {
    const { data, error } = await supabase.from('pricing_snapshots').insert({ source: 'horus-runtime', source_endpoint: 'model-registry', observed_at: observedAt, model_count: candidates.length, payload_hash: payloadHash, metadata: payload }).select('id,observed_at').single();
    if (error || !data) throw new Error(`PRICING_SNAPSHOT_CREATE_FAILED:${error?.message ?? 'missing_id'}`);
    snapshotId = String(data.id);
    snapshotObservedAt = String(data.observed_at);
  }

  for (const { endpointPricing } of candidates) {
    if (!endpointPricing || endpointPricing.snapshotId) continue;
    const { error } = await supabase.from('provider_endpoint_history').update({ snapshot_id: snapshotId }).eq('provider_id', endpointPricing.providerId).eq('model_id', endpointPricing.modelId).eq('endpoint_id', endpointPricing.endpointId).eq('observed_at', endpointPricing.observedAt).is('snapshot_id', null);
    if (error) throw new Error(`ENDPOINT_PRICING_SNAPSHOT_BIND_FAILED:${error.message}`);
  }
  return { id: snapshotId, source: 'horus-runtime', observedAt: snapshotObservedAt, candidates };
}

export async function ensureBudgetPricingSnapshot(input: { budgetId: string; candidates: PricingCandidate[] }): Promise<PricingSnapshot> {
  const supabase = getServiceSupabase();
  const { data: budget, error } = await supabase.from('execution_budgets').select('id,pricing_snapshot_id').eq('id', input.budgetId).maybeSingle();
  if (error) throw new Error(`EXECUTION_BUDGET_READ_FAILED:${error.message}`);
  if (!budget) throw new Error('EXECUTION_BUDGET_NOT_FOUND');
  if (budget.pricing_snapshot_id) {
    const { data: snapshot, error: snapshotError } = await supabase.from('pricing_snapshots').select('id,source,observed_at').eq('id', budget.pricing_snapshot_id).maybeSingle();
    if (snapshotError) throw new Error(`PRICING_SNAPSHOT_READ_FAILED:${snapshotError.message}`);
    if (!snapshot) throw new Error('PRICING_SNAPSHOT_NOT_FOUND');
    return { id: String(snapshot.id), source: String(snapshot.source), observedAt: String(snapshot.observed_at), candidates: input.candidates };
  }
  const snapshot = await createPricingSnapshot(input.candidates);
  const { error: bindError } = await supabase.from('execution_budgets').update({ pricing_snapshot_id: snapshot.id }).eq('id', input.budgetId).is('pricing_snapshot_id', null);
  if (bindError) throw new Error(`EXECUTION_BUDGET_SNAPSHOT_BIND_FAILED:${bindError.message}`);
  return snapshot;
}
