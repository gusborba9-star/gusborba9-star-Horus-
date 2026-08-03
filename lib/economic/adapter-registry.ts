import type { ProviderAdapter } from './types';

export class ProviderAdapterRegistry {
  private readonly adapters = new Map<string, ProviderAdapter>();

  constructor(adapters: readonly ProviderAdapter[]) {
    for (const adapter of adapters) this.adapters.set(adapter.providerId, adapter);
  }

  get(providerId: string): ProviderAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) throw new Error(`PROVIDER_ADAPTER_NOT_REGISTERED:${providerId}`);
    return adapter;
  }
}
