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

function extractImageDataUrl(payload: any): string | null {
  const item = Array.isArray(payload?.data) ? payload.data[0] : null;
  if (!item || typeof item.b64_json !== 'string' || !item.b64_json.trim()) return null;
  const mediaType = typeof item.media_type === 'string' && item.media_type.trim() ? item.media_type.trim() : 'image/png';
  return `data:${mediaType};base64,${item.b64_json}`;
}

function extractText(payload: any): string {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) return content.filter((part) => typeof part?.text === 'string').map((part) => part.text).join('\n').trim();
  return '';
}

function usageFrom(payload: any) {
  const usage = payload?.usage ?? {};
  return {
    inputTokens: Math.max(0, Number(usage.prompt_tokens ?? 0)),
    outputTokens: Math.max(0, Number(usage.completion_tokens ?? 0)),
    reasoningTokens: Math.max(0, Number(usage.reasoning_tokens ?? 0)),
    cachedInputTokens: Math.max(0, Number(usage.prompt_tokens_details?.cached_tokens ?? 0)),
    providerCostUsd: typeof usage.cost === 'number' ? usage.cost : null,
    raw: usage,
  };
}

export class OpenRouterProvider implements InferenceProvider {
  readonly id = 'openrouter';

  async execute(request: InferenceRequest): Promise<InferenceResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY_MISSING');
    const started = Date.now();
    const isImage = request.capability === 'IMAGE';
    const endpoint = isImage ? 'https://openrouter.ai/api/v1/images' : 'https://openrouter.ai/api/v1/chat/completions';
    const body = isImage
      ? { model: request.modelId, prompt: request.userPrompt }
      : {
          model: request.modelId,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
          max_tokens: request.maxOutputTokens,
        };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://horus-os.com',
        'X-Title': 'Hórus Cognitive OS',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    const latencyMs = Date.now() - started;
    if (!response.ok) {
      const message = payload?.error?.message || `HTTP_${response.status}`;
      throw new Error(`PROVIDER_EXECUTION_FAILED:${response.status}:${message}`);
    }

    const artifactUrl = isImage ? (extractImageDataUrl(payload) ?? extractImageUrl(payload)) : null;
    const text = extractText(payload);
    if (isImage && !artifactUrl) throw new Error('PROVIDER_EMPTY_IMAGE_RESULT');
    if (!isImage && !text) throw new Error('PROVIDER_EMPTY_RESULT');

    return {
      providerId: this.id,
      modelId: request.modelId,
      requestId: response.headers.get('x-request-id') ?? (typeof payload?.id === 'string' ? payload.id : null),
      latencyMs,
      resultType: isImage ? 'IMAGE' : 'TEXT',
      text: text || null,
      artifactUrl,
      providerMetadata: { responseId: payload?.id ?? null, object: payload?.object ?? null, endpoint },
      usage: usageFrom(payload),
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
