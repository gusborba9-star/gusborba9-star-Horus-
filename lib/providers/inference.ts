export type TextInferenceRequest = {
  modelId: string;
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens: number;
};

export type TextInferenceResult = {
  text: string;
  providerId: string;
  modelId: string;
  requestId: string | null;
  latencyMs: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    cachedInputTokens: number;
    providerCostUsd: number | null;
    raw: Record<string, unknown>;
  };
};

export interface TextInferenceProvider {
  readonly id: string;
  execute(request: TextInferenceRequest): Promise<TextInferenceResult>;
}

export class OpenRouterTextProvider implements TextInferenceProvider {
  readonly id = 'openrouter';

  async execute(request: TextInferenceRequest): Promise<TextInferenceResult> {
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
      }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    const latencyMs = Date.now() - started;
    if (!response.ok) {
      const message = payload?.error?.message || `HTTP_${response.status}`;
      throw new Error(`PROVIDER_EXECUTION_FAILED:${response.status}:${message}`);
    }
    const text = typeof payload?.choices?.[0]?.message?.content === 'string' ? payload.choices[0].message.content.trim() : '';
    if (!text) throw new Error('PROVIDER_EMPTY_RESULT');
    const usage = payload?.usage ?? {};
    return {
      text,
      providerId: this.id,
      modelId: request.modelId,
      requestId: response.headers.get('x-request-id') ?? (typeof payload?.id === 'string' ? payload.id : null),
      latencyMs,
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

export function getTextInferenceProvider(providerId: string): TextInferenceProvider {
  switch (providerId) {
    case 'openrouter':
      return new OpenRouterTextProvider();
    default:
      throw new Error(`PROVIDER_UNSUPPORTED:${providerId}`);
  }
}
