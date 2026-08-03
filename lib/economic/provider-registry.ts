import type { Capability, ProviderRecord } from './types';

export interface ProviderRegistry {
  get(providerId: string): Promise<ProviderRecord | null>;
  list(capability?: Capability): Promise<ProviderRecord[]>;
}

export class InMemoryProviderRegistry implements ProviderRegistry {
  constructor(private readonly providers: readonly ProviderRecord[]) {}

  async get(providerId: string): Promise<ProviderRecord | null> {
    return this.providers.find((provider) => provider.id === providerId) ?? null;
  }

  async list(capability?: Capability): Promise<ProviderRecord[]> {
    return this.providers
      .filter((provider) => provider.status !== 'DISABLED')
      .filter((provider) => !capability || provider.capabilities.includes(capability))
      .sort((a, b) => a.priority - b.priority);
  }
}
