import { NextResponse } from 'next/server';
import { PERSONAL_TIERS } from '@/lib/personal/catalog';

export async function GET() {
  return NextResponse.json({
    success: true,
    provisional: true,
    plans: Object.values(PERSONAL_TIERS).map((plan) => ({
      id: plan.id,
      name: plan.name,
      price_brl: plan.priceBrl,
      positioning: plan.positioning,
    })),
    note: 'Prices and tier policies are provisional and require economic validation before commercial closure.',
  });
}
