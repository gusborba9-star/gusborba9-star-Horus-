import type { ModelCatalogEntry } from '@/lib/nexus/model-router';
import { executionContractFor, inferCapabilityFromModalities } from '@/lib/nexus/model-router';

let cache: { expiresAt: number; entries: ModelCatalogEntry[] } | null = null;
function numberOrNull(value: unknown) { const number = Number(value); return Number.isFinite(number) ? number : null; }

function headers(apiKey: string) { return { Authorization: `Bearer ${apiKey}` }; }

export async function getLiveOpenRouterCatalog(): Promise<ModelCatalogEntry[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.entries;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return [];

  try {
    const [generalResponse, imageResponse] = await Promise.all([
      fetch('https://openrouter.ai/api/v1/models', { headers: headers(apiKey), cache: 'no-store' }),
      fetch('https://openrouter.ai/api/v1/images/models', { headers: headers(apiKey), cache: 'no-store' }),
    ]);

    const generalPayload = generalResponse.ok ? await generalResponse.json() : { data: [] };
    const imagePayload = imageResponse.ok ? await imageResponse.json() : { data: [] };
    const generalModels = Array.isArray(generalPayload?.data) ? generalPayload.data : [];
    const imageModels = Array.isArray(imagePayload?.data) ? imagePayload.data : [];
    const generalById = new Map<string, any>(generalModels.map((model: any) => [String(model.id), model]));

    const textEntries: ModelCatalogEntry[] = generalModels.map((model: any) => {
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
        executionContract: executionContractFor(capability, outputModalities),
        source: 'LIVE_CATALOG',
      };
    });

    // OpenRouter's dedicated image catalog is the authoritative capability
    // boundary for prompt-to-image execution. It is intentionally separate
    // from /models because multimodal chat routers can advertise image output
    // without being executable through POST /api/v1/images.
    const imageEntries: ModelCatalogEntry[] = imageModels.map((model: any) => {
      const id = String(model.id);
      const general = generalById.get(id);
      const pricing = general?.pricing ?? {};
      const architecture = model.architecture ?? {};
      const inputModalities = Array.isArray(architecture.input_modalities) ? architecture.input_modalities.map(String) : ['text'];
      const outputModalities = Array.isArray(architecture.output_modalities) ? architecture.output_modalities.map(String) : ['image'];
      return {
        providerId: 'openrouter', modelId: id, capability: 'IMAGE',
        inputPricePerMillion: Math.max(0, (numberOrNull(pricing.prompt) ?? 0) * 1_000_000),
        outputPricePerMillion: Math.max(0, (numberOrNull(pricing.completion) ?? 0) * 1_000_000),
        qualityScore: 0.6, latencyScore: 0.6, reliabilityScore: 0.6,
        contextWindow: numberOrNull(general?.context_length ?? model.context_length), inputModalities, outputModalities,
        executionContract: { kind: 'IMAGE_GENERATION', endpoint: 'IMAGE_GENERATION', response: 'IMAGE' },
        source: 'LIVE_CATALOG',
      };
    });

    const entries = new Map<string, ModelCatalogEntry>();
    for (const entry of textEntries) entries.set(`${entry.providerId}:${entry.modelId}:${entry.capability}:chat`, entry);
    for (const entry of imageEntries) entries.set(`${entry.providerId}:${entry.modelId}:IMAGE:image`, entry);

    const result = [...entries.values()];
    cache = { expiresAt: now + 5 * 60_000, entries: result };
    return result;
  } catch {
    return [];
  }
}
