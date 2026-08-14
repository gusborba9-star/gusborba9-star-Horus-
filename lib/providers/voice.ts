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
  supportedParameters?: string[];
};

type RankedVoiceModel = { model: LiveVoiceModel; score: number };

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

type InputModality = 'audio' | 'file' | 'text';

type VoiceOutput = 'transcription' | 'speech';

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
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.POSITIVE_INFINITY;
}

function normalizeModality(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase().trim() : '';
}

function modelSupports(model: LiveVoiceModel, input: InputModality, output: VoiceOutput) {
  const inputs = (model.architecture?.input_modalities ?? []).map(normalizeModality);
  const outputs = (model.architecture?.output_modalities ?? []).map(normalizeModality);
  const inputAliases = input === 'audio' ? ['audio', 'file'] : [input];
  // OpenRouter exposes dedicated Speech/Transcription capability labels in the live
  // catalog. Some model records also expose the underlying audio/text modality. Both
  // representations are accepted because the catalog is provider-owned and dynamic.
  const outputAliases = output === 'speech' ? ['speech', 'audio'] : ['transcription', 'text'];
  const inputCompatible = !inputs.length || inputAliases.some((candidate) => inputs.includes(candidate));
  const outputCompatible = !outputs.length || outputAliases.some((candidate) => outputs.includes(candidate));
  return inputCompatible && outputCompatible;
}

function economicEligibility(model: LiveVoiceModel) {
  // Unknown pricing is never silently selected by automatic routing. Known zero-cost
  // entries remain eligible, while finite live catalog prices participate in ranking.
  return Number.isFinite(model.inputPrice) && Number.isFinite(model.outputPrice);
}

function localeScore(characteristics: VoiceCharacteristics) {
  return characteristics.locale.toLowerCase().startsWith('pt') ? 1 : 0.55;
}

function rankVoiceModels(models: LiveVoiceModel[], characteristics: VoiceCharacteristics, requiredInputModality: InputModality, output: VoiceOutput): RankedVoiceModel[] {
  const locale = localeScore(characteristics);
  return models
    .filter((model) => modelSupports(model, requiredInputModality, output))
    .filter(economicEligibility)
    .map((model) => {
      const cost = model.inputPrice + model.outputPrice;
      const costScore = 1 / (1 + cost * 10_000);
      const contextScore = Math.min(1, Math.max(0, model.contextLength / 32_000));
      const capabilityScore = modelSupports(model, requiredInputModality, output) ? 1 : 0;
      const reliabilityScore = model.supportedParameters?.length ? 0.7 + Math.min(0.3, model.supportedParameters.length / 100) : 0.7;
      const score = capabilityScore * 0.30 + costScore * 0.30 + contextScore * 0.10 + locale * 0.15 + reliabilityScore * 0.15;
      return { model, score };
    })
    .sort((a, b) => b.score - a.score || a.model.id.localeCompare(b.model.id));
}

async function discoverVoiceModels(outputModality: VoiceOutput): Promise<LiveVoiceModel[]> {
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
      supportedParameters: Array.isArray(model?.supported_parameters) ? model.supported_parameters : undefined,
    }));
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

async function parseSttResponse(response: Response, selected: string): Promise<SpeechToTextResult> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`STT_PROVIDER_FAILED:${response.status}:${payload?.error?.message || payload?.error?.code || 'UNKNOWN'}:${selected}`);
  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  if (!text) throw new Error('STT_EMPTY_RESULT');
  return { text, providerId: 'openrouter', modelId: selected, requestId: response.headers.get('x-generation-id') || response.headers.get('x-request-id'), usage: payload?.usage && typeof payload.usage === 'object' ? payload.usage : {} };
}

