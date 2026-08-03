import type { Capability, ModelRecord } from './types';

export interface ModelRegistry {
  get(providerId: string, modelId: string, capability?: Capability): Promise<ModelRecord | null>;
  list(capability: Capability): Promise<ModelRecord[]>;
}

export class InMemoryModelRegistry implements ModelRegistry {
  constructor(private readonly models: readonly ModelRecord[]) {}

  async get(providerId: string, modelId: string, capability?: Capability): Promise<ModelRecord | null> {
    return this.models.find(
      (model) =>
        model.providerId === providerId &&
        model.id === modelId &&
        (capability === undefined || model.capability === capability),
    ) ?? null;
  }

  async list(capability: Capability): Promise<ModelRecord[]> {
    return this.models
      .filter((model) => model.enabled && model.capability === capability)
      .sort((a, b) => {
        const aCost = a.inputPricePerMillion + a.outputPricePerMillion + a.reasoningPricePerMillion;
        const bCost = b.inputPricePerMillion + b.outputPricePerMillion + b.reasoningPricePerMillion;
        return aCost - bCost;
      });
  }
}
