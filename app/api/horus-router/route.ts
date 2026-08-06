import { NextResponse } from 'next/server';

/**
 * Legacy provider-bypass endpoint.
 *
 * Provider selection/execution is owned by the canonical Hórus Core. Keeping
 * this endpoint inert prevents direct OpenRouter/Gemini execution from bypassing
 * permission, economic authorization, usage accounting and reconciliation.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'ROUTE_DEPRECATED_USE_HORUS_CORE' },
    { status: 410 },
  );
}