export async function resolveVoiceIdentity(characteristics: VoiceCharacteristics, preferredVoice?: unknown): Promise<VoiceIdentity> {
  const ttsModels = await discoverVoiceModels('speech');
  const ranked = rankVoiceModels(ttsModels, characteristics, 'text', 'speech');
  const primary = ranked[0]?.model;
  const fallback = ranked.find((entry) => entry.model.id !== primary?.id)?.model ?? primary;
  if (!primary) throw new Error('TTS_CATALOG_NO_COMPATIBLE_MODEL');
  return { ...characteristics, primary: { model: primary.id, voice: voiceForModel(primary.id, preferredVoice) }, fallback: { model: fallback.id, voice: voiceForModel(fallback.id, preferredVoice) } };
}

export async function resolveSpeechToTextModel(characteristics: VoiceCharacteristics): Promise<{ primary: string; fallback: string }> {
  const models = await discoverVoiceModels('transcription');
  const ranked = rankVoiceModels(models, characteristics, 'audio', 'transcription');
  if (!ranked[0]) throw new Error('STT_CATALOG_NO_COMPATIBLE_MODEL');
  return { primary: ranked[0].model.id, fallback: ranked.find((entry) => entry.model.id !== ranked[0].model.id)?.model.id ?? ranked[0].model.id };
}

export class OpenRouterSpeechProvider implements SpeechToTextProvider {
  readonly id = 'openrouter';

  async transcribe(input: { audioBase64: string; format: string; language?: string; modelId?: string }): Promise<SpeechToTextResult> {
    if (!input.audioBase64 || input.audioBase64.length > MAX_AUDIO_BASE64) throw new Error('VOICE_AUDIO_TOO_LARGE');
    const selected = input.modelId ?? (await resolveSpeechToTextModel({ locale: input.language || 'pt-BR', gender: 'neutral' })).primary;
    const language = normalizeSttLanguage(input.language);
    const jsonResponse = await fetch(`${OPENROUTER_URL}/audio/transcriptions`, { method: 'POST', headers: headers(), body: JSON.stringify({ model: selected, input_audio: { data: input.audioBase64, format: input.format }, ...(language ? { language } : {}) }), cache: 'no-store', signal: timeoutSignal() });
    if (jsonResponse.ok) return parseSttResponse(jsonResponse, selected);
    const form = new FormData();
    const bytes = Buffer.from(input.audioBase64, 'base64');
    form.append('file', new Blob([bytes], { type: `audio/${input.format}` }), `voice.${input.format}`);
    form.append('model', selected);
    if (language) form.append('language', language);
    const multipartResponse = await fetch(`${OPENROUTER_URL}/audio/transcriptions`, { method: 'POST', headers: { Authorization: `Bearer ${apiKey()}`, 'HTTP-Referer': process.env.APP_URL || 'https://horus-os.com', 'X-Title': 'Hórus Cognitive OS' }, body: form, cache: 'no-store', signal: timeoutSignal() });
    return parseSttResponse(multipartResponse, selected);
  }
}

export class OpenRouterSpeechSynthesisProvider implements TextToSpeechProvider {
  readonly id = 'openrouter';

  async synthesize(input: { text: string; voice: string; modelId: string; locale: string; instructions?: string }): Promise<TextToSpeechResult> {
    if (!input.text.trim()) throw new Error('TTS_EMPTY_INPUT');
    const response = await fetch(`${OPENROUTER_URL}/audio/speech`, { method: 'POST', headers: headers(), body: JSON.stringify({ model: input.modelId, input: input.text, voice: input.voice, response_format: 'mp3', instructions: input.instructions }), cache: 'no-store', signal: timeoutSignal() });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(`TTS_PROVIDER_FAILED:${response.status}:${payload?.error?.message || 'UNKNOWN'}:${input.modelId}`);
    }
    const audio = new Uint8Array(await response.arrayBuffer());
    if (!audio.length) throw new Error('TTS_EMPTY_RESULT');
    return { audio, contentType: response.headers.get('content-type') || 'audio/mpeg', providerId: this.id, modelId: input.modelId, requestId: response.headers.get('x-generation-id') || response.headers.get('x-request-id'), usage: {} };
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
