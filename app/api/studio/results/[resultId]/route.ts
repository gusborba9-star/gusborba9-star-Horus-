import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';
import { createArtifactToken } from '@/lib/studio/artifact-access';

function isDataUrl(value: unknown): value is string {
  return typeof value === 'string' && /^data:[^;,]+(?:;base64)?,[\s\S]*$/.test(value);
}

export async function GET(request: Request, context: { params: Promise<{ resultId: string }> }) {
  try {
    const { client } = await requireStudioUser(request);
    const { resultId } = await context.params;
    const { data, error } = await client.from('studio_results').select('*').eq('id', resultId).single();
    if (error || !data) return NextResponse.json({ success: false, error: 'RESULT_NOT_FOUND' }, { status: 404 });

    const metadata = data.provider_metadata && typeof data.provider_metadata === 'object' && !Array.isArray(data.provider_metadata)
      ? data.provider_metadata as Record<string, unknown>
      : {};
    const sourceArtifactUrl = typeof metadata.source_artifact_url === 'string'
      ? metadata.source_artifact_url
      : isDataUrl(data.artifact_url)
        ? data.artifact_url
        : null;

    const { provider_metadata: _providerMetadata, ...safeData } = data;
    const result = sourceArtifactUrl
      ? {
          ...safeData,
          artifact_url: `${new URL(request.url).origin}/api/studio/results/${data.id}/artifact?token=${encodeURIComponent(createArtifactToken(data.id))}`,
        }
      : safeData;

    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'RESULT_LOAD_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}