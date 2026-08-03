export type Capability =
  | 'TEXT_GENERATION'
  | 'VISION'
  | 'IMAGE_GENERATION'
  | 'VIDEO_GENERATION'
  | 'MUSIC_GENERATION'
  | 'EMBEDDING'
  | 'SPEECH_TO_TEXT'
  | 'TEXT_TO_SPEECH'
  | 'CODE_EXECUTION';

export type ProviderStatus = 'ACTIVE' | 'DEGRADED' | 'DISABLED';
export type Currency = 'USD' | 'BRL';

export interface ProviderRecord {
  id: string;
  displayName: string;
  status: ProviderStatus;
  priority: number;
  region: string | null;
  capabilities: Capability[];
}

export interface ModelRecord {
  id: string;
  providerId: string;
  capability: Capability;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  currency: Currency;
  qualityScore: number;
  latencyScore: number;
  reliabilityScore: number;
  contextWindow: number | null;
  enabled: boolean;
  priceVerifiedAt: string | null;
}

export interface ProviderTextRequest {
  model: string;
  input: string;
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface ProviderUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ProviderTextResponse {
  text: string;
  usage: ProviderUsage;
  providerRequestId: string | null;
  raw?: unknown;
}

export interface ProviderAdapter {
  readonly providerId: string;
  generateText(request: ProviderTextRequest): Promise<ProviderTextResponse>;
}

export interface CostEstimate {
  providerId: string;
  modelId: string;
  capability: Capability;
  inputTokens: number;
  estimatedOutputTokens: number;
  providerCost: number;
  fxRate: number;
  exchangeBuffer: number;
  safetyBuffer: number;
  platformCost: number;
  creditCost: number;
  currency: 'BRL';
}

export interface RoutingRequest {
  capability: Capability;
  qualityRequired?: number;
  maxLatency?: number;
  maxCostCredits?: number;
}
