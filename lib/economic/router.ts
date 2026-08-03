import type { ModelRegistry } from './model-registry';
import type { ProviderRegistry } from './provider-registry';
import type { ModelRecord, ProviderRecord, RoutingRequest } from './types';
export interface RouteDecision { provider: ProviderRecord; model: ModelRecord; }
export class EconomicRouter {
  constructor(private readonly providers: ProviderRegistry, private readonly models: ModelRegistry) {}
  async route(request: RoutingRequest): Promise<RouteDecision> {
    const providers = await this.providers.list(request.capability);
    const ids = new Set(providers.map((p) => p.id));
    const candidates = (await this.models.list(request.capability)).filter((m) => ids.has(m.providerId)).filter((m) => request.qualityRequired === undefined || m.qualityScore >= request.qualityRequired).map((model) => {
      const provider = providers.find((p) => p.id === model.providerId)!;
      const score = model.qualityScore * .35 + model.reliabilityScore * .30 + model.latencyScore * .15 + (1 / (1 + model.inputPricePerMillion + model.outputPricePerMillion)) * .10 + (1 / (1 + provider.priority)) * .10;
      return { provider, model, score };
    }).sort((a, b) => b.score - a.score);
    if (!candidates[0]) throw new Error('NO_CAPABLE_PROVIDER_MODEL');
    return candidates[0];
  }
}
