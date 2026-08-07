import { NextResponse } from 'next/server';

/**
 * Legacy payment endpoint.
 *
 * The previous implementation could generate mock financial artifacts and did
 * not participate in the canonical billing/economic authorization boundary.
 * Keep the route as an explicit tombstone until a canonical billing contract
 * owns charge creation.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'ROUTE_DEPRECATED_BILLING_CONTRACT_REQUIRED' },
    { status: 410 },
  );
}
