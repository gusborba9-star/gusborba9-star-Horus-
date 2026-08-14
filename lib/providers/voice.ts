export type VoiceCharacteristics = {
  locale: string;
  gender: 'female' | 'male' | 'neutral';
  style?: string;
  tone?: string;
  pace?: string;
};

export type VoiceIdentity = VoiceCharacteristics & {
  primary: { model: string; voice: string };
  fallback: { model: string; voice: string };
};

export type SpeechToTextResult = {
  text: string;
  providerId: string;
  modelId: string;
  requestId: string | null;
  usage: Record<string, unknown>;
};

export type TextToSpeechResult = {
  audio: Uint8Array;
  contentType: string;
  providerId: string;
  modelId: string;
  requestId: string | null;
  usage: Record<string, unknown>;
};

type LiveVoiceModel = {
  id: string;
  inputPrice: number;
  outputPrice: number;
  contextLength: number;
  architecture?: { input_modalities?: string[]; output_modalities?: string[] };
};

export interface SpeechToTextProvider {
  readonly id: string;
  transcribe(input: { audioBase64: string; format: string; language?: string; modelId?: string }): Promise<SpeechToTextResult>;
}

export interface TextToSpeechProvider {
  readonly id: string;
  synthesize(input: { text: string; voice: string; modelId: string; locale: string; instructions?: string }): Promise<TextToSpeechResult>;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1';
const MAX_AUDIO_BASE64 = 25 * 1024 * 1024 * 4 / 3;
const REQUEST_TIMEOUT_MS = 60_000;

function apiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY_MISSING');
  return key;
}

function headers() {
  return {
    Authorization: `Bearer ${apiKey()}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_URL || 'https://horus-os.com',
    'X-Title': 'Hórus Cognitive OS',
  };
}

function timeoutSignal() {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

function numericPrice(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

async function discoverVoiceModels(outputModality: 'transcription' | 'speech'): Promise<LiveVoiceModel[]> {
  const response = await fetch(`${OPENROUTER_URL}/models?output_modalities=${outputModality}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: 'no-store',
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`VOICE_CATALOG_FAILED:${outputModality}:${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload?.data)) throw new Error(`VOICE_CATALOG_INVALID:${outputModality}`);
  return payload.data
    .filter((model: any) => typeof model?.id === 'string')
    .map((model: any) => ({
      id: model.id,
      inputPrice: numericPrice(model?.pricing?.prompt),
      outputPrice: numericPrice(model?.pricing?.completion),
      contextLength: Number(model?.context_length ?? 0),
      architecture: model.architecture,
    }));
}

function rankVoiceModels(models: LiveVoiceModel[], characteristics: VoiceCharacteristics) {
  const localeBonus = characteristics.locale.toLowerCase().startsWith('pt') ? 1 : 0.5;
  return [...models]
    .map((model) => {
      const price = model.inputPrice + model.outputPrice;
      const costScore = 1 / (1 + price * 10_000);
      const contextScore = Math.min(1, model.contextLength / 32_000);
      return { model, score: costScore * 0.55 + contextScore * 0.15 + localeBonus * 0.30 };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ model }) => model);
}

function voiceForModel(modelId: string, preferred: unknown): string {
  if (typeof preferred === 'string' && preferred.trim()) return preferred.trim();
  const id = modelId.toLowerCase();
  if (id.includes('grok')) return 'Eve';
  if (id.includes('gemini')) return 'Kore';
  if (id.includes('kokoro')) return 'af_heart';
  return 'nova';
}

function normalizeSttLanguage(language?: string): string | undefined {
  if (!language) return undefined;
  const normalized = language.trim().toLowerCase().replace('_', '-');
  const [iso639] = normalized.split('-');
  return iso639 && /^[a-z]{2}$/.test(iso639) ? iso639 : undefined;
}

export async function resolveVoiceIdentity(characteristics: VoiceCharacteristics, preferredVoice?: unknown): Promise<VoiceIdentity> {
  const [ttsModels] = await Promise.all([discoverVoiceModels('speech')]);
  const ranked = rankVoiceModels(ttsModels, characteristics);
  const primary = ranked[0];
  const fallback = ranked.find((model) => model.id !== primary.id) ?? ranked[0];
  if (!primary) throw new Error('TTS_CATALOG_NO_COMPATIBLE_MODEL');
  return {
    ...characteristics,
    primary: { model: primary.id, voice: voiceForModel(primary.id, preferredVoice) },
    fallback: { model: fallback.id, voice: voiceForModel(fallback.id, preferredVoice) },
  };
}

export async function resolveSpeechToTextModel(characteristics: VoiceCharacteristics): Promise<{ primary: string; fallback: string }> {
  const models = await discoverVoiceModels('transcription');
  const ranked = rankVoiceModels(models, characteristics);
  if (!ranked[0]) throw new Error('STT_CATALOG_NO_COMPATIBLE_MODEL');
  return { primary: ranked[0].id, fallback: ranked.find((model) => model.id !== ranked[0].id)?.id ?? ranked[0].id };
}

export class OpenRouterSpeechProvider implements SpeechToTextProvider {
  readonly id = 'openrouter';

  async transcribe(input: { audioBase64: string; format: string; language?: string; modelId?: string }): Promise<SpeechToTextResult> {
    if (!input.audioBase64 || input.audioBase64.length > MAX_AUDIO_BASE64) throw new Error('VOICE_AUDIO_TOO_LARGE');
    const selected = input.modelId ?? (await resolveSpeechToTextModel({ locale: input.language || 'pt-BR', gender: 'neutral' })).primary;
    const response = await fetch(`${OPENROUTER_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ model: selected, input_audio: { data: input.audioBase64, format: input.format }, language: normalizeSttLanguage(input.language) }),
      cache: 'no-store',
      signal: timeoutSignal(),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`STT_PROVIDER_FAILED:${response.status}:${payload?.error?.message || 'UNKNOWN'}`);
    const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
    if (!text) throw new Error('STT_EMPTY_RESULT');
    return {
      text,
      providerId: this.id,
      modelId: selected,
      requestId: response.headers.get('x-generation-id') || response.headers.get('x-request-id'),
      usage: payload?.usage && typeof payload.usage === 'object' ? payload.usage : {},
    };
  }
}

