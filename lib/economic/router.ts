import type { ModelRegistry } from './model-registry';
import type { ProviderRegistry } from './provider-registry';
import type { ModelRecord, ProviderRecord, RoutingRequest } from './types';

export interface RouteDecision {
  provider: ProviderRecord;
  model: ModelRecord;
}

export class EconomicRouter {
  constructor(
    private readonly providers: ProviderRegistry,
    private readonly models: ModelRegistry,
  ) {}

  async route(request: RoutingRequest): Promise<RouteDecision> {
    const providers = await this.providers.list(request.capability);
    const providerIds = new Set(providers.map((provider) => provider.id));
    const models = (await this.models.list(request.capability)).filter((model) => providerIds.has(model.providerId));

    const candidates = models
      .filter((model) => request.qualityRequired === undefined || model.qualityScore >= request.qualityRequired)
      .map((model) => {
        const provider = providers.find((candidate) => candidate.id === model.providerId)!;
        const costProxy = model.inputPricePerMillion + model.outputPricePerMillion;
        const score =
          model.qualityScore * 0.35 +
          model.reliabilityScore * 0.30 +
          model.latencyScore * 0.15 +
          (1 / (1 + costProxy)) * 0.10 +
          (1 / (1 + provider.priority)) * 0.10;
        return { provider, model, score };
      })
      .sort((a, b) => b.score - a.score);

    const selected = candidates[0];
    if (!selected) throw new Error('NO_CAPABLE_PROVIDER_MODEL');
    return selected;
  }
}
