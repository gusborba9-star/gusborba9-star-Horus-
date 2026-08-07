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
export type EconomicTier = 'ECONOMIC' | 'BALANCED' | 'PREMIUM';

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
  requestPrice: number;
  imagePrice: number;
  reasoningPricePerMillion: number;
  cachedInputPricePerMillion: number;
  cacheWritePricePerMillion: number;
  currency: Currency;
  qualityScore: number;
  latencyScore: number;
  reliabilityScore: number;
  contextWindow: number | null;
  maxCompletionTokens: number | null;
  supportedParameters: string[];
  inputModalities: string[];
  outputModalities: string[];
  canonicalSlug: string | null;
  enabled: boolean;
  priceVerifiedAt: string | null;
  expirationDate: string | null;
}

export interface ProviderTextRequest {
  model: string;
  input: string;
  temperature?: number;
  maxOutputTokens?: number;
  maxReasoningTokens?: number;
  includeUsage?: boolean;
  sessionId?: string;
  signal?: AbortSignal;
}

export interface ProviderUsage {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cachedInputTokens: number;
  totalTokens: number;
  requestCost: number | null;
}

export interface ProviderTextResponse {
  text: string;
  usage: ProviderUsage;
  providerRequestId: string | null;
  actualModel: string | null;
  actualProvider: string | null;
  latencyMs: number;
  cacheStatus: 'HIT' | 'MISS' | 'UNKNOWN';
  raw?: unknown;
}

export interface ProviderAdapter {
  readonly providerId: string;
  generateText(request: ProviderTextRequest): Promise<ProviderTextResponse>;
}

export interface CostPolicy {
  fxRateUsdToBrl: number;
  exchangeBufferRate: number;
  safetyBufferRate: number;
  infrastructureRate: number;
  creditBrlValue: number;
  providerFeeRate: number;
  fxBufferRate: number;
  pricingDriftBufferRate: number;
  usageUncertaintyRate: number;
  retryReserveRate: number;
  failureReserveRate: number;
  targetGrossMarginRate: number;
  minimumGrossMarginRate: number;
  globalExecutionEnabled: boolean;
  version: number;
}

export interface CostEstimate {
  providerId: string;
  modelId: string;
  capability: Capability;
  inputTokens: number;
  estimatedOutputTokens: number;
  estimatedProviderCostBrl: number;
  maximumProviderCostBrl: number;
  maximumTotalCostBrl: number;
  fxRate: number;
  buffersBrl: {
    exchangeBuffer: number;
    safetyBuffer: number;
    providerFee: number;
    fx: number;
    pricingDrift: number;
    usageUncertainty: number;
    retryReserve: number;
    failureReserve: number;
    infrastructure: number;
  };
  minimumRevenueBrl: number;
  requiredCredits: number;
  currency: 'BRL';
}

export interface ExecutionBudget {
  operationId: string;
  authorizedCredits: number;
  revenueAllocatedBrl: number;
  maximumProviderCostBrl: number;
  maximumTotalCostBrl: number;
  minimumMarginRate: number;
  maxAttempts: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  maxReasoningTokens: number;
  maxSteps: number;
  maxToolCalls: number;
  maxExecutionSeconds: number;
}

export interface RoutingRequest {
  capability: Capability;
  qualityRequired?: number;
  maxLatency?: number;
  maxCostCredits?: number;
  economicTier?: EconomicTier;
  inputTokens?: number;
  maxOutputTokens?: number;
  maxReasoningTokens?: number;
  maxAttempts?: number;
  allowFallback?: boolean;
}
