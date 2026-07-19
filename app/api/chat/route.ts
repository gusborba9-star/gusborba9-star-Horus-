import { NextRequest } from 'next/server';
import { geminiService } from '@/lib/gemini';
import { Content } from '@google/genai';

// Vercel Edge Runtime for maximum performance and timeout limits for AI routes
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, systemInstruction } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Map messages to the format expected by the @google/genai SDK
    const history: Content[] = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content || '' }],
    }));

    // Start streaming the chat from the service
    const responseStream = await geminiService.streamChat(history, systemInstruction);

    // Create a ReadableStream to stream chunks back to the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
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
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal Server Error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
