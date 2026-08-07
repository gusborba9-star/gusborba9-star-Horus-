import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/server';
import { allowedConnectorPermissions, connectorTokenEnv } from '@/lib/studio/connectors';
import type { StudioConnectorProvider } from '@/lib/studio/types';

const providers: StudioConnectorProvider[] = ['github','vercel','supabase','external_api'];

export async function GET() {
  try {
    await requirePermission('workspace.read');
    return NextResponse.json({ success: true, data: providers.map((provider) => ({ provider, permissions: allowedConnectorPermissions(provider), configured: Boolean(connectorTokenEnv(provider)) })) });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ success: false, error: message === 'AUTHENTICATION_REQUIRED' ? message : 'FORBIDDEN' }, { status: message === 'AUTHENTICATION_REQUIRED' ? 401 : 403 });
  }
}
