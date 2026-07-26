import { NextRequest } from 'next/server';
import { coreEngine } from '@/lib/core';
import { Content } from '@google/genai';
import { paymentService } from '@/lib/payment';



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, persona, customRules, goal, niche, businessType, tone } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), { status: 400 });
    }

    // Extract the last user message to optionally refine
    const lastUserMessage = messages[messages.length - 1];
    let refinedText = lastUserMessage.content || '';

    if (lastUserMessage.role === 'user') {
      // 🚀 Middleware de Otimização Cognitiva (Prompt Refiner)
      refinedText = await coreEngine.refinePrompt(refinedText);
      messages[messages.length - 1].content = refinedText;
    }

    // Prepare history
    const history: Content[] = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content || '' }],
    }));

    // Generate Dynamic Meta-Prompt via Core Engine
    const systemInstruction = coreEngine.generateMetaPrompt({
      name: persona || 'Hórus Agent',
      niche: niche || 'Geral',
      businessType: businessType || 'B2B/B2C',
      goal: goal || 'Responder dúvidas do usuário.',
      tone: tone || 'Profissional',
      rules: customRules || 'Seja educado, prestativo e siga o fluxo do usuário.',
    });

    // Get the stream
    const responseStream = await coreEngine.streamChat(history, systemInstruction);

    // We create a custom readable stream to intercept and execute tools if necessary
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            // Check for function calls in the chunk
            if (chunk.functionCalls && chunk.functionCalls.length > 0) {
              for (const call of chunk.functionCalls) {
                console.log(`[API/Chat] Agent triggered tool: ${call.name}`);
                
                if (call.name === 'generateBilling') {
                  const args = call.args as any;
                  const billingInfo = await paymentService.generatePix(args.amount, args.description, args.customerName);
                  
                  // Inject the tool result into the stream as a system message for the client
                  const toolResponse = `__PIX__${JSON.stringify({amount: args.amount, brCode: billingInfo.brCode})}__`;
                  controller.enqueue(new TextEncoder().encode(toolResponse));
                } else if (call.name === 'escalateToHuman') {
                  const toolResponse = `\n[SISTEMA: Transferência de atendimento solicitada. Motivo: ${(call.args as any).reason}]`;
                  controller.enqueue(new TextEncoder().encode(toolResponse));
                } else if (call.name === 'requireLogin') {
                  const toolResponse = `__REQUIRE_LOGIN__${JSON.stringify({reason: (call.args as any).reason})}__`;
                  controller.enqueue(new TextEncoder().encode(toolResponse));
                } else if (call.name === 'suggestStudioHorus') {
                  const args = call.args as any;
                  const toolResponse = `\n__STUDIO_SUGGESTION__${JSON.stringify({ creativeType: args.creativeType, megaPrompt: args.megaPromptSuggestion })}__\n`;
                  controller.enqueue(new TextEncoder().encode(toolResponse));
                }
              }
            }
            
            // Stream standard text
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error('[API/Chat] Streaming error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('[API/Chat] Request processing error:', error);
    
    // Handle API Rate Limits and High Demand gracefully
    if (
      error?.status === 429 || error?.code === 429 || (error?.message && error.message.includes('429')) ||
      error?.status === 503 || error?.code === 503 || (error?.message && error.message.includes('503'))
    ) {
      return new Response(
        JSON.stringify({ error: 'O núcleo cognitivo está em alta demanda no momento. Por favor, aguarde alguns segundos e tente novamente.' }),
        { status: error?.status === 503 || error?.code === 503 ? 503 : 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
