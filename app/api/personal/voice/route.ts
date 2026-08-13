import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { loadPersonalContext } from '@/lib/personal/engine';

export async function GET(request: Request) {
  try {
    const { user } = await requireStudioUser(request);
    const service = getServiceSupabase();
    const context = await loadPersonalContext(service, user.id);
    const voice = context.persona.voice_profile as Record<string, any>;
    const locale = typeof voice.locale === 'string' ? voice.locale : 'pt-BR';
    const gender = typeof voice.gender === 'string' ? voice.gender : 'female';
    return NextResponse.json({
      success: true,
      contract_version: '1.0',
      mode: 'BROWSER_NATIVE_WITH_PROVIDER_FALLBACK',
      persona_id: context.profile.persona_id,
      primary: { ...(voice.primary ?? { engine: 'browser', voice_hint: 'pt-BR-female-neutral' }), locale, gender },
      fallback: { ...(voice.fallback ?? { engine: 'browser', voice_hint: 'pt-BR-female-neutral' }), locale, gender },
      identity_lock: true,
      stt: { contract: 'VOICE_TO_TEXT', provider_neutral: true },
      tts: { contract: 'TEXT_TO_VOICE', provider_neutral: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PERSONAL_VOICE_REQUEST_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
