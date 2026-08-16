import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireStudioUser } from '@/lib/studio/auth';
import { resolveNexusPlan } from '@/lib/nexus/core';
import { paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

function appUrl() {
  const value = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!value) throw new Error('STUDIO_PAYMENT_APP_URL_NOT_CONFIGURED');
  return value.replace(/\/$/, '');
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId } = await params;
    const service = getServiceSupabase();

    const { data: project, error: projectError } = await client
      .from('studio_projects')
      .select('id,owner_user_id,name,objective,context,requirements')
      .eq('id', projectId)
      .eq('owner_user_id', user.id)
      .single();
    if (projectError || !project) return NextResponse.json({ success: false, error: 'STUDIO_PROJECT_NOT_FOUND' }, { status: 404 });

    const { data: revision, error: revisionError } = await client
      .from('studio_project_revisions')
      .select('id,version,change_class,estimated_cost_brl,optimized_spec')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (revisionError) throw new Error(`STUDIO_REVISION_READ_FAILED:${revisionError.message}`);
    if (!revision) throw new Error('STUDIO_REVISION_REQUIRED');
    if (revision.estimated_cost_brl == null) throw new Error('STUDIO_ECONOMIC_COST_REQUIRED');

    const existingQuery = await service
      .from('studio_project_payments')
      .select('id,project_id,revision_id,amount_brl,economic_cost_brl,pricing_snapshot,charge_id,custom_id,payment_url,efi_status,status,paid_at,created_at,updated_at')
      .eq('project_id', projectId)
      .eq('revision_id', revision.id)
      .maybeSingle();
    if (existingQuery.error) throw new Error(`STUDIO_PAYMENT_READ_FAILED:${existingQuery.error.message}`);
    const existing = existingQuery.data;
    if (existing?.status === 'PAID') return NextResponse.json({ success: true, alreadyPaid: true, payment: existing });
    if (existing?.status === 'AWAITING_PAYMENT' && existing.payment_url) return NextResponse.json({ success: true, payment: existing });
    if (existing?.status === 'CREATING') return NextResponse.json({ success: false, error: 'STUDIO_PAYMENT_CREATION_IN_PROGRESS' }, { status: 409 });

    const { data: materializedRows, error: materializeError } = await service.rpc('materialize_studio_commercial_price', {
      p_economic_cost_brl: Number(revision.estimated_cost_brl),
    });
    if (materializeError || !materializedRows?.length) throw new Error(`STUDIO_COMMERCIAL_PRICE_FAILED:${materializeError?.message ?? 'EMPTY_RESULT'}`);
    const materialized = materializedRows[0] as {
      final_price_brl: number;
      policy_version: number;
      economic_cost_brl: number;
      reserve_rate: number;
      provider_fee_rate: number;
      gross_margin_rate: number;
      policy_snapshot: Record<string, unknown>;
    };

    const nexusPlan = await resolveNexusPlan(service, {
      intent: project.objective,
      context: [
        typeof project.context === 'string' ? project.context : JSON.stringify(project.context ?? {}),
        typeof project.requirements === 'string' ? project.requirements : JSON.stringify(project.requirements ?? {}),
      ],
      budgetBrl: Math.max(Number(materialized.economic_cost_brl), 0.01),
    });

    const customId = `studio:${projectId}:${revision.id}`;
    const pricingSnapshot = {
      economic_cost_brl: Number(materialized.economic_cost_brl),
      final_price_brl: Number(materialized.final_price_brl),
      policy_version: Number(materialized.policy_version),
      reserve_rate: Number(materialized.reserve_rate),
      provider_fee_rate: Number(materialized.provider_fee_rate),
      gross_margin_rate: Number(materialized.gross_margin_rate),
      policy: materialized.policy_snapshot,
      model: {
        provider_id: nexusPlan.model.providerId,
        model_id: nexusPlan.model.modelId,
        capability: nexusPlan.model.capability,
        input_price_per_million: nexusPlan.model.inputPricePerMillion,
        output_price_per_million: nexusPlan.model.outputPricePerMillion,
        quality_score: nexusPlan.model.qualityScore,
        latency_score: nexusPlan.model.latencyScore,
        reliability_score: nexusPlan.model.reliabilityScore,
        routing_source: nexusPlan.model.source,
      },
      revision_id: revision.id,
      revision_version: revision.version,
    };

    const { data: intent, error: intentError } = await service
      .from('studio_project_payments')
      .insert({
        project_id: projectId,
        revision_id: revision.id,
        owner_user_id: user.id,
        amount_brl: Number(materialized.final_price_brl),
        economic_cost_brl: Number(materialized.economic_cost_brl),
        pricing_snapshot: pricingSnapshot,
        custom_id: customId,
        status: 'CREATING',
        efi_status: 'link',
      })
      .select('id,project_id,revision_id,amount_brl,economic_cost_brl,pricing_snapshot,charge_id,custom_id,payment_url,efi_status,status,paid_at,created_at,updated_at')
      .single();

    if (intentError) {
      const { data: concurrent } = await service
        .from('studio_project_payments')
        .select('id,project_id,revision_id,amount_brl,economic_cost_brl,pricing_snapshot,charge_id,custom_id,payment_url,efi_status,status,paid_at,created_at,updated_at')
        .eq('project_id', projectId)
        .eq('revision_id', revision.id)
        .maybeSingle();
      if (concurrent?.status === 'PAID' || (concurrent?.status === 'AWAITING_PAYMENT' && concurrent.payment_url)) return NextResponse.json({ success: true, payment: concurrent });
      return NextResponse.json({ success: false, error: 'STUDIO_PAYMENT_INTENT_CONFLICT' }, { status: 409 });
    }

    try {
      const checkout = await paymentService.createOneTimePaymentLink({
        amountCents: Math.round(Number(materialized.final_price_brl) * 100),
        itemName: `Projeto Hórus Studio — ${project.name}`,
        customId,
        notificationUrl: `${appUrl()}/api/studio/billing/webhook`,
        correlationId: crypto.randomUUID(),
      });
      if (Math.abs(Number(checkout.total) - Math.round(Number(materialized.final_price_brl) * 100)) > 0) throw new Error('EFI_STUDIO_TOTAL_MISMATCH');

      const { data: saved, error: saveError } = await service
        .from('studio_project_payments')
        .update({ charge_id: checkout.chargeId, payment_url: checkout.paymentUrl, efi_status: checkout.status, status: 'AWAITING_PAYMENT', updated_at: new Date().toISOString() })
        .eq('id', intent.id)
        .eq('status', 'CREATING')
        .select('id,project_id,revision_id,amount_brl,economic_cost_brl,pricing_snapshot,charge_id,custom_id,payment_url,efi_status,status,paid_at,created_at,updated_at')
        .single();
      if (saveError || !saved?.charge_id || !saved.payment_url) throw new Error('STUDIO_PAYMENT_PERSISTENCE_FAILED');
      return NextResponse.json({ success: true, payment: saved });
    } catch (error) {
      await service.from('studio_project_payments').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('id', intent.id).eq('status', 'CREATING');
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'STUDIO_PAYMENT_CHECKOUT_FAILED';
    const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message === 'STUDIO_PROJECT_NOT_FOUND' ? 404 : message.includes('IN_PROGRESS') || message.includes('CONFLICT') ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
