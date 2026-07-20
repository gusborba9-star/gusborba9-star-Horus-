import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payment';



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, amount, description, customerName, customerData } = body;

    if (!amount || !description) {
      return NextResponse.json({ error: 'Amount and description are required.' }, { status: 400 });
    }

    let result;

    if (type === 'pix') {
      result = await paymentService.generatePix(amount, description, customerName);
    } else if (type === 'boleto') {
      if (!customerData) {
        return NextResponse.json({ error: 'Customer data is required for Boleto.' }, { status: 400 });
      }
      result = await paymentService.generateBoleto(amount, description, customerData);
    } else {
      return NextResponse.json({ error: 'Invalid charge type. Use pix or boleto.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API/Charge] Request processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error processing charge.' },
      { status: 500 }
    );
  }
}
