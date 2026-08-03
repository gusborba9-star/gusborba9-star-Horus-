import type { ProviderAdapter, ProviderTextRequest, ProviderTextResponse } from '../types';
interface GoogleResponse { responseId?: string; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }; }
export class GoogleTextAdapter implements ProviderAdapter {
  readonly providerId = 'google';
  async generateText(request: ProviderTextRequest): Promise<ProviderTextResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(request.model)}:generateContent?key=${encodeURIComponent(apiKey)}`, { method: 'POST', signal: request.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: request.input }] }], ...(request.temperature === undefined ? {} : { generationConfig: { temperature: request.temperature } }) }) });
    if (!response.ok) throw new Error(`GOOGLE_REQUEST_FAILED:${response.status}`);
    const data = (await response.json()) as GoogleResponse;
    const inputTokens = data.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    if (!text) throw new Error('GOOGLE_EMPTY_RESPONSE');
    return { text, usage: { inputTokens, outputTokens, totalTokens: data.usageMetadata?.totalTokenCount ?? inputTokens + outputTokens }, providerRequestId: data.responseId ?? null, raw: data };
  }
}
