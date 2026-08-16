import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireStudioUser } from '@/lib/studio/auth';
import { paymentService } from '@/lib/payment';
import { priceStudioProject } from '@/lib/studio/economic-pricing';

export const runtime = 'nodejs';

function appUrl() {
  const value = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!value) throw new Error('STUDIO_PAYMENT_APP_URL_NOT_CONFIGURED');
  return value.replace(/\/$/, '');
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireStudioUser();
  const { projectId } = await params;
  const service = getServiceSupabase();

  const { data: project, error: projectError } = await service
    .from('studio_projects')
    .select('id, owner_user_id, name, objective, context, requirements, status')
    .eq('id', projectId)
    .eq('owner_user_id', user.id)
    .maybeSingle();
  if (projectError) return NextResponse.json({ success: false, error: 'STUDIO_PROJECT_READ_FAILED' }, { status: 500 });
  if (!project) return NextResponse.json({ success: false, error: 'STUDIO_PROJECT_NOT_FOUND' }, { status: 404 });

  const { data: existing } = await service
    .from('studio_project_payments')
    .select('id, revision_id, amount_brl, estimated_cost_brl, pricing_breakdown, charge_id, payment_url, efi_status, status')
    .eq('project_id', projectId)
    .maybeSingle();

  if (existing?.status === 'PAID') return NextResponse.json({ success: true, alreadyPaid: true, payment: existing });
  if (existing?.status === 'AWAITING_PAYMENT' && existing.payment_url) return NextResponse.json({ success: true, payment: existing });
  if (existing?.status === 'CREATING') return NextResponse.json({ success: false, error: 'STUDIO_PAYMENT_CREATION_IN_PROGRESS' }, { status: 409 });

  const { data: revision, error: revisionError } = await service
    .from('studio_project_revisions')
    .select('id, version, change_class')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (revisionError) return NextResponse.json({ success: false, error: 'STUDIO_REVISION_READ_FAILED' }, { status: 500 });
  if (!revision) return NextResponse.json({ success: false, error: 'STUDIO_REVISION_REQUIRED' }, { status: 409 });

  const pricing = await priceStudioProject(service, {
    objective: project.objective,
    context: project.context,
    requirements: project.requirements,
    changeClass: revision.change_class,
  });
  const finalPrice = pricing.finalPriceBrl;
  const estimatedCost = pricing.estimatedCostBrl;
  const customId = `studio_project:${projectId}`;

  const { data: intent, error: intentError } = await service
    .from('studio_project_payments')
    .insert({
      project_id: projectId,
      revision_id: revision.id,
      owner_user_id: user.id,
      amount_brl: finalPrice,
      estimated_cost_brl: estimatedCost,
      pricing_breakdown: pricing.breakdown,
      custom_id: customId,
      status: 'CREATING',
      efi_status: 'link',
    })
    .select('id, revision_id, amount_brl, estimated_cost_brl, pricing_breakdown, charge_id, payment_url, efi_status, status')
    .single();

  if (intentError) {
    const { data: concurrent } = await service
      .from('studio_project_payments')
      .select('id, revision_id, amount_brl, estimated_cost_brl, pricing_breakdown, charge_id, payment_url, efi_status, status')
      .eq('project_id', projectId)
      .maybeSingle();
    if (concurrent?.status === 'AWAITING_PAYMENT' && concurrent.payment_url) return NextResponse.json({ success: true, payment: concurrent });
    if (concurrent?.status === 'PAID') return NextResponse.json({ success: true, alreadyPaid: true, payment: concurrent });
    return NextResponse.json({ success: false, error: 'STUDIO_PAYMENT_INTENT_CONFLICT' }, { status: 409 });
  }

  try {
    const checkout = await paymentService.createOneTimePaymentLink({
      amountCents: Math.round(finalPrice * 100),
      itemName: `Projeto Hórus Studio — ${project.name}`,
      customId,
      notificationUrl: `${appUrl()}/api/studio/billing/webhook`,
      correlationId: crypto.randomUUID(),
    });

    const { data: saved, error: saveError } = await service
      .from('studio_project_payments')
      .update({
        charge_id: checkout.chargeId,
        payment_url: checkout.paymentUrl,
        efi_status: checkout.status,
        status: 'AWAITING_PAYMENT',
        updated_at: new Date().toISOString(),
      })
      .eq('id', intent.id)
      .select('id, revision_id, amount_brl, estimated_cost_brl, pricing_breakdown, charge_id, payment_url, efi_status, status')
      .single();
    if (saveError || !saved?.charge_id || !saved.payment_url) throw new Error('STUDIO_PAYMENT_PERSISTENCE_FAILED');

    await service.from('studio_projects').update({
      final_price_brl: finalPrice,
      estimated_cost_brl: estimatedCost,
      pricing_breakdown: pricing.breakdown,
      status: 'AWAITING_PAYMENT',
      updated_at: new Date().toISOString(),
    }).eq('id', projectId).eq('owner_user_id', user.id);

    return NextResponse.json({ success: true, payment: saved });
  } catch (error) {
    await service.from('studio_project_payments').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('id', intent.id);
    const message = error instanceof Error ? error.message : 'STUDIO_PAYMENT_CREATION_FAILED';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
