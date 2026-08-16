import { NextResponse } from 'next/server';
import { requireStudioUser } from '@/lib/studio/auth';

export async function GET(request: Request, context: { params: Promise<{ resultId: string }> }) {
  try {
    const { client } = await requireStudioUser(request);
    const { resultId } = await context.params;
    const { data, error } = await client.from('studio_results').select('*').eq('id', resultId).single();
    if (error || !data) return NextResponse.json({ success: false, error: 'RESULT_NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'RESULT_LOAD_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 400 });
  }
}
