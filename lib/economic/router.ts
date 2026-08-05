import type { ModelRegistry } from './model-registry';
import type { ProviderRegistry } from './provider-registry';
import type { ModelRecord, ProviderRecord, RoutingRequest } from './types';

export interface RouteDecision {
  provider: ProviderRecord;
  model: ModelRecord;
}

export class EconomicRouter {
  constructor(private readonly providers: ProviderRegistry, private readonly models: ModelRegistry) {}

  async routeCandidates(request: RoutingRequest, limit = 3): Promise<RouteDecision[]> {
    const providers = await this.providers.list(request.capability);
    const ids = new Set(providers.map((p) => p.id));
    const candidates = (await this.models.list(request.capability))
      .filter((model) => ids.has(model.providerId))
      .filter((model) => request.qualityRequired === undefined || model.qualityScore >= request.qualityRequired)
      .filter((model) => request.maxLatency === undefined || model.latencyScore <= request.maxLatency)
      .map((model) => {
        const provider = providers.find((p) => p.id === model.providerId)!;
        const score =
          model.qualityScore * 0.35 +
          model.reliabilityScore * 0.30 +
          model.latencyScore * 0.15 +
          (1 / (1 + model.inputPricePerMillion + model.outputPricePerMillion)) * 0.10 +
          (1 / (1 + provider.priority)) * 0.10;
        return { provider, model, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.floor(limit)));

    return candidates.map(({ provider, model }) => ({ provider, model }));
  }

  async route(request: RoutingRequest): Promise<RouteDecision> {
    const [candidate] = await this.routeCandidates(request, 1);
    if (!candidate) throw new Error('NO_CAPABLE_PROVIDER_MODEL');
    return candidate;
  }
}