export class OpenRouterSpeechSynthesisProvider implements TextToSpeechProvider {
  readonly id = 'openrouter';

  async synthesize(input: { text: string; voice: string; modelId: string; locale: string; instructions?: string }): Promise<TextToSpeechResult> {
    if (!input.text.trim()) throw new Error('TTS_EMPTY_INPUT');
    const response = await fetch(`${OPENROUTER_URL}/audio/speech`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model: input.modelId,
        input: input.text,
        voice: input.voice,
        response_format: 'mp3',
        instructions: input.instructions,
      }),
      cache: 'no-store',
      signal: timeoutSignal(),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(`TTS_PROVIDER_FAILED:${response.status}:${payload?.error?.message || 'UNKNOWN'}`);
    }
    const audio = new Uint8Array(await response.arrayBuffer());
    if (!audio.length) throw new Error('TTS_EMPTY_RESULT');
    return {
      audio,
      contentType: response.headers.get('content-type') || 'audio/mpeg',
      providerId: this.id,
      modelId: input.modelId,
      requestId: response.headers.get('x-generation-id') || response.headers.get('x-request-id'),
      usage: {},
    };
  }
}

export function getSpeechToTextProvider(providerId = 'openrouter'): SpeechToTextProvider {
  if (providerId === 'openrouter') return new OpenRouterSpeechProvider();
  throw new Error(`STT_PROVIDER_UNSUPPORTED:${providerId}`);
}

export function getTextToSpeechProvider(providerId = 'openrouter'): TextToSpeechProvider {
  if (providerId === 'openrouter') return new OpenRouterSpeechSynthesisProvider();
  throw new Error(`TTS_PROVIDER_UNSUPPORTED:${providerId}`);
}
