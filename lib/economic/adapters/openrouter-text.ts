import type { ProviderAdapter, ProviderTextRequest, ProviderTextResponse } from '../types';

interface OpenRouterResponse {
  id?: string;
  model?: string;
  provider?: string;
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: number;
    prompt_tokens_details?: {
      cached_tokens?: number;
      cache_write_tokens?: number;
    };
  };
}

export class OpenRouterTextAdapter implements ProviderAdapter {
  readonly providerId = 'openrouter';

  async generateText(request: ProviderTextRequest): Promise<ProviderTextResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY_NOT_CONFIGURED');

    const startedAt = Date.now();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: request.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL ?? 'https://horus.local',
        'X-Title': 'Hórus',
      },
      body: JSON.stringify({
        model: request.model,
        messages: [{ role: 'user', content: request.input }],
        ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        ...(request.maxOutputTokens === undefined ? {} : { max_tokens: request.maxOutputTokens }),
        ...(request.maxReasoningTokens === undefined ? {} : { reasoning: { max_tokens: request.maxReasoningTokens } }),
        usage: { include: request.includeUsage !== false },
        ...(request.sessionId ? { session_id: request.sessionId } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`OPENROUTER_REQUEST_FAILED:${response.status}:${body.slice(0, 500)}`);
    }

    const data = (await response.json()) as OpenRouterResponse;
    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const cachedInputTokens = data.usage?.prompt_tokens_details?.cached_tokens ?? 0;
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OPENROUTER_EMPTY_RESPONSE');

    return {
      text,
      usage: {
        inputTokens,
        outputTokens,
        reasoningTokens: 0,
        cachedInputTokens,
        totalTokens: data.usage?.total_tokens ?? inputTokens + outputTokens,
        requestCost: typeof data.usage?.cost === 'number' ? data.usage.cost : null,
      },
      providerRequestId: data.id ?? null,
      actualModel: data.model ?? null,
      actualProvider: data.provider ?? null,
      latencyMs: Date.now() - startedAt,
      cacheStatus: cachedInputTokens > 0 ? 'HIT' : 'MISS',
      raw: data,
    };
  }
}
