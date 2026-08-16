import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireStudioUser } from '@/lib/studio/auth';
import { paymentService } from '@/lib/payment';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { client, user } = await requireStudioUser(request);
    const { projectId } = await params;
    const { data: payment, error } = await client
      .from('studio_project_payments')
      .select('id,project_id,revision_id,amount_brl,economic_cost_brl,pricing_snapshot,charge_id,custom_id,payment_url,efi_status,status,paid_at')
      .eq('project_id', projectId)
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`STUDIO_PAYMENT_READ_FAILED:${error.message}`);
    if (!payment) return NextResponse.json({ success: false, error: 'EFI_EXISTING_CHECKOUT_NOT_PERSISTED' }, { status: 404 });
    if (!payment.charge_id || !payment.payment_url) return NextResponse.json({ success: false, error: 'EFI_EXISTING_CHECKOUT_NOT_PERSISTED' }, { status: 409 });

    const charge = await paymentService.getCharge(String(payment.charge_id));
    if (String(charge.charge_id) !== String(payment.charge_id)) throw new Error('EFI_EXISTING_CHARGE_ID_MISMATCH');

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        project_id: payment.project_id,
        revision_id: payment.revision_id,
        amount_brl: payment.amount_brl,
        charge_id: payment.charge_id,
        payment_url: payment.payment_url,
        efi_status: charge.status ?? payment.efi_status,
        status: payment.status,
        paid_at: payment.paid_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'EFI_EXISTING_CHECKOUT_FAILED';
    const status = message === 'AUTHENTICATION_REQUIRED' ? 401 : message.includes('NOT_PERSISTED') ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
