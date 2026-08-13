export type VoiceIdentity = {
  locale: string;
  gender: 'female' | 'male' | 'neutral';
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

export interface SpeechToTextProvider {
  readonly id: string;
  transcribe(input: { audioBase64: string; format: string; language?: string }): Promise<SpeechToTextResult>;
}

export interface TextToSpeechProvider {
  readonly id: string;
  synthesize(input: { text: string; voice: string; modelId: string; locale: string; instructions?: string }): Promise<TextToSpeechResult>;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1';
const STT_MODEL = process.env.PERSONAL_STT_MODEL || 'openai/whisper-large-v3';
const TTS_PRIMARY_MODEL = process.env.PERSONAL_TTS_PRIMARY_MODEL || 'openai/gpt-4o-mini-tts-2025-12-15';
const TTS_FALLBACK_MODEL = process.env.PERSONAL_TTS_FALLBACK_MODEL || 'openai/gpt-4o-mini-tts-2025-12-15';
const MAX_AUDIO_BASE64 = 25 * 1024 * 1024 * 4 / 3;

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

export class OpenRouterSpeechProvider implements SpeechToTextProvider {
  readonly id = 'openrouter';

  async transcribe(input: { audioBase64: string; format: string; language?: string }): Promise<SpeechToTextResult> {
    if (!input.audioBase64 || input.audioBase64.length > MAX_AUDIO_BASE64) throw new Error('VOICE_AUDIO_TOO_LARGE');
    const response = await fetch(`${OPENROUTER_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model: STT_MODEL,
        input_audio: { data: input.audioBase64, format: input.format },
        language: input.language || 'pt',
      }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`STT_PROVIDER_FAILED:${response.status}:${payload?.error?.message || 'UNKNOWN'}`);
    const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
    if (!text) throw new Error('STT_EMPTY_RESULT');
    return {
      text,
      providerId: this.id,
      modelId: STT_MODEL,
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
        provider: input.instructions ? { options: { openai: { instructions: input.instructions } } } : undefined,
      }),
      cache: 'no-store',
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

export const voiceIdentityDefaults: VoiceIdentity = {
  locale: 'pt-BR',
  gender: 'female',
  primary: { model: TTS_PRIMARY_MODEL, voice: process.env.PERSONAL_TTS_PRIMARY_VOICE || 'nova' },
  fallback: { model: TTS_FALLBACK_MODEL, voice: process.env.PERSONAL_TTS_FALLBACK_VOICE || 'shimmer' },
};

export function getSpeechToTextProvider(providerId = 'openrouter'): SpeechToTextProvider {
  if (providerId === 'openrouter') return new OpenRouterSpeechProvider();
  throw new Error(`STT_PROVIDER_UNSUPPORTED:${providerId}`);
}

export function getTextToSpeechProvider(providerId = 'openrouter'): TextToSpeechProvider {
  if (providerId === 'openrouter') return new OpenRouterSpeechSynthesisProvider();
  throw new Error(`TTS_PROVIDER_UNSUPPORTED:${providerId}`);
}
