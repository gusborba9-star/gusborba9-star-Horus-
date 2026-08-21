import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

const ARTIFACT_TOKEN_TTL_SECONDS = 60 * 60 * 24;

function artifactSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('ARTIFACT_SIGNING_SECRET_MISSING');
  return secret;
}

function signArtifact(resultId: string, expiresAt: number) {
  return createHmac('sha256', artifactSecret()).update(`${resultId}.${expiresAt}`).digest('hex');
}

function verifyArtifactToken(resultId: string, token: string | null) {
  if (!token) return false;
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;
  const expiresAt = Number(token.slice(separator + 1));
  const signature = token.slice(0, separator);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
  const expected = signArtifact(resultId, expiresAt);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function decodeDataUrl(value: string) {
  const match = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(value);
  if (!match) return null;
  const mediaType = match[1];
  const encoded = match[2] === ';base64';
  const payload = match[3];
  try {
    const bytes = encoded
      ? Buffer.from(payload, 'base64')
      : Buffer.from(decodeURIComponent(payload), 'utf8');
    return { mediaType, bytes };
  } catch {
    return null;
  }
}

export async function GET(request: Request, context: { params: Promise<{ resultId: string }> }) {
  try {
    const { resultId } = await context.params;
    const url = new URL(request.url);
    const signedAccess = verifyArtifactToken(resultId, url.searchParams.get('token'));
    const { client } = signedAccess ? { client: null } : await requireStudioUser(request);

    const queryClient = client ?? (await requireStudioUser(request)).client;
    const { data: result, error } = await queryClient
      .from('studio_results')
      .select('id,result_type,artifact_url,provider_metadata')
      .eq('id', resultId)
      .single();
    if (error || !result) return NextResponse.json({ success: false, error: 'RESULT_NOT_FOUND' }, { status: 404 });

    const metadata = result.provider_metadata && typeof result.provider_metadata === 'object' && !Array.isArray(result.provider_metadata)
      ? result.provider_metadata as Record<string, unknown>
      : {};
    const source = typeof metadata.source_artifact_url === 'string'
      ? metadata.source_artifact_url
      : null;
    if (!source) return NextResponse.json({ success: false, error: 'ARTIFACT_NOT_FOUND' }, { status: 404 });

    const decoded = decodeDataUrl(source);
    if (!decoded) {
      const upstream = await fetch(source, { redirect: 'follow', cache: 'no-store' });
      if (!upstream.ok || !upstream.body) return NextResponse.json({ success: false, error: `ARTIFACT_UPSTREAM_FAILED:${upstream.status}` }, { status: 502 });
      return new Response(upstream.body, {
        status: 200,
        headers: {
          'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
          'Cache-Control': 'private, max-age=31536000, immutable',
          'Content-Disposition': 'inline',
        },
      });
    }

    return new Response(decoded.bytes, {
      status: 200,
      headers: {
        'Content-Type': decoded.mediaType,
        'Content-Length': String(decoded.bytes.byteLength),
        'Cache-Control': 'private, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="horus-${result.id}.${decoded.mediaType.split('/')[1] ?? 'bin'}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ARTIFACT_LOAD_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}

export function buildArtifactAccessUrl(resultId: string, origin: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + ARTIFACT_TOKEN_TTL_SECONDS;
  const token = `${signArtifact(resultId, expiresAt)}.${expiresAt}`;
  return `${origin}/api/studio/results/${resultId}/artifact?token=${encodeURIComponent(token)}`;
}
