export type InferenceRequest = {
  modelId: string;
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
  capability: string;
};

export type InferenceResult = {
  providerId: string;
  modelId: string;
  requestId: string | null;
  latencyMs: number;
  resultType: 'TEXT' | 'IMAGE' | 'STRUCTURED';
  text: string | null;
  artifactUrl: string | null;
  providerMetadata: Record<string, unknown>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    cachedInputTokens: number;
    providerCostUsd: number | null;
    raw: Record<string, unknown>;
  };
};

export type TextInferenceRequest = Omit<InferenceRequest, 'capability'>;
export type TextInferenceResult = Omit<InferenceResult, 'resultType' | 'artifactUrl' | 'providerMetadata'> & { text: string; };

export interface InferenceProvider {
  readonly id: string;
  execute(request: InferenceRequest): Promise<InferenceResult>;
}

export interface TextInferenceProvider {
  readonly id: string;
  execute(request: TextInferenceRequest): Promise<TextInferenceResult>;
}

function extractImageUrl(payload: any): string | null {
  const candidates = [
    payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url,
    payload?.choices?.[0]?.message?.images?.[0]?.url,
    payload?.choices?.[0]?.images?.[0]?.image_url?.url,
    payload?.choices?.[0]?.images?.[0]?.url,
  ];
  for (const candidate of candidates) if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  const content = payload?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      const candidate = part?.image_url?.url ?? part?.image?.url ?? part?.url;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }
  return null;
}

function extractText(payload: any): string {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) return content.filter((part) => typeof part?.text === 'string').map((part) => part.text).join('\n').trim();
  return '';
}

export class OpenRouterProvider implements InferenceProvider {
  readonly id = 'openrouter';

  async execute(request: InferenceRequest): Promise<InferenceResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY_MISSING');
    const started = Date.now();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://horus-os.com',
        'X-Title': 'Hórus Cognitive OS',
      },
      body: JSON.stringify({
        model: request.modelId,
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        max_tokens: request.maxOutputTokens,
        ...(request.capability === 'IMAGE' ? { modalities: ['text', 'image'] } : {}),
      }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    const latencyMs = Date.now() - started;
    if (!response.ok) {
      const message = payload?.error?.message || `HTTP_${response.status}`;
      throw new Error(`PROVIDER_EXECUTION_FAILED:${response.status}:${message}`);
    }
    const usage = payload?.usage ?? {};
    const artifactUrl = request.capability === 'IMAGE' ? extractImageUrl(payload) : null;
    const text = extractText(payload);
    if (request.capability === 'IMAGE' && !artifactUrl && !text) throw new Error('PROVIDER_EMPTY_IMAGE_RESULT');
    if (request.capability !== 'IMAGE' && !text) throw new Error('PROVIDER_EMPTY_RESULT');
    return {
      providerId: this.id,
      modelId: request.modelId,
      requestId: response.headers.get('x-request-id') ?? (typeof payload?.id === 'string' ? payload.id : null),
      latencyMs,
      resultType: request.capability === 'IMAGE' && artifactUrl ? 'IMAGE' : text ? 'TEXT' : 'STRUCTURED',
      text: text || null,
      artifactUrl,
      providerMetadata: { responseId: payload?.id ?? null, object: payload?.object ?? null },
      usage: {
        inputTokens: Math.max(0, Number(usage.prompt_tokens ?? 0)),
        outputTokens: Math.max(0, Number(usage.completion_tokens ?? 0)),
        reasoningTokens: Math.max(0, Number(usage.reasoning_tokens ?? 0)),
        cachedInputTokens: Math.max(0, Number(usage.prompt_tokens_details?.cached_tokens ?? 0)),
        providerCostUsd: typeof usage.cost === 'number' ? usage.cost : null,
        raw: usage,
      },
    };
  }
}

export class OpenRouterTextProvider implements TextInferenceProvider {
  readonly id = 'openrouter';

  async execute(request: TextInferenceRequest): Promise<TextInferenceResult> {
    const result = await new OpenRouterProvider().execute({ ...request, capability: 'TEXT_GENERATION' });
    if (!result.text) throw new Error('PROVIDER_EMPTY_RESULT');
    return { ...result, text: result.text };
  }
}

export function getInferenceProvider(providerId: string): InferenceProvider {
  switch (providerId) {
    case 'openrouter':
      return new OpenRouterProvider();
    default:
      throw new Error(`PROVIDER_UNSUPPORTED:${providerId}`);
  }
}

export function getTextInferenceProvider(providerId: string): TextInferenceProvider {
  switch (providerId) {
    case 'openrouter':
      return new OpenRouterTextProvider();
    default:
      throw new Error(`PROVIDER_UNSUPPORTED:${providerId}`);
  }
}
