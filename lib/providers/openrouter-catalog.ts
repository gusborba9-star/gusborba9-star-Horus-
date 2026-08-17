import type { ModelCatalogEntry } from '@/lib/nexus/model-router';
import { executionContractFor, inferCapabilityFromModalities } from '@/lib/nexus/model-router';

let cache: { expiresAt: number; entries: ModelCatalogEntry[] } | null = null;
function numberOrNull(value: unknown) { const number = Number(value); return Number.isFinite(number) ? number : null; }

export async function getLiveOpenRouterCatalog(): Promise<ModelCatalogEntry[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.entries;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return [];
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' });
    if (!response.ok) return [];
    const payload = await response.json();
    const entries: ModelCatalogEntry[] = Array.isArray(payload?.data) ? payload.data.map((model: any) => {
      const pricing = model.pricing ?? {}, architecture = model.architecture ?? {};
      const inputModalities = Array.isArray(architecture.input_modalities) ? architecture.input_modalities.map(String) : ['text'];
      const outputModalities = Array.isArray(architecture.output_modalities) ? architecture.output_modalities.map(String) : ['text'];
      const capability = inferCapabilityFromModalities(outputModalities, inputModalities);
      return {
        providerId: 'openrouter', modelId: String(model.id), capability,
        inputPricePerMillion: Math.max(0, (numberOrNull(pricing.prompt) ?? 0) * 1_000_000),
        outputPricePerMillion: Math.max(0, (numberOrNull(pricing.completion) ?? 0) * 1_000_000),
        qualityScore: 0.6, latencyScore: 0.6, reliabilityScore: 0.6,
        contextWindow: numberOrNull(model.context_length), inputModalities, outputModalities,
        executionContract: executionContractFor(capability, outputModalities, { execution_contract: model.supported_parameters?.execution_contract }),
        source: 'LIVE_CATALOG',
      };
    }) : [];
    cache = { expiresAt: now + 5 * 60_000, entries };
    return entries;
  } catch { return []; }
}
