import { NextResponse } from 'next/server';

/**
 * Legacy provider-bypass endpoint.
 *
 * The canonical Hórus execution path is /api/horus. This route remains as an
 * explicit tombstone so old clients fail closed instead of reaching a provider
 * without authentication/economic authorization/reconciliation.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'ROUTE_DEPRECATED_USE_HORUS_CORE' },
    { status: 410 },
  );
}
