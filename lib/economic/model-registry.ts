import type { Capability, ModelRecord } from './types';
export interface ModelRegistry { get(providerId: string, modelId: string): Promise<ModelRecord | null>; list(capability: Capability): Promise<ModelRecord[]>; }
export class InMemoryModelRegistry implements ModelRegistry {
  constructor(private readonly models: readonly ModelRecord[]) {}
  async get(providerId: string, modelId: string) { return this.models.find((model) => model.providerId === providerId && model.id === modelId) ?? null; }
  async list(capability: Capability) { return this.models.filter((model) => model.enabled && model.capability === capability).sort((a, b) => a.inputPricePerMillion + a.outputPricePerMillion - (b.inputPricePerMillion + b.outputPricePerMillion)); }
}
