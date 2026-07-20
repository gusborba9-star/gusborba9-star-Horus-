import { NextRequest, NextResponse } from 'next/server';



/**
 * Webhook Oficial do Hórus OS para a Efí / Fortunus.
 * Escuta notificações de pagamentos via Pix e Boleto/Cartão.
 */
export async function POST(req: NextRequest) {
  try {
    // Validar token de segurança enviado via Headers ou Query parameters (depende da configuração na Efí)
    const token = req.headers.get('x-webhook-token') || req.nextUrl.searchParams.get('token');
    
    // Na prática, você compara com o token configurado no painel da Efí/Fortunus
    const validToken = process.env.TOKEN_WEBHOOK_EFI || 'horus_dev_token';

    if (token !== validToken && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized webhook token.' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('[Webhook/Efí] Recebido payload:', JSON.stringify(payload, null, 2));

    // Processamento Assíncrono do Webhook
    // O payload da Efí (Pix) normalmente vem no formato: { pix: [ { txid, valor, horario, pagador } ] }
    if (payload.pix && Array.isArray(payload.pix)) {
      for (const pixEvent of payload.pix) {
        console.log(`[Webhook/Pix] Pagamento confirmado! TXID: ${pixEvent.txid}, Valor: ${pixEvent.valor}`);
        // TODO: Update Supabase `transactions` table status to 'paid'
        // await supabase.from('transactions').update({ status: 'paid', paidAt: new Date() }).eq('txid', pixEvent.txid);
      }
    } else if (payload.charge && payload.charge.status === 'paid') {
      // Processamento de Boleto/Cartão Fortunus
      console.log(`[Webhook/Fortunus] Pagamento confirmado! Charge ID: ${payload.charge.charge_id}`);
      // TODO: Update Supabase `transactions` table status to 'paid'
    }

    // A Efí exige que o endpoint retorne HTTP 200 OK rapidamente
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook/Efí] Erro ao processar:', error);
    // Sempre retornar 200 para webhooks da Efí para evitar retentativas infinitas (ou 500 se quiser que eles re-enviem)
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}

// Endpoint GET é exigido pela Efí durante a configuração do Webhook Pix
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 'Webhook endpoint is active.' }, { status: 200 });
}
