import type { SupabaseClient } from '@supabase/supabase-js';
import type { TaskProfile } from './task-profile';

export type RoutedModel = {
  providerId: string;
  modelId: string;
  capability: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  qualityScore: number;
  latencyScore: number;
  reliabilityScore: number;
  contextWindow: number | null;
  inputModalities: string[];
  outputModalities: string[];
  score: number;
  source: 'REGISTRY' | 'LIVE_CATALOG';
};

export type ModelCatalogEntry = Omit<RoutedModel, 'score' | 'source'> & { source: RoutedModel['source'] };

function clamp(value: number) { return Math.max(0, Math.min(1, value)); }

function costScore(inputPrice: number, outputPrice: number, budgetBrl: number) {
  const estimatedTaskCost = (inputPrice * 0.35 + outputPrice * 0.65) / 1000;
  return clamp(1 - estimatedTaskCost / Math.max(0.001, budgetBrl));
}

function contextScore(contextWindow: number | null, required: TaskProfile['contextRequirement']) {
  if (!contextWindow) return 0.6;
  const target = required === 'LARGE' ? 200_000 : required === 'MEDIUM' ? 64_000 : 16_000;
  return contextWindow >= target ? 1 : clamp(contextWindow / target);
}

function modalityScore(entry: ModelCatalogEntry, task: TaskProfile, capability?: string) {
  if (capability === 'IMAGE') return entry.outputModalities.some((item) => ['image', 'image_generation'].includes(item)) ? 1 : 0;
  if (capability === 'VIDEO') return entry.outputModalities.includes('video') ? 1 : 0;
  if (capability === 'AUDIO' || capability === 'MUSIC') return entry.outputModalities.some((item) => ['audio', 'music'].includes(item)) ? 1 : 0;
  if (!task.multimodalRequired) return 1;
  return entry.inputModalities.some((item) => ['image', 'audio', 'video', 'file'].includes(item)) ? 1 : 0;
}

function capabilityOutputCompatible(entry: ModelCatalogEntry, capability?: string) {
  if (!capability || capability === 'TEXT_GENERATION' || capability === 'PERSONAL_TEXT' || capability === 'CODE' || capability === 'DOCS') {
    return entry.outputModalities.includes('text');
  }
  if (capability === 'IMAGE') return entry.outputModalities.some((item) => ['image', 'image_generation'].includes(item));
  if (capability === 'VIDEO') return entry.outputModalities.includes('video');
  if (capability === 'AUDIO' || capability === 'MUSIC') return entry.outputModalities.some((item) => ['audio', 'music'].includes(item));
  return true;
}

export function inferCapabilityFromModalities(outputModalities: string[], inputModalities: string[] = []) {
  const output = new Set(outputModalities.map((item) => item.toLowerCase()));
  if (output.has('image') || output.has('image_generation')) return 'IMAGE';
  if (output.has('video')) return 'VIDEO';
  if (output.has('audio') || output.has('music')) return 'AUDIO';
  if (inputModalities.some((item) => ['image', 'audio', 'video', 'file'].includes(item.toLowerCase()))) return 'TEXT_GENERATION';
  return 'TEXT_GENERATION';
}

export function rankModels(entries: ModelCatalogEntry[], task: TaskProfile, budgetBrl: number, capability?: string): RoutedModel[] {
  return entries
    .filter((entry) => capability ? entry.capability === capability : entry.capability === 'TEXT_GENERATION' || entry.capability === 'PERSONAL_TEXT')
    .filter((entry) => capabilityOutputCompatible(entry, capability))
    .map((entry) => {
      const quality = clamp(entry.qualityScore);
      const reliability = clamp(entry.reliabilityScore);
      const latency = clamp(entry.latencyScore);
      const cost = costScore(entry.inputPricePerMillion, entry.outputPricePerMillion, budgetBrl);
      const context = contextScore(entry.contextWindow, task.contextRequirement);
      const modality = modalityScore(entry, task, capability);
      const complexityFit = task.complexity === 'HIGH' ? quality : task.latencyPreference === 'LOW' ? latency : (quality + latency) / 2;
      const score = quality * 0.28 + reliability * 0.18 + latency * 0.14 + cost * 0.18 + context * 0.10 + modality * 0.06 + complexityFit * 0.06;
      return { ...entry, score };
    })
    .filter((entry) => capability !== 'IMAGE' && capability !== 'VIDEO' && capability !== 'AUDIO' && capability !== 'MUSIC' ? true : modalityScore(entry, task, capability) > 0)
    .sort((a, b) => b.score - a.score);
}

export async function resolveAdaptiveModel(service: SupabaseClient, task: TaskProfile, budgetBrl: number, liveCatalog: ModelCatalogEntry[] = [], capability?: string): Promise<RoutedModel> {
  const { data: models, error } = await service.from('models').select('id,provider_id,capability,input_price_per_million,output_price_per_million,quality_score,latency_score,reliability_score,context_window,enabled,input_modalities,output_modalities,expiration_date').eq('enabled', true);
  if (error) throw new Error(`MODEL_ROUTING_LOOKUP_FAILED:${error.message}`);
  const { data: providers, error: providerError } = await service.from('providers').select('id,status,health_score');
  if (providerError) throw new Error(`PROVIDER_ROUTING_LOOKUP_FAILED:${providerError.message}`);
  const activeProviders = new Map((providers ?? []).filter((provider) => provider.status === 'ACTIVE').map((provider) => [provider.id, Number(provider.health_score ?? 0)]));
  const registry: ModelCatalogEntry[] = (models ?? []).filter((model) => activeProviders.has(model.provider_id)).filter((model) => !model.expiration_date || new Date(model.expiration_date).getTime() > Date.now()).map((model) => ({
    providerId: model.provider_id,
    modelId: model.id,
    capability: model.capability,
    inputPricePerMillion: Number(model.input_price_per_million ?? 0),
    outputPricePerMillion: Number(model.output_price_per_million ?? 0),
    qualityScore: Number(model.quality_score ?? 0),
    latencyScore: Number(model.latency_score ?? 0),
    reliabilityScore: Number(model.reliability_score ?? activeProviders.get(model.provider_id) ?? 0),
    contextWindow: model.context_window ? Number(model.context_window) : null,
    inputModalities: Array.isArray(model.input_modalities) ? model.input_modalities : ['text'],
    outputModalities: Array.isArray(model.output_modalities) ? model.output_modalities : ['text'],
    source: 'REGISTRY',
  }));
  const merged = new Map(registry.map((entry) => [`${entry.providerId}:${entry.modelId}:${entry.capability}`, entry]));
  for (const entry of liveCatalog.filter((entry) => activeProviders.has(entry.providerId))) merged.set(`${entry.providerId}:${entry.modelId}:${entry.capability}`, entry);
  const ranked = rankModels([...merged.values()], task, budgetBrl, capability);
  if (!ranked.length) throw new Error('MODEL_ROUTING_NO_COMPATIBLE_MODEL');
  return ranked[0];
}
