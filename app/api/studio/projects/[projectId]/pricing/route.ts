import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireStudioUser } from '@/lib/studio/auth';
import { priceStudioProject } from '@/lib/studio/economic-pricing';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireStudioUser();
  const { projectId } = await params;
  const service = getServiceSupabase();
  const { data: project, error } = await service
    .from('studio_projects')
    .select('id, owner_user_id, objective, context, requirements')
    .eq('id', projectId)
    .eq('owner_user_id', user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, error: 'STUDIO_PROJECT_READ_FAILED' }, { status: 500 });
  if (!project) return NextResponse.json({ success: false, error: 'STUDIO_PROJECT_NOT_FOUND' }, { status: 404 });

  const pricing = await priceStudioProject(service, project);
  await service.from('studio_projects').update({
    final_price_brl: pricing.finalPriceBrl,
    estimated_cost_brl: pricing.estimatedCostBrl,
    pricing_breakdown: pricing.breakdown,
    updated_at: new Date().toISOString(),
  }).eq('id', projectId).eq('owner_user_id', user.id);

  return NextResponse.json({
    success: true,
    pricing: {
      finalPriceBrl: pricing.finalPriceBrl,
      estimatedCostBrl: pricing.estimatedCostBrl,
      providerCostBrl: pricing.providerCostBrl,
      modelId: pricing.modelId,
      providerId: pricing.providerId,
      marginRate: pricing.marginRate,
      policyVersion: pricing.policyVersion,
      breakdown: pricing.breakdown,
    },
  });
}
