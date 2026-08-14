import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { loadPersonalContext, assertActiveDevice, executePersonalText } from '@/lib/personal/engine';
import { getSpeechToTextProvider, getTextToSpeechProvider, resolveSpeechToTextModel, resolveVoiceIdentity } from '@/lib/providers/voice';

const MAX_BYTES = 25 * 1024 * 1024;

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const context = await loadPersonalContext(service, user.id);
    const voice = context.persona.voice_profile as Record<string, unknown>;
    const characteristics = { locale: context.persona.locale || 'pt-BR', gender: voice.gender === 'male' || voice.gender === 'neutral' ? voice.gender : 'female' } as const;
    const [identity, stt] = await Promise.all([resolveVoiceIdentity(characteristics, voice.voice), resolveSpeechToTextModel(characteristics)]);
    return NextResponse.json({ success: true, contract_version: '2.0', mode: 'OPENROUTER_DYNAMIC_STT_NEXUS_TTS', persona_id: context.profile.persona_id, identity_lock: true, primary: { ...identity.primary, locale: characteristics.locale, gender: characteristics.gender }, fallback: { ...identity.fallback, locale: characteristics.locale, gender: characteristics.gender }, stt: { primary_model: stt.primary, fallback_model: stt.fallback, locale: characteristics.locale }, tts: { provider_neutral: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PERSONAL_VOICE_REQUEST_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const deviceId = request.headers.get('x-horus-device-id');
    const key = request.headers.get('idempotency-key');
    if (!key) return NextResponse.json({ success: false, error: 'VOICE_IDEMPOTENCY_KEY_REQUIRED' }, { status: 400 });
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BYTES) return NextResponse.json({ success: false, error: 'VOICE_AUDIO_TOO_LARGE' }, { status: 413 });
    const audio = new Uint8Array(await request.arrayBuffer());
    if (!audio.length || audio.length > MAX_BYTES) return NextResponse.json({ success: false, error: 'VOICE_AUDIO_INVALID' }, { status: 400 });

    const service = getServiceSupabase();
    const context = await loadPersonalContext(service, user.id);
    await assertActiveDevice(service, user.id, deviceId);
    const voice = context.persona.voice_profile as Record<string, unknown>;
    const characteristics = { locale: context.persona.locale || 'pt-BR', gender: voice.gender === 'male' || voice.gender === 'neutral' ? voice.gender : 'female' } as const;
    const [identity, sttModels] = await Promise.all([resolveVoiceIdentity(characteristics, voice.voice), resolveSpeechToTextModel(characteristics)]);
    const audioBase64 = Buffer.from(audio).toString('base64');
    const format = (request.headers.get('content-type') || 'audio/wav').split('/')[1]?.split(';')[0] || 'wav';
    const stt = getSpeechToTextProvider();
    let transcript;
    try { transcript = await stt.transcribe({ audioBase64, format, language: characteristics.locale, modelId: sttModels.primary }); }
    catch (error) { if (sttModels.fallback === sttModels.primary) throw error; transcript = await stt.transcribe({ audioBase64, format, language: characteristics.locale, modelId: sttModels.fallback }); }

    const execution = await executePersonalText({ userId: user.id, deviceId, intent: transcript.text, idempotencyKey: `voice:${key}` });
    const text = execution.execution?.result?.text;
    if (typeof text !== 'string' || !text.trim()) throw new Error('VOICE_LLM_EMPTY_RESULT');
    const tts = getTextToSpeechProvider();
    let speech;
    try { speech = await tts.synthesize({ text, voice: identity.primary.voice, modelId: identity.primary.model, locale: characteristics.locale }); }
    catch (error) { if (identity.fallback.model === identity.primary.model) throw error; speech = await tts.synthesize({ text, voice: identity.fallback.voice, modelId: identity.fallback.model, locale: characteristics.locale }); }

    return new NextResponse(speech.audio, { status: 200, headers: { 'content-type': speech.contentType, 'cache-control': 'no-store, private', 'x-horus-persona': context.profile.persona_id, 'x-horus-stt-model': transcript.modelId, 'x-horus-tts-model': speech.modelId, 'x-horus-execution-id': String(execution.execution?.id || ''), 'x-horus-stt-request-id': transcript.requestId || '', 'x-horus-tts-request-id': speech.requestId || '' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PERSONAL_VOICE_REQUEST_FAILED';
    const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'PERSONAL_PERMISSION_REQUIRED' ? 403 : message === 'PERSONAL_DEVICE_NOT_ACTIVE' ? 403 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
